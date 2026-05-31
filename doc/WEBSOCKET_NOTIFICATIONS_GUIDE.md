# 🔔 Real-Time WebSocket Notifications — সম্পূর্ণ গাইড

এই ডকুমেন্টে আমি বিস্তারিতভাবে বর্ণনা করেছি — কোথায় কী কাজ করা হয়েছে, কেন করা হয়েছে, এবং কিভাবে কাজ করে।

---

## 📦 ইনস্টল করা প্যাকেজ

### Backend (server/)
```bash
npm install socket.io @socket.io/redis-adapter
```
- **socket.io** — এটা হলো WebSocket সার্ভার। এর মাধ্যমে backend থেকে frontend-এ real-time event পাঠানো যায়।
- **@socket.io/redis-adapter** — যখন আমাদের server একাধিক instance-এ চলবে (scaling), তখন Redis adapter ব্যবহার করলে সব instance একই event পায়। এটা `ioredis` (আগে থেকেই ইনস্টল ছিল) ব্যবহার করে।

### Frontend (client/)
```bash
npm install socket.io-client
```
- **socket.io-client** — এটা হলো browser-side Socket.io client। এটা backend Socket.io server-এর সাথে connect হয়ে real-time notification receive করে।

---

## 🗄️ Phase 1: Database Schema (Prisma)

### নতুন ফাইল: `server/prisma/schema/notification.prisma`

এখানে `Notification` model তৈরি করা হয়েছে যেটা database-এ notification সংরক্ষণ করে।

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(...)
  type      NotificationType
  title     String
  message   String
  data      Json?
  priority  NotificationPriority @default(MEDIUM)
  actionUrl String?
  isRead    Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**কেন এটা দরকার?**
- Real-time notification শুধু তখনই কাজ করে যখন user online থাকে। কিন্তু user offline থাকলেও notification হারিয়ে যাবে না — database-এ সেভ থাকবে এবং পরে login করলে দেখতে পাবে।
- `isRead` ফিল্ড দিয়ে track করা হয় কোনটা পড়া হয়েছে, কোনটা হয়নি।
- `type` enum দিয়ে notification-এর ধরন চেনা যায় (appointment, payment, review ইত্যাদি)।
- `priority` দিয়ে বোঝানো হয় কোনটা জরুরি (`HIGH`) আর কোনটা সাধারণ (`LOW`)।

**Enum গুলো:**
```
NotificationType: APPOINTMENT_CREATED, APPOINTMENT_UPDATED, APPOINTMENT_CANCELED,
  PAYMENT_COMPLETED, PRESCRIPTION_CREATED, REVIEW_CREATED, SCHEDULE_UPDATED, SYSTEM_ANNOUNCEMENT

NotificationPriority: LOW, MEDIUM, HIGH
```

### পরিবর্তন: `server/prisma/schema/user.prisma`

```diff
+ notifications Notification[]
```

User model-এ `notifications` relation যোগ করা হয়েছে — এতে একটা user-এর সব notification খুঁজে পাওয়া যায়।

---

## 🔌 Phase 2: Socket.io Server Setup

### নতুন ফাইল: `server/src/socket/socket.server.ts`

এটা হলো পুরো WebSocket system-এর মূল ফাইল। এখানে ৩টা গুরুত্বপূর্ণ কাজ হয়:

#### ১. Socket.io Server তৈরি
```typescript
const io = new SocketServer(httpServer, {
  cors: { origin: [...], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});
```
- Express HTTP server-এর সাথে Socket.io attach করা হয়েছে।
- CORS সেটিং দেওয়া হয়েছে যেন frontend থেকে connect করতে পারে।

#### ২. JWT Authentication Middleware
```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwtHelpers.verifyToken(cleanToken, config.jwt.jwt_secret);
  const user = await prisma.user.findUnique({ where: { email: decoded.email } });
  socket.user = { userId: user.id, email: user.email, role: user.role };
  next();
});
```

**কেন করা হয়েছে?**
- WebSocket connection যেন authenticated হয়। যে কেউ চাইলেই connect করতে পারবে না।
- Frontend যখন connect করে, তখন auth token পাঠায়। Backend সেই token verify করে user-এর identity বের করে।
- JWT থেকে `email` ও `role` পাওয়া যায়, কিন্তু `userId` পাওয়া যায় না। তাই database থেকে `userId` lookup করা হয়।

