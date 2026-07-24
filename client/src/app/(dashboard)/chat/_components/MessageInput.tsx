import { useState, useRef } from "react";
import { Paperclip, Send, X, Mic, Square } from "lucide-react";
import { uploadChatFile } from "../../_services/chat.service";
import { useSocket } from "@/contexts/SocketContext";

export default function MessageInput({
  conversationId,
}: {
  conversationId: string;
}) {
  const { socket } = useSocket();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ⌨️ টাইপিং ইন্ডিকেটর পাঠানোর লজিক
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (socket) {
      if (e.target.value.length > 0) {
        socket.emit("typing", { conversationId }); // টাইপ শুরু করলে
      } else {
        socket.emit("stop_typing", { conversationId }); // ইনপুট মুছে দিলে
      }
    }
  };

  // 🎤 ভয়েস রেকর্ড শুরু করা
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice-message.webm", { type: "audio/webm" });
        setFile(audioFile);
        
        // স্ট্রীম বন্ধ করা যাতে ব্রাউজারের উপরে লাল ডট না জ্বলে থাকে
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for voice messages.");
    }
  };

  // ⏹️ ভয়েস রেকর্ড থামানো
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ✈️ সেন্ড বাটন ক্লিক করলে যা হবে
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return; // খালি মেসেজ পাঠাতে দেবো না

    let fileUrl = "";

    // যদি ইউজার ছবি বা পিডিএফ সিলেক্ট করে থাকে, তবে আগে আপলোড করবো
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file); // ব্যাকএন্ডে fileUploader.upload.single('file') আছে

      const res = await uploadChatFile(formData);
      if (res.success && res.data?.url) {
        fileUrl = res.data.url;
      }
      setIsUploading(false);
      setFile(null); // আপলোড শেষে সিলেক্ট করা ফাইল ক্লিয়ার করে দেবো
      setPreviewUrl(null);
    }

    // সকেটে মেসেজ ফায়ার করা (যাতে ব্যাকএন্ড রিসিভ করে ডাটাবেসে সেভ করে)
    if (socket) {
      socket.emit("send_message", {
        conversationId,
        text,
        fileUrl,
      });
      socket.emit("stop_typing", { conversationId }); // সেন্ড করলে টাইপিং অফ

      // মেসেজ সেন্ড করার পর একটা ছোট্ট সাউন্ড বাজানো (Web Audio API দিয়ে)
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // কিউট পপ সাউন্ড তৈরি করা
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        console.error("Sound play failed", e);
      }
    }

    setText(""); // ইনপুট বক্স ক্লিয়ার
  };

  return (
    <form
      onSubmit={handleSend}
      className="p-4 bg-white border-t flex items-center gap-2"
    >
      {/* 📎 ফাইল অ্যাটাচমেন্ট বাটন */}
      <label className="cursor-pointer text-gray-500 hover:text-primary p-2">
        <Paperclip className="h-5 w-5" />
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            setFile(selectedFile);
            if (selectedFile && selectedFile.type.startsWith("image/")) {
              setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
              setPreviewUrl(null);
            }
          }}
          accept="image/*,.pdf,audio/*"
        />
      </label>

      {/* 🎤 ভয়েস রেকর্ড বাটন */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-2 rounded-full transition-colors ${
          isRecording 
            ? "text-red-500 bg-red-50 hover:bg-red-100 animate-pulse" 
            : "text-gray-500 hover:text-primary hover:bg-slate-100"
        }`}
        title={isRecording ? "Stop Recording" : "Record Voice Message"}
      >
        {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      {/* ⌨️ টেক্সট ইনপুট */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          placeholder={
            isUploading 
              ? "Uploading file... ⏳" 
              : isRecording 
                ? "Recording voice message... 🎙️" 
                : "Type a message..."
          }
          disabled={isUploading || isRecording}
          className="w-full bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* ম্যাজিক: ফাইল প্রিভিউ এবং রিমুভ বাটন */}
        {file && (
          <div className="absolute -top-16 left-4 bg-white border shadow-md p-1 rounded-md flex items-center gap-2 z-10">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-12 w-12 object-cover rounded"
              />
            ) : file.type.startsWith("audio/") ? (
              <span className="text-xs text-primary px-2">🎵 Voice Note</span>
            ) : (
              <span className="text-xs text-primary px-2">📎 {file.name}</span>
            )}

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* ✈️ সেন্ড বাটন */}
      <button
        type="submit"
        disabled={isUploading || (!text.trim() && !file)}
        className="bg-primary text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        <Send className="h-4 w-4 ml-1" />{" "}
        {/* ml-1 দিয়ে আইকনটা একটু ডানে সরানো হয়েছে যাতে মাঝখানে লাগে */}
      </button>
    </form>
  );
}
