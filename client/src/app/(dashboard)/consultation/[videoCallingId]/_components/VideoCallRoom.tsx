"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useDaily,
  useLocalParticipant,
  useParticipantIds,
  DailyVideo,
  DailyAudio,
  useScreenShare,
} from "@daily-co/daily-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, MonitorUp, MonitorOff } from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { getUserInfo } from "@/app/(auth)/_services/user-info.service";

export default function VideoCallRoom({ roomUrl }: { roomUrl: string }) {
  const router = useRouter();
  const callObject = useDaily(); // DailyProvider থেকে কল অবজেক্টটা নিয়ে আসছি

  const localParticipant = useLocalParticipant(); // নিজের ডাটা
  const remoteParticipantIds = useParticipantIds({ filter: "remote" }); // অন্য যারা জয়েন করেছে তাদের আইডি

  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const { socket } = useSocket();

  useEffect(() => {
    getUserInfo().then((info) => setUserInfo(info));
  }, []);

  // স্ক্রিন শেয়ারিং হুক
  const { isSharingScreen, startScreenShare, stopScreenShare, screens } = useScreenShare();

  // ১. রুমে জয়েন করার লজিক
  useEffect(() => {
    if (!callObject) return;

    const joinRoom = async () => {
      try {
        await callObject.join({ url: roomUrl });
        setIsJoined(true);

        // নোটিফিকেশন পাঠানোর কাজটা আমরা আলাদা useEffect এ করবো, 
        // কারণ userInfo লোড হতে একটু সময় লাগতে পারে।
      } catch (err) {
        console.error("Failed to join room", err);
        setError("Failed to join the video call. Link might be expired.");
      }
    };
    joinRoom();

    return () => {
      callObject.leave(); // কম্পোনেন্ট থেকে বের হলে কল কেটে যাবে
    };
  }, [callObject, roomUrl]);

  // যদি ডাক্তার জয়েন করে, তাহলে রোগীর কাছে নোটিফিকেশন পাঠাবো
  useEffect(() => {
    // শুধুমাত্র যখন রুম জয়েন সাকসেসফুল হবে এবং ইউজারের ডেটা লোড হবে
    if (isJoined && userInfo?.role === "DOCTOR") {
      socket?.emit("doctor_joined_call", {
        videoCallingId: roomUrl.split("/").pop(),
      });
    }
  }, [isJoined, userInfo, socket, roomUrl]);

  // ২. ক্যামেরা অন/অফ করার ফাংশন
  const toggleVideo = useCallback(() => {
    if (!callObject || !localParticipant) return;
    callObject.setLocalVideo(!localParticipant.video);
  }, [callObject, localParticipant]);

  // ৩. মাইক্রোফোন মিউট/আনমিউট করার ফাংশন
  const toggleAudio = useCallback(() => {
    if (!callObject || !localParticipant) return;
    callObject.setLocalAudio(!localParticipant.audio);
  }, [callObject, localParticipant]);

  // ৪. কল কেটে দেওয়ার ফাংশন (এবং অটো-রিডাইরেক্ট)
  const leaveCall = useCallback(() => {
    if (callObject) {
      callObject.leave();
    }
    
    // রোল অনুযায়ী স্পেসিফিক ড্যাশবোর্ডে রিডাইরেক্ট করে দেওয়া
    if (userInfo?.role === "DOCTOR") {
      router.replace("/doctor/dashboard/appointments");
    } else if (userInfo?.role === "PATIENT") {
      router.replace("/patient/dashboard/my-appointments");
    } else {
      // যেহেতু আমরা window.open দিয়ে নতুন ট্যাবে ওপেন করেছিলাম, 
      // তাই কোনো কারণে রিডাইরেক্ট ফেইল করলে সরাসরি ট্যাবটা ক্লোজ করে দেব।
      window.close(); 
    }
  }, [callObject, router, userInfo]);

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>Connecting to the secure video room...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900">
      {/* 🔊 অডিও প্লেয়ার (এটা ছাড়া অন্যপাশের কথা শোনা যাবে না) */}
      <DailyAudio />

      {/* 🎥 ভিডিও স্ক্রিন এরিয়া */}
      <div className="flex-1 relative p-4 flex items-center justify-center min-h-0 overflow-hidden">
        
        {/* স্ক্রিন শেয়ার ভিডিও (যদি কেউ শেয়ার করে) */}
        {screens.length > 0 ? (
          <div className="w-full h-full rounded-2xl overflow-hidden bg-black shadow-lg relative">
            <DailyVideo
              sessionId={screens[0].session_id}
              type="screenVideo"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-md text-white text-sm backdrop-blur-sm">
              Screen Sharing Active
            </div>
          </div>
        ) : remoteParticipantIds.length > 0 ? (
          /* রিমোট (অন্য ইউজারের) ভিডিও (ফুল স্ক্রিন) */
          <div className="w-full h-full rounded-2xl overflow-hidden bg-black shadow-lg">
            <DailyVideo
              sessionId={remoteParticipantIds[0]}
              type="video"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="text-slate-400 text-center">
            <p className="text-lg font-medium">
              Waiting for the other person to join...
            </p>
          </div>
        )}

        {/* লোকাল (নিজের) ভিডিও (ছোট স্ক্রিনে ভাসমান) */}
        {localParticipant && (
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-28 h-40 md:w-48 md:h-72 bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl z-10 transition-all hover:scale-105">
            <DailyVideo
              sessionId={localParticipant.session_id}
              type="video"
              className="w-full h-full object-cover transform scale-x-[-1]" // আয়নার মতো দেখানোর জন্য flip করা
            />
          </div>
        )}
      </div>

      {/* 🎛️ কন্ট্রোল প্যানেল (ক্যামেরা, মিউট, লিভ বাটন) */}
      <div className="h-auto py-4 bg-slate-800/80 backdrop-blur-md border-t border-slate-700 flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 md:px-6">
        {/* মিউট বাটন */}
        <button
          onClick={toggleAudio}
          className={`p-3 md:p-4 rounded-full transition-all ${
            localParticipant?.audio
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {localParticipant?.audio ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </button>

        {/* ক্যামেরা বাটন */}
        <button
          onClick={toggleVideo}
          className={`p-3 md:p-4 rounded-full transition-all ${
            localParticipant?.video
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {localParticipant?.video ? (
            <Video className="h-6 w-6" />
          ) : (
            <VideoOff className="h-6 w-6" />
          )}
        </button>

        {/* স্ক্রিন শেয়ার বাটন (শুধুমাত্র ডেস্কটপের জন্য) */}
        <button
          onClick={() => (isSharingScreen ? stopScreenShare() : startScreenShare())}
          className={`hidden md:block p-3 md:p-4 rounded-full transition-all ${
            isSharingScreen
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              : "bg-slate-700 hover:bg-slate-600 text-white"
          }`}
          title={isSharingScreen ? "Stop Sharing" : "Share Screen"}
        >
          {isSharingScreen ? (
            <MonitorOff className="h-6 w-6" />
          ) : (
            <MonitorUp className="h-6 w-6" />
          )}
        </button>

        {/* লিভ বাটন */}
        <button
          onClick={leaveCall}
          className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all hover:scale-110"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
