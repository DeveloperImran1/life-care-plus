# 💬 In-App Chat System: Feature & UI Requirements

এই ডকুমেন্টে ডাক্তার এবং রোগীর মধ্যে 1-to-1 চ্যাট সিস্টেমের বিস্তারিত ফিচার এবং UI ফ্লো আলোচনা করা হয়েছে। এটা রিভিউ করার পর আমরা ইমপ্লিমেন্টেশনে যাব।

## 🎯 ১. Chat Button কোথায় থাকবে? (Access Points)

### পেশেন্টদের (রোগীদের) জন্য:

১. **Doctor Profile Page:** কোনো ডাক্তারের প্রোফাইল দেখার সময় "Book Appointment"-এর পাশেই একটা **"Message"** বাটন থাকবে (যাতে আগে থেকে কিছু জিজ্ঞেস করা যায় বা রিপোর্ট পাঠানো যায়)।
২. **Appointments List:** ড্যাশবোর্ডে পেশেন্টের আপকামিং বা পাস্ট অ্যাপয়েন্টমেন্ট লিস্টের পাশে একটা **"Chat"** আইকন থাকবে।
৩. **Dashboard Sidebar/Navbar:** ড্যাশবোর্ডের সাইডবারে **"Messages"** নামে একটা মেনু থাকবে, যেখানে ক্লিক করলে সে সব ডাক্তারের লিস্ট পাবে যাদের সাথে তার কথা হয়েছে।

### ডাক্তারদের জন্য:

১. **Appointments/Patients List:** ডাক্তারের ড্যাশবোর্ডে আজকের বা আপকামিং রোগীদের লিস্টের পাশে **"Message Patient"** বাটন থাকবে।
২. **Dashboard Sidebar:** ডাক্তারদের সাইডবারেও **"Messages"** নামে মেনু থাকবে, যেখানে ক্লিক করলে সে সব রোগীদের লিস্ট পাবে।

---

## 🎨 ২. UI Layout (চ্যাটের ডিজাইন কেমন হবে?)

আমরা WhatsApp Web বা Messenger-এর মতো ক্লাসিক টু-প্যান (Two-pane) লেআউট ব্যবহার করব।

### Desktop View (Two-Pane Layout):

- **Left Sidebar (Conversation List):**
  - এখানে সব রানিং চ্যাটের লিস্ট থাকবে।
  - ইউজারদের প্রোফাইল ছবি, নাম এবং সর্বশেষ মেসেজ (Last Message) এর প্রিভিউ দেখাবে।
  - আনরিড মেসেজ থাকলে ছোট্ট একটা ব্যাজ (যেমন: `2`) দেখাবে।
- **Right Sidebar (Active Chat Room):**
  - **Header:** উপরে ডাক্তার/রোগীর নাম, ছবি এবং স্ট্যাটাস ("Online" বা "Typing...") থাকবে।
  - **Message Body:**
    - নিজের পাঠানো মেসেজ: ডানদিকে (Right aligned) সবুজ বা ব্লু কালারের বাবল।
    - অন্যের মেসেজ: বামদিকে (Left aligned) গ্রে কালারের বাবল।
    - ফাইল/রিপোর্ট: ইমেজের প্রিভিউ বা পিডিএফ ফাইলের ডাউনলোড বাটন।
  - **Footer (Input Area):**
    - টেক্সট ইনপুট বক্স।
    - ফাইল অ্যাটাচমেন্ট (📎) বাটন (ছবি/পিডিএফ সিলেক্ট করার জন্য)।
    - সেন্ড বাটন (✈️)।

### Mobile View:

- ছোট স্ক্রিনে শুধু লিস্ট দেখা যাবে। কোনো একটি চ্যাটে ক্লিক করলে সেটা ফুল-স্ক্রিন চ্যাট উইন্ডোতে ওপেন হবে (Back বাটনসহ)।

---

## 🛠️ ৩. Core Features (কী কী ফিচার থাকবে?)

১. **1-to-1 Real-time Messaging:** রিলোড ছাড়াই মেসেজ আদান-প্রদান (Socket.io)।
২. **File Sharing (Medical Reports/Prescriptions):**

- ইউজার 📎 আইকনে ক্লিক করে ফাইল আপলোড করতে পারবে।
- ফাইল প্রথমে Multer + Cloudinary তে যাবে, তারপর লিংক চ্যাটে শেয়ার হবে।
  ৩. **Typing Indicator:** কেউ টাইপ করা শুরু করলে অপর প্রান্তে _"Doctor is typing..."_ বা _"Patient is typing..."_ অ্যানিমেশন দেখাবে।
  ৪. **Auto-Scroll to Bottom:** নতুন মেসেজ আসলে বা চ্যাট ওপেন করলে অটোমেটিক স্ক্রলবার নিচে চলে যাবে (React `useRef` ব্যবহার করে)।
  ৫. **Read Receipts:** মেসেজ সিন (Seen) হলে মেসেজের নিচে ছোট্ট ডাবল-টিক (✓✓) দেখাবে।
  ৬. **Delete Message:** ভুল করে কোনো মেসেজ পাঠালে ইউজার সেটা ডিলিট করতে পারবে ("This message was deleted" দেখাবে)।
  ৭. **Chat History:** পুরনো মেসেজগুলো ডাটাবেস থেকে পেজিনেশন (Infinite Scroll বা Load More) আকারে লোড হবে।

---

## 🗄️ ৪. Database Architecture (Prisma Schema Preview)

ডাটাবেসে আমরা নিচের মতো করে দুটো নতুন টেবিল বানাবো:

```prisma
model Conversation {
  id            String    @id @default(uuid())
  participantIds String[] // [doctorId, patientId]
  messages      Message[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String       // User ID of the sender
  text           String?      // Message content (optional if fileUrl exists)
  fileUrl        String?      // Cloudinary URL for image/pdf
  isSeen         Boolean      @default(false)
  isDeleted      Boolean      @default(false) // মেসেজ ডিলিট করার জন্য
  createdAt      DateTime     @default(now())
}
```

---

## 🚀 ৫. Implementation Flow (কীভাবে কাজ শুরু করব?)

১. **Phase 1:** Prisma Schema আপডেট করে Database Migration করা।
২. **Phase 2:** Backend-এ চ্যাট হিস্ট্রি আনা এবং ফাইল আপলোডের (Multer) REST API বানানো।
৩. **Phase 3:** Backend-এ Socket.io ইভেন্ট (`join_room`, `send_message`, `typing`) সেটআপ করা।
৪. **Phase 4:** Frontend-এ সুন্দর UI বানানো এবং সকেট কানেক্ট করে ম্যাজিক শুরু করা!

---

**📝 তোমার জন্য টাস্ক:**
উপরের প্ল্যানটা রিভিউ করো। এখানে কোনো বাটন অন্য কোথাও সরাতে চাইলে, বা নতুন কোনো ফিচার (যেমন: মেসেজ ডিলিট অপশন) অ্যাড করতে চাইলে আমাকে জানাও। সব ঠিক থাকলে আমরা **Phase 1** থেকে ইমপ্লিমেন্টেশন শুরু করবো!
