import { useEffect, useState, useRef } from "react";
import { getChatMessages } from "../../_services/chat.service";
import { useSocket } from "@/contexts/SocketContext";
import { getMyChats } from "../../_services/chat.service";
import { getUserInfo } from "@/app/(auth)/_services/user-info.service";
import Image from "next/image";
import { ArrowLeft, MoreVertical, Trash2, Smile } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollEnabled = useRef(true);

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

  // অটো-স্ক্রল লজিক
  const scrollToBottom = () => {
    if (autoScrollEnabled.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // মেসেজ লোড করা এবং সকেটে জয়েন করা
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const res = await getChatMessages(conversationId, 1);
      if (res.success && res.data) {
        setMessages(res.data);
        setPage(1);
        setHasMore(res.data.length === 20); // limit was 20
      }
      setLoading(false);
    };
    fetchMessages();

    // সকেট দিয়ে রুমে জয়েন করা
    if (socket && isConnected) {
      socket.emit("join_chat_room", { conversationId });

      // নতুন মেসেজ রিসিভ করা (সাথে সাথে স্ক্রিনে দেখানোর জন্য)
      socket.on("receive_message", (newMessage) => {
        // শুধু বর্তমান ওপেন করা চ্যাটের মেসেজই স্ক্রিনে অ্যাড করবো
        if (newMessage.conversationId === conversationId) {
          autoScrollEnabled.current = true; // নতুন মেসেজ এলে স্ক্রল ডাউন হবে
          setMessages((prev) => [...prev, newMessage]);
          // যদি মেসেজটা অন্যের হয়, তাহলে আমরা যেহেতু উইন্ডোতে আছি, সাথে সাথে seen করে দেব
          if (newMessage.senderId !== myUserId) {
            socket.emit("mark_messages_seen", { conversationId });
          }
        }
      });

      // আমার পাঠানো মেসেজ অন্যজন দেখেছে কিনা তার ইভেন্ট শোনা
      socket.on("messages_seen", (data) => {
        if (data.seenByUserId !== myUserId) {
          setMessages((prev) => prev.map((msg) => ({ ...msg, isSeen: true })));
        }
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

      // রিঅ্যাকশন রিসিভ করা
      socket.on("message_reaction_updated", (data: { messageId: string; reaction: any }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, reaction: data.reaction }
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
        socket.off("message_reaction_updated");
        socket.off("user_typing");
        socket.off("messages_seen");
      }
    };
  }, [conversationId, socket, isConnected, myUserId]);

  // মেসেজ লোড হওয়ার পর বা নতুন উইন্ডো খোলার পর আনরিড মেসেজগুলো সিন করা
  useEffect(() => {
    if (socket && isConnected && messages.length > 0 && myUserId) {
      const hasUnseenMessagesFromOther = messages.some(
        (m) => m.senderId !== myUserId && !m.isSeen
      );
      if (hasUnseenMessagesFromOther) {
        socket.emit("mark_messages_seen", { conversationId });
        // লোকালিও সিন করে দিচ্ছি যাতে UI আপডেট হয়ে যায়
        setMessages((prev) => 
          prev.map((msg) => (msg.senderId !== myUserId ? { ...msg, isSeen: true } : msg))
        );
      }
    }
  }, [messages.length, socket, isConnected, myUserId, conversationId]);

  // অনলাইন স্ট্যাটাস রিয়েল-টাইমে আপডেট করা
  useEffect(() => {
    if (socket && isConnected && otherUser?.id) {
      // প্রথমবার চেক করা যে ইউজার অলরেডি অনলাইনে আছে কিনা
      socket.emit("check_user_status", { userId: otherUser.id }, (response: any) => {
        setIsOnline(response?.isOnline || false);
        setLastSeen(response?.lastSeen ? new Date(response.lastSeen) : null);
      });

      // অন্য ইউজার অনলাইনে এলে বা চলে গেলে স্ট্যাটাস শোনা
      const handleStatusChange = (data: { userId: string; isOnline: boolean; lastSeen?: string }) => {
        if (data.userId === otherUser.id) {
          setIsOnline(data.isOnline);
          if (!data.isOnline && data.lastSeen) {
            setLastSeen(new Date(data.lastSeen));
          }
        }
      };

      socket.on("user_status_changed", handleStatusChange);

      return () => {
        socket.off("user_status_changed", handleStatusChange);
      };
    }
  }, [socket, isConnected, otherUser]);

  // মেসেজ আনসেন্ড করার ফাংশন
  const handleUnsend = (messageId: string) => {
    if (socket && isConnected) {
      socket.emit("unsend_message", { messageId, conversationId });
    }
  };

  // মেসেজে রিঅ্যাকশন দেয়ার ফাংশন
  const handleReaction = (messageId: string, reaction: string) => {
    if (socket && isConnected) {
      const existingMsg = messages.find(m => m.id === messageId);
      // চেক করবো এই ইউজারের আগে থেকেই সেম রিঅ্যাকশন আছে কিনা
      const userReaction = existingMsg?.reaction?.[myUserId];
      const newReaction = userReaction === reaction ? "" : reaction;
      
      socket.emit("react_to_message", { messageId, conversationId, reaction: newReaction });
    }
  };

  // পুরনো মেসেজ লোড করার লজিক (Infinite Scroll)
  const handleScroll = async () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight } = scrollContainerRef.current;
    
    // ম্যানুয়ালি স্ক্রল করলে অটো স্ক্রল বন্ধ করে দিচ্ছি, একদম নিচে গেলে আবার অন করবো
    if (scrollHeight - scrollTop - scrollContainerRef.current.clientHeight > 100) {
      autoScrollEnabled.current = false;
    } else {
      autoScrollEnabled.current = true;
    }

    if (scrollTop === 0 && hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      autoScrollEnabled.current = false; // পুরনো মেসেজ লোড করার সময় স্ক্রল নিচে নামবে না

      const nextPage = page + 1;
      const res = await getChatMessages(conversationId, nextPage);
      
      if (res.success && res.data) {
        // নতুন মেসেজগুলো আগে জোড়া দিচ্ছি
        setMessages((prev) => [...res.data, ...prev]);
        setPage(nextPage);
        setHasMore(res.data.length === 20); // assuming limit is 20
        
        // স্ক্রল পজিশন ঠিক রাখার জন্য একটু ট্রিকস
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newScrollHeight - scrollHeight;
          }
        });
      }
      setLoadingMore(false);
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
          ) : isOnline ? (
            <p className="text-xs text-green-500 font-medium">Online</p>
          ) : (
            <p className="text-xs text-slate-400">
              {lastSeen ? `Last seen at ${lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline"}
            </p>
          )}
        </div>
      </div>

      {/* 💬 Messages Area (মেসেজ বাবলগুলো) */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loadingMore && (
          <div className="text-center text-xs text-gray-500 py-2">
            Loading older messages...
          </div>
        )}

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
                className={`flex ${isMe ? "justify-end" : "justify-start"} group relative items-center mb-4`}
              >
                {/* অ্যাকশন বাটন (আনসেন্ড + রিঅ্যাকশন) */}
                {!msg.isDeleted && (
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${isMe ? "mr-2" : "ml-2 order-last"}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          title="React"
                        >
                          <Smile className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="flex gap-2 p-2 min-w-0">
                        {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                          <button
                            key={emoji}
                            className="text-lg hover:bg-slate-100 rounded p-1 transition-colors"
                            onClick={() => handleReaction(msg.id, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {isMe && (
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
                    )}
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
                        ) : msg.fileUrl.toLowerCase().match(/\.(mp3|wav|ogg|webm)$/) || msg.fileUrl.includes("video") ? (
                          <audio src={msg.fileUrl} controls className="mt-2 max-w-full h-10" />
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-2"
                          >
                            <Image
                              width={200}
                              height={200}
                              src={msg.fileUrl}
                              alt="Attachment"
                              className="rounded-lg border object-cover max-h-48"
                            />
                          </a>
                        ))}
                      
                      {/* রিঅ্যাকশন রেন্ডার করা (Multi-user) */}
                      {msg.reaction && Object.keys(msg.reaction).length > 0 && (
                        <div className={`absolute -bottom-3 flex gap-1 ${isMe ? "left-2" : "right-2"}`}>
                          {Object.entries(msg.reaction).map(([userId, emoji]) => (
                            <div 
                              key={userId} 
                              className="shadow bg-white rounded-full px-1 border cursor-help"
                              title={userId === myUserId ? `You reacted with ${emoji}` : `${otherUser?.name || "User"} reacted with ${emoji}`}
                            >
                              <span className="text-sm">{emoji as string}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* মেসেজ টাইম এবং Seen স্ট্যাটাস */}
                      <div
                        className={`text-[10px] mt-1 text-right flex justify-end items-center gap-1 ${
                          isMe ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isMe && (
                          <span className={msg.isSeen ? "text-blue-300 font-bold" : "text-blue-100"}>
                            {msg.isSeen ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </>
                  )}
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
