"use server";

import { serverFetch } from "@/services/http";

export async function saveSubscriptionToServerAction(subscription: any) {
  try {
    const response = await serverFetch.post("/user/push-subscription", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error?.message };
  }
}