#### ৩. Room-based Connection
```typescript
socket.join(`user:${user.userId}`);    // ব্যক্তিগত room
socket.join(`role:${user.role}`);       // role ভিত্তিক room
```

**কেন Room ব্যবহার করা হয়েছে?**
- Room হলো Socket.io-এর একটা concept যেখানে নির্দিষ্ট user বা group-কে targeted message পাঠানো যায়।
- `user:abc123` room-এ শুধু ঐ user-ই আছে — তাই তাকে specifically notification পাঠানো যায়।
- `role:admin` room-এ সব admin আছে — তাই সব admin-কে একসাথে notify করা যায়।

#### ৪. Redis Adapter (Scaling)
```typescript
const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

**কেন দরকার?**
- যদি ভবিষ্যতে multiple server instance চালানো হয় (load balancing), তাহলে Redis adapter ছাড়া একটা instance-এ connected user আরেকটা instance-এর event পাবে না। Redis adapter সব instance-এ event synchronize করে।

### পরিবর্তন: `server/src/server.ts`

```typescript
import { initializeSocket } from './socket/socket.server';

// Server start হওয়ার পরে Socket.io initialize
const io = initializeSocket(server);
(global as any).io = io;
```

**কেন `global` এ রাখা হয়েছে?**
- Socket.io `io` instance দিয়ে event emit করতে হয়। কিন্তু `io` শুধু `server.ts`-এ তৈরি হয়। অন্যান্য service (appointment, payment ইত্যাদি) থেকেও emit করতে হবে। তাই `global` এ রাখা হয়েছে যেন যেকোনো জায়গা থেকে access করা যায়।

---

## 📦 Phase 3: Notification Module

### নতুন ফাইল: `server/src/app/modules/notification/notification.service.ts`

এটা হলো notification পাঠানোর মূল logic:

#### `emitNotification(userId, payload)`
```typescript
// ১. Database-এ সংরক্ষণ
await prisma.notification.createMany({ data: [...] });

