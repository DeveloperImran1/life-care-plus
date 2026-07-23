import { useEffect, useState, useRef } from "react";
import { getChatMessages } from "../../_services/chat.service";
import { useSocket } from "@/contexts/SocketContext";
import { getMyChats } from "../../_services/chat.service";
import { getUserInfo } from "@/app/(auth)/_services/user-info.service";
import Image from "next/image";
import { ArrowLeft, Trash2, MoreVertical } from "lucide-react";
import MessageInput from "./MessageInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatWindow({
  conversationId,
  onBack,
}: {
  conversationId: string;
  onBack: () => void;
}) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [myUserId, setMyUserId] = useState<string>("");
  const [otherUser, setOtherUser] = useState<any>(null);

  // পেজ লোড হলেই নিজের আইডি এবং ওপরের মানুষের ডিটেইলস নিয়ে আসবো
  useEffect(() => {
    getUserInfo().then((info) => setMyUserId(info?.id || ""));

    getMyChats().then((res) => {
      if (res.success) {
        const currentChat = res.data.find((c: any) => c.id === conversationId);
        if (currentChat) setOtherUser(currentChat.otherUser);
      }
    });
  }, [conversationId]);

  // অটো-স্ক্রল লজিক (নতুন মেসেজ এলে নিচে স্ক্রল হয়ে যাবে)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // মেসেজ লোড করা এবং সকেটে জয়েন করা
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const res = await getChatMessages(conversationId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
      setLoading(false);
    };
    fetchMessages();

    // সকেট দিয়ে রুমে জয়েন করা
    if (socket && isConnected) {
      socket.emit("join_chat_room", { conversationId });

      // নতুন মেসেজ রিসিভ করা (সাথে সাথে স্ক্রিনে দেখানোর জন্য)
      socket.on("receive_message", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      // মেসেজ ডিলিট হওয়ার ইভেন্ট শোনা
      socket.on("message_deleted", (messageId: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isDeleted: true, text: "", fileUrl: null }
              : msg,
          ),
        );
      });

      // কেউ টাইপ করলে স্ট্যাটাস শোনা
      socket.on("user_typing", (data) => {
        setIsTyping(data.isTyping);
      });
    }

    // ক্লিনআপ (অন্য চ্যাটে গেলে পুরনো ইভেন্ট মুছে ফেলা)
    return () => {
      if (socket) {
        socket.emit("leave_chat_room", { conversationId });
        socket.off("receive_message");
        socket.off("message_deleted");
        socket.off("user_typing");
      }
    };
  }, [conversationId, socket, isConnected]);

  // মেসেজ আনসেন্ড করার ফাংশন
  const handleUnsend = (messageId: string) => {
    if (socket && isConnected) {
      socket.emit("unsend_message", { messageId, conversationId });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading messages... ⏳
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      {/* 🔝 Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        {/* শুধু মোবাইলের জন্য Back Button */}
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden shadow-sm">
          {otherUser?.photo ? (
            <Image
              width={40}
              height={40}
              src={otherUser.photo}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            otherUser?.name?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <h3 className="font-semibold text-sm">
            {otherUser?.name || "Loading..."}
          </h3>
          {isTyping ? (
            <p className="text-xs text-green-500 animate-pulse">typing...</p>
          ) : (
            <p className="text-xs text-slate-500">Online</p>
          )}
        </div>
      </div>

      {/* 💬 Messages Area (মেসেজ বাবলগুলো) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-gray-400 mt-10">
            Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === myUserId; // চেক করছি মেসেজটা আমি দিয়েছি নাকি অন্যজন

            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group relative items-center`}
              >
                {/* আনসেন্ড বাটন (শুধু নিজের মেসেজে এবং ডিলিট না হওয়া মেসেজে দেখাবে) */}
                {isMe && !msg.isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          title="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          onClick={() => handleUnsend(msg.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm relative ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none" // আমার মেসেজ ডানদিকে (blue/green)
                      : "bg-white border rounded-bl-none shadow-sm" // অন্যের মেসেজ বামদিকে (সাদা)
                  }`}
                >
                  {/* মেসেজ ডিলিট হলে */}
                  {msg.isDeleted ? (
                    <span className="italic opacity-70">
                      🚫 This message was deleted
                    </span>
                  ) : (
                    <>
                      {msg.text && <p>{msg.text}</p>}
                      {/* যদি ফাইল বা রিপোর্ট পাঠায় */}
                      {msg.fileUrl &&
                        (msg.fileUrl.toLowerCase().endsWith(".pdf") ? (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 underline mt-1 inline-block"
                          >
                            📄 View PDF Document
                          </a>
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Image
                              width={400}
                              height={400}
                              src={msg.fileUrl}
                              alt="Attachment"
                              className="mt-2 max-w-full h-auto max-h-48 rounded-md border shadow-sm object-contain"
                            />
                          </a>
                        ))}
                    </>
                  )}

                  {/* সময় ও ডাবল টিক */}
                  <div
                    className={`text-[10px] mt-1 text-right ${isMe ? "text-primary-foreground/70" : "text-gray-400"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMe && msg.isSeen && " ✓✓"}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ⌨️ Input Area (যেখানে মেসেজ লিখবে) */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
