import { useEffect, useState } from "react";
import { getMyChats } from "../../_services/chat.service";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export default function ChatSidebar({
  activeId,
  onSelectChat,
}: {
  activeId: string | null;
  onSelectChat: (id: string) => void;
}) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            onClick={() => onSelectChat(chat.id)} // ক্লিক করলে চ্যাট ওপেন হবে
            className={`flex items-start gap-3 p-4 cursor-pointer border-b transition-colors ${
              isActive
                ? "bg-primary/10 border-l-4 border-l-primary"
                : "hover:bg-slate-50"
            }`}
          >
            {/* গোল প্রোফাইল পিকচার */}
            <div className="h-10 w-10 rounded-full bg-slate-200 flex shrink-0 items-center justify-center text-slate-500 font-bold overflow-hidden">
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

            <div className="flex-1 flex-center  min-w-0">
              <div className="flex justify-between items-center mb-1 ">
                {/* আসল নাম দেখাচ্ছে */}
                <h3 className="font-medium text-sm truncate">
                  {chat.otherUser?.name || "Unknown"}
                </h3>
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
