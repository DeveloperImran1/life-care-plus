"use server";

import { serverFetch } from "@/services/http";

// ১. আমার সব চ্যাট লিস্ট আনা
export async function getMyChats() {
  try {
    const response = await serverFetch.get(`/chats`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    return { success: false, data: [] };
  }
}

// ২. নির্দিষ্ট চ্যাটের মেসেজ আনা
export async function getChatMessages(conversationId: string, page: number = 1) {
  try {
    const response = await serverFetch.get(
      `/chats/${conversationId}/messages?page=${page}&limit=20`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(
      `Failed to fetch messages for conversation ${conversationId}:`,
      error,
    );
    return { success: false, data: [] };
  }
}

// ৩. ফাইল আপলোড করা
export async function uploadChatFile(formData: FormData) {
  try {
    // Note: FormData পাঠালে Content-Type ম্যানুয়ালি সেট করতে হয় না, ব্রাউজার নিজে করে নেয়
    const response = await serverFetch.post(`/chats/upload-file`, {
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to upload chat file:", error);
    return { success: false, data: null };
  }
}

// ৪. নতুন চ্যাট শুরু করা
export async function createConversation(participantEmail: string) {
  try {
    const response = await serverFetch.post(`/chats`, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantEmail }), // ইমেইল পাঠাচ্ছি
    });
    return await response.json();
  } catch (error) {
    return { success: false, data: null };
  }
}
