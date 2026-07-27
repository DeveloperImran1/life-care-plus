import webpush from 'web-push';
import config from '../config';
import prisma from '../shared/prisma';

// VAPID Keys সেটআপ
webpush.setVapidDetails(
  config.vapid.subject as string,
  config.vapid.publicKey as string,
  config.vapid.privateKey as string,
);

export const sendPushNotification = async (userId: string, payload: any) => {
  try {
    // ১. ইউজারের সেভ করা সাবস্ক্রিপশন ডাটাবেস থেকে খুঁজে বের করা
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return;
    }

    // ২. ইউজারের সবগুলো ডিভাইসে (যদি একাধিক থাকে) নোটিফিকেশন পাঠানো
    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (error: any) {
        // যদি ব্রাউজারের পারমিশন এক্সপায়ার হয়ে যায় (410, 404), তাহলে ডাটাবেস থেকে রিমুভ করে দেব
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Deleting expired subscription: ${sub.id}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending push notification:', error);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('Failed to process push notifications:', error);
  }
};
