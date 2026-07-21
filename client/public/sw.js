// client/public/sw.js

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || "/favicon.ico", // আপনি চাইলে সুন্দর কোনো আইকন দিতে পারেন
      vibrate: [100, 50, 100], // মোবাইলে ভাইব্রেশন হওয়ার জন্য
      data: {
        dateOfArrival: Date.now(),
        url: data.url || "/",
      },
    };

    // ব্রাউজারকে নোটিফিকেশন দেখাতে বলছি
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// ইউজার যখন নোটিফিকেশনে ক্লিক করবে, তখন কী হবে?
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // ক্লিক করলে নোটিফিকেশনটি রিমুভ হয়ে যাবে

  // নির্দিষ্ট লিংকে রিডাইরেক্ট করে দেবে
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
