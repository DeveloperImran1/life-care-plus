import { useEffect, useState, useRef } from "react";
import { getMyChats } from "../../_services/chat.service";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useSocket } from "@/contexts/SocketContext";

export default function ChatSidebar({
  activeId,
  onSelectChat,
}: {
  activeId: string | null;
  onSelectChat: (id: string) => void;
}) {
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // ডাটাবেস থেকে আমার সব চ্যাট লিস্ট নিয়ে আসছি
    const fetchChats = async () => {
      const res = await getMyChats();
      if (res.success && res.data) {
        setConversations(res.data);
      }
      setLoading(false);
    };
    fetchChats();
  }, []);

  // Socket Listeners for Real-time Unread Badge & Online Status
  useEffect(() => {
    if (!socket || !isConnected) return;

    // ১. সবার অনলাইন স্ট্যাটাস চেক করা
    conversations.forEach((conv) => {
      if (conv.otherUser?.id && onlineUsers[conv.otherUser.id] === undefined) {
        socket.emit("check_user_status", { userId: conv.otherUser.id }, (response: any) => {
          setOnlineUsers((prev) => ({ ...prev, [conv.otherUser.id]: response.isOnline }));
        });
      }
    });

    // ২. রিয়েল-টাইমে কেউ অনলাইনে আসলে বা গেলে আপডেট করা
    const handleStatusChange = (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => ({ ...prev, [data.userId]: data.isOnline }));
    };

    // ৩. নতুন মেসেজ আসলে Unread Count বাড়ানো (যদি চ্যাটটা অ্যাক্টিভ না থাকে)
    const handleNewMessage = (data: { conversationId: string; message: any }) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === data.conversationId) {
            // যদি চ্যাটটা ওপেন না থাকে, তবেই unreadCount বাড়বে
            const isUnread = activeId !== data.conversationId;
            return {
              ...conv,
              messages: [data.message], // লাস্ট মেসেজ আপডেট করা
              unreadCount: isUnread ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
            };
          }
          return conv;
        }).sort((a, b) => {
          // নতুন মেসেজ আসা চ্যাটটাকে লিস্টের উপরে তুলে আনা
          if (a.id === data.conversationId) return -1;
          if (b.id === data.conversationId) return 1;
          return 0;
        })
      );
    };

    // ৪. আমি কোনো চ্যাটে মেসেজগুলো সিন করলে আনরিড জিরো করে দেওয়া
    const handleMessagesSeen = (data: { conversationId: string; seenByUserId: string }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    };

    socket.on("user_status_changed", handleStatusChange);
    socket.on("new_message_notification", handleNewMessage);
    socket.on("messages_seen", handleMessagesSeen);

    return () => {
      socket.off("user_status_changed", handleStatusChange);
      socket.off("new_message_notification", handleNewMessage);
      socket.off("messages_seen", handleMessagesSeen);
    };
  }, [socket, isConnected, conversations.length, activeId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading chats... ⏳
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((chat) => {
        // চ্যাট লিস্টে দেখানোর জন্য শুধু লাস্ট মেসেজটা ধরছি
        const lastMessage = chat.messages?.[0];
        const isActive = chat.id === activeId;

        return (
          <div
            key={chat.id}
            onClick={() => {
              // চ্যাটে ক্লিক করলে সাথে সাথে আনরিড জিরো করে দিচ্ছি UI-তে
              setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
              onSelectChat(chat.id);
            }} 
            className={`flex items-start gap-3 p-4 cursor-pointer border-b transition-colors ${
              isActive
                ? "bg-primary/10 border-l-4 border-l-primary"
                : "hover:bg-slate-50"
            }`}
          >
            {/* গোল প্রোফাইল পিকচার ও অনলাইন ডট */}
            <div className="relative h-10 w-10 shrink-0">
              <div className="h-full w-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                {chat.otherUser?.photo ? (
                  <Image
                    width={40}
                    height={40}
                    src={chat.otherUser.photo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  chat.otherUser?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              {/* Green dot for online status */}
              {onlineUsers[chat.otherUser?.id] && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                {/* আসল নাম দেখাচ্ছে */}
                <h3 className="font-medium text-sm truncate">
                  {chat.otherUser?.name || "Unknown"}
                </h3>
                {chat.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 truncate">
                  {lastMessage
                    ? lastMessage.text || "📷 Attachment"
                    : "Started a conversation"}
                </p>
                <span className="text-[10px]  text-gray-400 shrink-0">
                  {lastMessage
                    ? formatDistanceToNow(new Date(lastMessage.createdAt), {
                        addSuffix: true,
                      }) // ২ মিনিট আগে, ৫ দিন আগে.. এভাবে দেখাবে
                    : ""}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
