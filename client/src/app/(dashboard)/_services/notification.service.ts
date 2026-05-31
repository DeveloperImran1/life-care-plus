"use server";

import { serverFetch } from "@/services/http";

export async function getNotifications(options: { limit?: number; page?: number } = {}) {
  try {
    const { limit = 20, page = 1 } = options;
    const response = await serverFetch.get(`/notification?limit=${limit}&page=${page}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, data: [] };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const response = await serverFetch.patch(`/notification/read-all`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false };
  }
}
