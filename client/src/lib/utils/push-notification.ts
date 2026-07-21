// client/src/lib/utils/push-notification.ts
import { serverFetch } from "@/services/http";
import { saveSubscriptionToServerAction } from "./push.action";

// VAPID Public Key কে ব্রাউজারের বোধগম্য (Uint8Array) ফরমেটে কনভার্ট করার ফাংশন
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Client Action: ব্রাউজার থেকে পারমিশন নেওয়ার জন্য
export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported by this browser.");
    return { success: false, message: "Push notifications are not supported" };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered successfully");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return { success: false, message: "Permission denied" };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error("VAPID public key is missing in .env");
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    console.log("Push Subscription Object:", subscription);

    // 🌟 ফিক্স: Subscription কে Plain JSON Object এ কনভার্ট করা
    const subscriptionJSON = subscription.toJSON();

    // ৫. Server Action কল করে ব্যাকএন্ডে সাবস্ক্রিপশন পাঠানো!
    const backendResult =
      await saveSubscriptionToServerAction(subscriptionJSON);
    console.log("Backend Response:", backendResult);

    return { success: backendResult?.success, subscription };
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return { success: false, error };
  }
}