// ২. Socket.io দিয়ে real-time emit
io.to(`user:${id}`).emit('notification', payload);
```

**কেন দুইটা কাজ একসাথে?**
- Database-এ save করি যেন user offline থাকলেও পরে দেখতে পায়।
- Socket.io দিয়ে emit করি যেন online থাকলে instantly দেখতে পায়।

#### `emitToRole(role, payload)`
- নির্দিষ্ট role-এর সব user-কে notification পাঠায় (যেমন সব ADMIN-কে)।

#### `getUserNotifications(userId, options)`
- Database থেকে user-এর notification list বের করে (pagination সহ)।
- `unreadCount`-ও return করে।

#### `markAsRead(notificationId, userId)` / `markAllAsRead(userId)`
- Notification-কে "পড়া হয়েছে" হিসেবে mark করে।

### নতুন ফাইল: `server/src/app/modules/notification/notification.controller.ts`

REST API endpoint তৈরি করা হয়েছে:

| Method | Endpoint | কাজ |
|--------|----------|-----|
| `GET` | `/api/v1/notification` | আমার সব notification দেখা (paginated) |
| `PATCH` | `/api/v1/notification/:id/read` | একটা notification পড়া হিসেবে mark করা |
| `PATCH` | `/api/v1/notification/read-all` | সব notification পড়া হিসেবে mark করা |

**কেন REST API দরকার?**
- WebSocket দিয়ে শুধু real-time event আসে। কিন্তু page reload করলে বা নতুন login করলে পুরানো notification দেখাতে হলে database থেকে REST API দিয়ে fetch করতে হয়।

### নতুন ফাইল: `server/src/app/modules/notification/notification.routes.ts`

- সব authenticated user (SUPER_ADMIN, ADMIN, DOCTOR, PATIENT) এই route access করতে পারে।
- `/read-all` route-কে `/:id/read`-এর আগে রাখা হয়েছে, নইলে Express `read-all`-কে `id` parameter হিসেবে ধরে নিত।

### পরিবর্তন: `server/src/app/routes/index.ts`

```typescript
{ path: '/notification', route: NotificationRoutes }
```
Notification route register করা হয়েছে।

---

## 🔗 Phase 4: Existing Service-এ Notification Integration

### পরিবর্তন: `server/src/app/modules/appointment/appointment.service.ts`

#### `createAppointment` — Appointment তৈরি হলে:
```typescript
await NotificationService.emitNotification(doctorId, {
  type: NotificationType.APPOINTMENT_CREATED,
  title: 'New Appointment Booked',
  message: 'A new appointment has been booked with you',
  priority: 'HIGH',
});
await NotificationService.emitToRole('ADMIN', { ... });
```
- Doctor-কে জানানো হয় যে তার কাছে নতুন appointment এসেছে।
- Admin-কেও জানানো হয়।

#### `updateAppointmentStatus` — Status পরিবর্তন হলে:
- Patient ও Doctor দুজনকেই notify করা হয়।
- Cancel হলে `APPOINTMENT_CANCELED`, অন্যথায় `APPOINTMENT_UPDATED` type পাঠানো হয়।

#### `createAppointmentWithPayLater` — Pay Later appointment:
- একই ভাবে Doctor ও Admin-কে notify করা হয়।

### পরিবর্তন: `server/src/app/modules/payment/payment.service.ts`

#### `handleStripeWebhookEvent` — Payment সফল হলে:
```typescript
await NotificationService.emitNotification(appointment.patientId, {
  type: NotificationType.PAYMENT_COMPLETED,
  title: 'Payment Successful',
  message: 'Your appointment payment has been completed successfully',
});
```
- Patient-কে জানানো হয় যে তার payment সফল হয়েছে।
- Admin-কেও জানানো হয়।

### পরিবর্তন: `server/src/app/modules/prescription/prescription.service.ts`

#### `insertIntoDB` — Prescription তৈরি হলে:
- Patient-কে notify করা হয় যে Doctor তার জন্য নতুন prescription দিয়েছে।

### পরিবর্তন: `server/src/app/modules/review/review.service.ts`

#### `insertIntoDB` — Review দেওয়া হলে:
- Doctor-কে notify করা হয় যে তার জন্য নতুন review এসেছে (rating সহ)।
- Admin-কেও জানানো হয়।

### পরিবর্তন: `server/src/app/modules/auth/auth.service.ts`

#### `changePassword` — Password পরিবর্তন হলে:
```typescript
await NotificationService.emitNotification(userData.id, {
  type: NotificationType.SYSTEM_ANNOUNCEMENT,
  title: 'Password Changed',
  message: 'Your password has been changed successfully.',
  priority: 'HIGH',
});
```
- User নিজেকেই notify করা হয় security purpose-এ। `SYSTEM_ANNOUNCEMENT` type ব্যবহার করা হয়েছে।

---

## 🖥️ Phase 5: Frontend Socket.io Client Setup

### নতুন ফাইল: `client/src/contexts/SocketContext.tsx`

এটা হলো frontend-এর মূল WebSocket management ফাইল। React Context ব্যবহার করে পুরো dashboard-এ socket state share করা হয়।

#### Token কিভাবে পাওয়া হয়?
```typescript
export function SocketProvider({ children, token: propToken }: SocketProviderProps) {
```

**গুরুত্বপূর্ণ সমস্যা ও সমাধান:**
- আমাদের app-এ `accessToken` cookie `httpOnly: true` দিয়ে সেট করা হয়। এর মানে হলো browser-এর JavaScript (`document.cookie`) দিয়ে এই cookie পড়া যায় না।
- তাই token সরাসরি Server Component (dashboard layout) থেকে পড়ে prop হিসেবে পাঠানো হয়।

#### Socket URL সমস্যা
```typescript
if (typeof window !== "undefined") {
  const isDockerBackend = socketUrl.includes("backend");
  if (isDockerBackend) {
    socketUrl = socketUrl.replace("backend", window.location.hostname);
  }
}
```

**কেন এটা দরকার?**
- `.env.local`-এ আছে `NEXT_PUBLIC_SOCKET_URL="ws://backend:5000"`।
- `backend` হলো Docker container-এর নাম। এটা শুধু Docker network-এর ভিতরে resolve হয়।
- কিন্তু browser তো Docker-এর বাইরে চলে! তাই browser-এ `backend` resolve হবে না।
- সমাধান: browser-এ `backend` শব্দটাকে `window.location.hostname` (যেমন `localhost`) দিয়ে replace করা হয়।

#### প্রথমবার Notification Load (History)
```typescript
const fetchInitialNotifications = useCallback(async () => {
  const response = await getNotifications({ limit: 50 });
  // Database থেকে পুরানো notification গুলো fetch করে UI-তে দেখানো হয়
}, []);
```

**কেন দরকার?**
- WebSocket দিয়ে শুধু নতুন notification আসে। কিন্তু page reload করলে পুরানো notification হারিয়ে যেত। তাই connect হওয়ার সাথে সাথে database থেকে পুরানো notification গুলো fetch করা হয়।

#### Real-time Notification Handling
```typescript
socketInstance.on("notification", (data) => {
  setNotifications((prev) => [{ ...data, isRead: false }, ...prev]);
  toast.success(data.title, { description: data.message });
});
```
- নতুন notification এলে state-এ যোগ করা হয় এবং sonner toast দেখানো হয়।
- `priority` অনুযায়ী toast-এর ধরন পরিবর্তিত হয় (HIGH = warning, LOW = info, MEDIUM = success)।

### নতুন ফাইল: `client/src/app/(dashboard)/_services/notification.service.ts`

```typescript
"use server";
export async function getNotifications(options) { ... }
export async function markAllNotificationsAsRead() { ... }
```

**কেন Server Action ব্যবহার করা হয়েছে?**
- Next.js-এ `serverFetch` ব্যবহার করে API call করা হয়, যেটা server-side এ চলে এবং `httpOnly` cookie access করতে পারে।
- Browser থেকে সরাসরি `http://backend:5000` call করলে কাজ করবে না (Docker DNS)। কিন্তু Server Action Next.js server-এ চলে, যেটা Docker network-এর ভিতরে আছে — তাই `backend` resolve হয়।

### পরিবর্তন: `client/src/app/(dashboard)/layout.tsx`

```typescript
import { cookies } from "next/headers";

const cookieStore = await cookies();
const token = cookieStore.get("accessToken")?.value || null;

return (
  <SocketProvider token={token}>
    ...
  </SocketProvider>
);
```

**কেন এখানে token পড়া হয়?**
- এটা একটা Server Component। Server Component-এ `cookies()` function দিয়ে `httpOnly` cookie পড়া যায়।
- এই token prop হিসেবে `SocketProvider` (Client Component)-এ পাঠানো হয়, যেটা Socket.io connection-এ auth token হিসেবে ব্যবহার করে।

---

## 🔔 Phase 6: Notification UI

### পরিবর্তন: `client/src/components/layout/dashboard/NotificationDropdown.tsx`

আগে এখানে mock/hardcoded data ছিল। এখন `useSocket()` context থেকে live data আসে।

#### মূল পরিবর্তন:
```typescript
const { notifications, unreadCount, isConnected, markAllAsRead } = useSocket();
```

#### বৈশিষ্ট্য:
- **Unread Count Badge** — কতটা unread notification আছে সেটা Bell icon-এ দেখায়।
- **Connection Status** — সবুজ dot = connected, হলুদ dot = connecting/disconnected।
- **Notification Type Icons** — প্রতিটা notification type-এর জন্য আলাদা icon (Calendar, CreditCard, Star ইত্যাদি)।
- **Mark All as Read** — একটা button দিয়ে সব notification পড়া হিসেবে mark করা যায়।
- **Time Ago** — `date-fns` ব্যবহার করে "2 minutes ago", "1 hour ago" দেখানো হয়।

---

## 🔄 সম্পূর্ণ Data Flow

```
১. User একটা action করে (যেমন: Appointment তৈরি)
   │
   ▼
২. Backend API → Service Layer → Database Transaction সম্পন্ন
   │
   ▼
৩. NotificationService.emitNotification() call হয়
   ├── PostgreSQL database-এ notification সংরক্ষণ
   └── Socket.io দিয়ে 'user:{userId}' room-এ emit
       │
       ▼
৪. Frontend SocketContext 'notification' event receive করে
   ├── React state update (notification list-এ যোগ)
   ├── Sonner toast দেখানো (screen-এ popup)
   └── NotificationDropdown-এ unread count বাড়ে
```

---

## 📋 Notification Events সারণি

| Event | কখন trigger হয় | কে পায় |
|-------|-----------------|--------|
| `APPOINTMENT_CREATED` | নতুন appointment তৈরি | Doctor, Admin |
| `APPOINTMENT_UPDATED` | Appointment status পরিবর্তন | Patient, Doctor, Admin |
| `APPOINTMENT_CANCELED` | Appointment বাতিল | Patient, Doctor, Admin |
| `PAYMENT_COMPLETED` | Stripe payment সফল | Patient, Admin |
| `PRESCRIPTION_CREATED` | Doctor prescription দেয় | Patient |
| `REVIEW_CREATED` | Patient review দেয় | Doctor, Admin |
| `SYSTEM_ANNOUNCEMENT` | Password পরিবর্তন | নিজে (security) |

---

## 🛠️ যে সমস্যাগুলো সমাধান করতে হয়েছে

### সমস্যা ১: HttpOnly Cookie Browser-এ পড়া যায় না
- **সমস্যা**: `accessToken` cookie-তে `httpOnly: true` আছে, তাই `document.cookie` দিয়ে পড়া যায় না।
- **সমাধান**: Server Component (dashboard layout) থেকে `cookies()` দিয়ে পড়ে prop হিসেবে পাঠানো হয়।

### সমস্যা ২: Browser "backend" hostname resolve করতে পারে না
- **সমস্যা**: `.env`-এ `ws://backend:5000` আছে, কিন্তু `backend` শুধু Docker network-এ কাজ করে।
- **সমাধান**: Client-side code-এ `backend` কে `window.location.hostname` দিয়ে replace করা হয়।

### সমস্যা ৩: Page Reload-এ Notification হারিয়ে যায়
- **সমস্যা**: WebSocket state memory-তে থাকে, reload করলে empty হয়ে যায়।
- **সমাধান**: Socket connect হওয়ার সাথে সাথে Server Action দিয়ে database থেকে পুরানো notification fetch করা হয়।

---

## 📁 সব ফাইলের তালিকা

### নতুন ফাইল (Backend)
| ফাইল | কাজ |
|------|-----|
| `server/prisma/schema/notification.prisma` | Notification database model ও enum |
| `server/src/socket/socket.server.ts` | Socket.io server, JWT auth, room management |
| `server/src/app/modules/notification/notification.service.ts` | Notification emit ও CRUD logic |
| `server/src/app/modules/notification/notification.controller.ts` | REST API endpoints |
| `server/src/app/modules/notification/notification.routes.ts` | Route definitions |

### নতুন ফাইল (Frontend)
| ফাইল | কাজ |
|------|-----|
| `client/src/contexts/SocketContext.tsx` | Socket.io client context, connection management |
| `client/src/app/(dashboard)/_services/notification.service.ts` | Server Actions (fetch ও mark as read) |

### পরিবর্তিত ফাইল (Backend)
| ফাইল | কী পরিবর্তন হয়েছে |
|------|---------------------|
| `server/prisma/schema/user.prisma` | `notifications` relation যোগ |
| `server/src/server.ts` | Socket.io initialize ও global-এ store |
| `server/src/app/routes/index.ts` | `/notification` route register |
| `server/src/app/modules/appointment/appointment.service.ts` | Appointment create/update/cancel-এ notification |
| `server/src/app/modules/payment/payment.service.ts` | Payment success-এ notification |
| `server/src/app/modules/prescription/prescription.service.ts` | Prescription create-এ notification |
| `server/src/app/modules/review/review.service.ts` | Review create-এ notification |
| `server/src/app/modules/auth/auth.service.ts` | Password change-এ notification |

### পরিবর্তিত ফাইল (Frontend)
| ফাইল | কী পরিবর্তন হয়েছে |
|------|---------------------|
| `client/src/app/(dashboard)/layout.tsx` | Cookie থেকে token পড়ে SocketProvider-এ pass |
| `client/src/components/layout/dashboard/NotificationDropdown.tsx` | Mock data সরিয়ে live WebSocket data ব্যবহার |
