🧠 Redis Learning Roadmap: 20 Questions
Phase 1: The Basics (What & Why) ১. Redis আসলে কী এবং কেন এটি অন্যান্য সাধারণ ডেটাবেস (যেমন PostgreSQL/MongoDB) থেকে আলাদা? ২. Caching (ক্যাশিং) জিনিসটা কী এবং ক্যাশিংয়ের জন্য কেন সবাই Redis কেই বেছে নেয়? ৩. Redis-কে "In-memory database" বলা হয়। তাহলে কারেন্ট চলে গেলে বা সার্ভার রিস্টার্ট হলে কি Redis-এর সব ডেটা মুছে যায়? ৪. Redis কি শুধুই ক্যাশিংয়ের জন্য ব্যবহার করা হয়, নাকি এটি দিয়ে পুরো অ্যাপ্লিকেশনের মেইন ডেটাবেসও বানানো যায়?

Phase 2: Core Data Structures (How data is stored) ৫. Redis-এ ডেটা সেভ করার জন্য মূল Data Types গুলো কী কী? (Strings, Hashes, Lists, Sets) ৬. Strings: Redis-এ সাধারণ Key-Value ডেটা কীভাবে সেট এবং রিড করতে হয়? (SET, GET) ৭. Hashes: কোনো অবজেক্ট বা ইউজারের ডেটা (যেমন: name, age, email) সেভ করার জন্য Hashes কীভাবে কাজ করে? (HSET, HGET) ৮. Lists: Redis-এ Lists কীভাবে কাজ করে এবং এটি দিয়ে কীভাবে মেসেজ Queue তৈরি করা যায়? (LPUSH, RPOP) ৯. Sets & Sorted Sets: লিডারবোর্ড বা র‍্যাংকিং সিস্টেম বানাতে Sorted Sets কেন বেস্ট? (ZADD)

Phase 3: Core Caching Concepts ১০. TTL (Time To Live) কী? একটি ক্যাশ ডেটা কীভাবে নির্দিষ্ট সময় পর অটোমেটিক ডিলিট করা যায়? (EXPIRE) ১১. Cache Hit এবং Cache Miss বলতে কী বোঝায়? একটি রিয়েল-লাইফ উদাহরণ কী হতে পারে? ১২. ক্যাশ করতে করতে Redis-এর মেমোরি (RAM) যদি ফুল হয়ে যায়, তখন কী ঘটে? (Eviction Policies কী?)

Phase 4: Node.js/Express Integration (Practical) ১৩. Node.js এর সাথে Redis কানেক্ট করার জন্য কোন প্যাকেজটি বেস্ট (ioredis নাকি redis) এবং কেন? ১৪. Express.js অ্যাপ্লিকেশনে একটি ডাটাবেস কোয়েরি (যেমন: All Doctors List) কীভাবে ক্যাশ করতে হয়? (লজিক ফ্লো) ১৫. Cache Invalidation: ডেটাবেস আপডেট হলে (যেমন: নতুন একজন ডাক্তার যুক্ত হলে), ক্যাশ করা পুরনো ডেটা কীভাবে আপডেট বা ডিলিট করতে হয়?

Phase 5: Advanced Real-world Uses (Beyond Caching) ১৬. Redis Pub/Sub কী? এটি দিয়ে কীভাবে রিয়েল-টাইম চ্যাট বা সকেট নোটিফিকেশন সিস্টেম বানানো যায়? ১৭. Rate Limiting কী? API-কে হ্যাকার বা স্প্যামিং থেকে বাঁচাতে Redis দিয়ে কীভাবে Rate Limiting তৈরি করা হয়? ১৮. BullMQ বা Redis ব্যবহার করে কীভাবে ব্যাকগ্রাউন্ড জব (যেমন ব্যাকগ্রাউন্ডে হাজার মানুষকে ইমেইল পাঠানো) ম্যানেজ করা হয়? ১৯. Session Management-এর ক্ষেত্রে JWT (JSON Web Token) এর বদলে অনেক বড় কোম্পানি কেন Redis ব্যবহার করে?

Phase 6: Best Practices & Architecture ২০. প্রোডাকশনে Redis ব্যবহার করার বেস্ট প্র্যাকটিসগুলো কী কী এবং Redis Cluster / Sentinel কী কাজে লাগে?
