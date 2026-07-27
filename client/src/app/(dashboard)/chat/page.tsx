"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ChatSidebar from "./_components/ChatSidebar";
import ChatWindow from "./_components/ChatWindow";

// মেইন লজিকটা এই কম্পোনেন্টে
function ChatContent() {
  const searchParams = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // URL-এ conversationId থাকলে সেটাকে অ্যাক্টিভ করে দেবে
  useEffect(() => {
    const convId = searchParams.get("conversationId");
    if (convId) {
      setActiveConversationId(convId);
    }
  }, [searchParams]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full bg-white rounded-lg shadow-sm overflow-hidden border">
      <div
        className={`${activeConversationId ? "hidden md:flex" : "flex"} w-full md:w-1/3 border-r flex-col`}
      >
        <div className="p-4 border-b bg-slate-50">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <ChatSidebar
          activeId={activeConversationId}
          onSelectChat={(id) => setActiveConversationId(id)}
        />
      </div>

      <div
        className={`${!activeConversationId ? "hidden md:flex" : "flex"} w-full md:w-2/3 flex-col bg-slate-50/50`}
      >
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            onBack={() => setActiveConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="h-20 w-20 bg-slate-200 rounded-full mb-4 flex items-center justify-center text-3xl shadow-inner">
              💬
            </div>
            <p className="text-lg font-medium text-slate-500">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js-এ useSearchParams ব্যবহার করলে Suspense-এ র‍্যাপ (wrap) করতে হয়
export default function ChatPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading Chat...</div>}
    >
      <ChatContent />
    </Suspense>
  );
}
