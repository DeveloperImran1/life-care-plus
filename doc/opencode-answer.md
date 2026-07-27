# Appointment Booking & Payment — Complete Flow Analysis

> Generated on: 2026-07-21

---

## 1. Overall Architecture

```
Patient Browser                     Server (Express 5)                Stripe / PostgreSQL / Redis
     │                                    │                                  │
     ├── Browse Doctors (Public) ─────────┤                                  │
     ├── Select Schedule ─────────────────┤                                  │
     ├── Confirm Booking ─────────────────┤                                  │
     │   ├── Pay Now ──► POST /appointment ──► Create Appointment ──► DB     │
     │   │                    └── Create Stripe Session ──► Stripe           │
     │   │                    └── Return paymentUrl ──► Redirect to Stripe   │
     │   │                         └── User pays on Stripe.com               │
     │   │                              └── Stripe Webhook ──► POST /webhook │
     │   │                                   └── Update Payment Status ──► DB│
     │   │                                   └── Notify User (Socket.io)     │
     │   │                                   └── Redirect to /payment/success│
     │   │                                                                   │
     │   └── Pay Later ──► POST /appointment/pay-later ──► Create (UNPAID)   │
     │                        └── Redirect to My Appointments                │
     │                        └── Later: Click Pay Now ──► initiatePayment() │
     │                             └── POST /:id/initiate-payment            │
     │                                  └── Stripe session returned          │
     │                                                                       │
     ├── Admin: View/Manage All Appointments                                 │
     ├── Doctor: View/Change Status of Assigned Appointments                 │
     └── Cron: Every 5min ──► Cancel unpaid appointments >30 min old         │
```

---

## 2. Complete Booking & Payment Flow (Step by Step)

### Step 1: Browse Doctors (Public)

- **Route:** `/doctors`
- **File:** `client/src/app/(public)/doctors/page.tsx`
- **Components:** `DoctorCard.tsx`, `DoctorGrid.tsx`
- Users can search/filter doctors by specialty, name, etc.

### Step 2: Select Doctor & Schedule

- **Route:** `/doctors/doctor/[id]` (Doctor Profile)
- **File:** `client/src/app/(public)/doctors/_components/BookAppointmentDialog.tsx`
- Clicking "Book Appointment" on a doctor card opens `BookAppointmentDialog`
- Dialog fetches available schedules (grouped by date)
- User selects a time slot
- Clicking "Continue" navigates to: `/patient/dashboard/book-appointment/{doctorId}/{scheduleId}`

### Step 3: Booking Confirmation Page

- **Route:** `/patient/dashboard/book-appointment/[doctorId]/[scheduleId]`
- **File:** `client/src/app/(dashboard)/patient/dashboard/book-appointment/[doctorId]/[scheduleId]/page.tsx`
- **Component:** `AppointmentConfirmation.tsx`
- Displays:
  - Doctor info (name, designation, specialties, qualification, experience, fee)
  - Schedule info (date, time, countdown)
  - Important info list (arrive early, cancellation policy, etc.)
- **Two booking options:**

#### Option A: Pay Now (Default Flow)

1. User clicks "Pay Now & Book Appointment"
2. `createAppointment()` called → `POST /api/v1/appointment/`
3. **Server-side (`appointment.service.ts:createAppointment`):**
   - Validates patient exists
   - Validates doctor exists & not deleted
   - Validates schedule slot is available (`isBooked: false`)
   - Starts Prisma `$transaction`:
     - Creates `Appointment` record (status: SCHEDULED, paymentStatus: UNPAID)
     - Updates `DoctorSchedules.isBooked = true`
     - Creates `Payment` record (amount: doctor's appointment fee, status: UNPAID)
     - Creates Stripe Checkout Session
   - Returns `paymentUrl` (Stripe Checkout URL)
   - Invalidates Redis cache
   - Emits real-time notifications to Doctor + Admin via Socket.io
4. Client receives `paymentUrl` → calls `window.location.replace(paymentUrl)` → redirects to Stripe
5. **Stripe Checkout:**
   - Currency: BDT
   - Payment methods: Card
   - Session metadata: `appointmentId`, `paymentId`
   - Success URL: `/settings/payment/success`
   - Cancel URL: `/patient/dashboard/my-appointments`

#### Option B: Pay Later

1. User clicks "Book Now, Pay Later"
2. `createAppointmentWithPayLater()` called → `POST /api/v1/appointment/pay-later`
3. **Server-side (`appointment.service.ts:createAppointmentWithPayLater`):**
   - Same validation as Pay Now
   - Creates Appointment + Payment (UNPAID)
   - **No Stripe session created**
   - Returns appointment data
4. Client redirects to `/patient/dashboard/my-appointments`
5. Appointment shows "Payment Pending" badge with "Pay Now" button

### Step 4: Stripe Webhook (Payment Confirmation)

- **Route:** `POST /webhook` (raw body, before JSON parser)
- **File:** `server/src/app.ts` (line 39-43)
- **Controller:** `PaymentController.handleStripeWebhookEvent`
- **Service:** `PaymentService.handleStripeWebhookEvent`
- **Events handled:**
  - `checkout.session.completed`:
    - Idempotency check via `stripeEventId`
    - Transaction: Update `appointment.paymentStatus → PAID`, `payment.status → PAID`
    - Store full session data in `paymentGatewayData`
    - Store `stripeEventId` for idempotency
    - Emit `PAYMENT_COMPLETED` notification to patient + admins
  - `checkout.session.expired`: Logged (cleanup by cron)
  - `payment_intent.payment_failed`: Logged

### Step 5: Payment Success Page

- **Route:** `/settings/payment/success`
- **File:** `client/src/app/(dashboard)/settings/payment/success/page.tsx`
- **Component:** `PaymentSuccessContent.tsx`
- Shows green checkmark animation
- "Payment Successful!" message
- Auto-redirects to `/patient/dashboard/my-appointments` after countdown
- Calls `revalidateTag('my-appointments')` to refresh data

### Step 6: My Appointments (Patient View)

- **Route:** `/patient/dashboard/my-appointments`
- **Component:** `AppointmentsList.tsx`
- Shows all patient appointments as cards
- Each card shows: Status badge, Payment badge, Doctor info, Schedule, Countdown
- Actions: "View Details", "Pay Now" (for unpaid), Cancel (for scheduled)

### Step 7: Appointment Detail

- **Route:** `/patient/dashboard/my-appointments/[id]`
- **Component:** `AppointmentDetails.tsx`
- Full appointment details
- Prescription view (if provided)
- Review submission (if completed + paid)
- Pay Now button (for unpaid)

### Step 8: Admin Management

- **Route:** `/admin/dashboard/appointments-management`
- **Components:** Table, Filter, View Detail Dialog, Change Status Dialog
- Filters: Status, Payment Status, Patient Email, Doctor Email
- Actions: View details, Change status

### Step 9: Doctor Management

- **Route:** `/doctor/dashboard/appointments`
- **Components:** Table, Detail Dialog, Change Status Dialog
- Shows assigned appointments
- Can change status: SCHEDULED → INPROGRESS → COMPLETED / CANCELED

### Background Jobs

1. **Cron (every 5 min):** `cancelUnpaidAppointments()`
   - Cancels appointments >30 min old with UNPAID payment
   - Deletes associated payment records
   - Frees up doctor schedules
2. **Cron (every 1 min, testing mode):** SMS reminders for upcoming appointments
3. **Rate Limiter:** `paymentLimiter` — max 10 payment attempts per hour per IP

---

## 3. Backend API Endpoints

| Method | Endpoint                                   | Auth                       | Description                                             |
| ------ | ------------------------------------------ | -------------------------- | ------------------------------------------------------- |
| GET    | `/api/v1/appointment/`                     | SUPER_ADMIN, ADMIN         | List all appointments (with filters)                    |
| GET    | `/api/v1/appointment/my-appointment`       | PATIENT, DOCTOR            | List my appointments                                    |
| POST   | `/api/v1/appointment/`                     | PATIENT                    | Book appointment + pay now                              |
| POST   | `/api/v1/appointment/pay-later`            | PATIENT                    | Book appointment, pay later                             |
| POST   | `/api/v1/appointment/:id/initiate-payment` | PATIENT                    | Initiate Stripe payment for existing unpaid appointment |
| PATCH  | `/api/v1/appointment/status/:id`           | SUPER_ADMIN, ADMIN, DOCTOR | Change appointment status                               |
| POST   | `/webhook`                                 | Public (Stripe signature)  | Stripe webhook endpoint                                 |

---

## 4. Database Models

### Appointment (`appointments`)

| Field            | Type                   | Notes                                         |
| ---------------- | ---------------------- | --------------------------------------------- |
| `id`             | UUID                   | Primary key                                   |
| `patientId`      | FK → Patient           |                                               |
| `doctorId`       | FK → Doctor            |                                               |
| `scheduleId`     | FK → Schedule (unique) |                                               |
| `videoCallingId` | UUID                   | For video consultation                        |
| `status`         | Enum                   | SCHEDULED / INPROGRESS / COMPLETED / CANCELED |
| `paymentStatus`  | Enum                   | PAID / UNPAID (denormalized)                  |
| Indexes          |                        | 12 composite indexes for query performance    |

### Payment (`payments`)

| Field                | Type                      | Notes                            |
| -------------------- | ------------------------- | -------------------------------- |
| `id`                 | UUID                      | Primary key                      |
| `appointmentId`      | FK → Appointment (unique) | One-to-one                       |
| `amount`             | Float                     | Doctor's appointment fee         |
| `transactionId`      | UUID                      | Unique, generated server-side    |
| `status`             | Enum                      | PAID / UNPAID                    |
| `paymentGatewayData` | JSON                      | Full Stripe session data         |
| `stripeEventId`      | String?                   | For webhook idempotency (unique) |

---

## 5. What Is Complete ✅

### Server Side

- ✅ Appointment CRUD (create, read, update, list)
- ✅ Pay Now flow (create appointment + Stripe Checkout)
- ✅ Pay Later flow (create without payment)
- ✅ Initiate payment for existing unpaid appointments
- ✅ Stripe webhook handling (signature verification, idempotency)
- ✅ Appointment status management (by doctor, admin, super admin)
- ✅ Real-time notifications (Socket.io) for booking, payment, status change
- ✅ Push notifications (Web Push API) for status change
- ✅ Background cron: cancel unpaid appointments (>30 min)
- ✅ SMS reminder cron (testing mode)
- ✅ Rate limiting on payment endpoints (10/hour)
- ✅ Redis caching for appointment lists
- ✅ Proper Prisma indexes for query performance
- ✅ Role-based access (Patient, Doctor, Admin, Super Admin)
- ✅ Stripe Checkout Session creation in BDT currency

### Client Side

- ✅ Public doctor listing with search/filter
- ✅ Book appointment dialog with schedule selection
- ✅ Booking confirmation page with doctor + schedule details
- ✅ Pay Now button → redirects to Stripe
- ✅ Pay Later button → creates without payment
- ✅ My Appointments list for patients
- ✅ Appointment detail page
- ✅ Payment success page with auto-redirect
- ✅ Patient can pay for unpaid appointment from list/detail
- ✅ Admin appointments management with filters
- ✅ Admin can change appointment status
- ✅ Doctor appointments management
- ✅ Doctor can change appointment status
- ✅ Review submission (for completed + paid appointments)
- ✅ Prescription view
- ✅ Appointment countdown timer
- ✅ Responsive UI with status badges

---

## 6. What Is Missing / Incomplete ❌

### Server Side

- ❌ **Refund functionality**: Migration file named "add_refund_fields" exists but actually dropped everything (misnamed/destructive migration). No refund logic in code.
- ❌ **Payment admin routes**: `payment.routes.ts` is empty — no admin payment management endpoints (e.g., view all transactions, manual refund, etc.)
- ❌ **`GET /api/v1/payment/status/:appointmentId`** endpoint: Client calls this route (`getPaymentStatus()`) but the route does NOT exist on the server (no matching route in payment.routes.ts or appointment.routes.ts)
- ❌ **Payment validation file**: No `payment.validation.ts` exists
- ❌ **Payment interface file**: No `payment.interface.ts` exists
- ❌ **No support for multiple payment methods**: Currently only Stripe card payments
- ❌ **No invoice/receipt generation**: After payment, no receipt is generated
- ❌ **Doctor not notified about pending payments**: Pay-later flow only notifies about booking, not about later payment
- ❌ **`/pay-later` route registered twice** in `appointment.routes.ts` (lines 33-38 and 53-57) — duplicate

### Client Side

- ❌ **`getPaymentStatus()` service calls non-existent route**: `GET /api/v1/payment/status/:appointmentId` is not implemented on server
- ❌ **Missing loading/error states in some components**
- ❌ **No payment history page**: No dedicated page showing all past payments/transactions
- ❌ **No cancellation reason input**: When canceling an appointment, no reason is collected
- ❌ **Doctor appointment detail dialog prescription section**: Might not be fully integrated (placeholder types exist)
- ❌ **Review validation file**: `_validations/index.ts` is a placeholder

### General

- ❌ **No test frameworks or test files** for any of these features
- ❌ **Stripe webhook secret not configured check**: Returns 500 if missing, but doesn't provide clear setup guidance
- ❌ **No mobile push notifications** (only Web Push for in-browser)
- ❌ **Cron job for reminders hardcoded to look 100 days ahead** (clearly testing mode)

---

## 7. Key Files Reference

### Server

| File                                                           | Purpose                                           |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `server/src/app/modules/appointment/appointment.routes.ts`     | Appointment API routes                            |
| `server/src/app/modules/appointment/appointment.controller.ts` | Appointment request handlers                      |
| `server/src/app/modules/appointment/appointment.service.ts`    | Appointment business logic (~613 lines)           |
| `server/src/app/modules/appointment/appointment.validation.ts` | Zod validation schemas                            |
| `server/src/app/modules/appointment/appointment.constant.ts`   | Filterable fields, cache keys                     |
| `server/src/app/modules/appointment/appointment.cron.ts`       | SMS reminder cron job                             |
| `server/src/app/modules/payment/payment.routes.ts`             | Payment routes (empty)                            |
| `server/src/app/modules/payment/payment.controller.ts`         | Stripe webhook handler                            |
| `server/src/app/modules/payment/payment.service.ts`            | Webhook event processing                          |
| `server/src/lib/stripe.ts`                                     | Stripe client initialization                      |
| `server/src/app/middlewares/rateLimiter.ts`                    | Rate limiters (including payment)                 |
| `server/prisma/schema/appointment.prisma`                      | Appointment, Payment, Prescription, Review models |
| `server/prisma/schema/enums.prisma`                            | PaymentStatus, AppointmentStatus enums            |
| `server/src/app.ts`                                            | Webhook route registration, cron jobs             |

### Client

| File                                                                                                   | Purpose                           |
| ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `client/src/services/http.ts`                                                                          | Core server fetch utility         |
| `client/src/app/(public)/doctors/_components/BookAppointmentDialog.tsx`                                | Schedule selection dialog         |
| `client/src/app/(dashboard)/patient/dashboard/book-appointment/[doctorId]/[scheduleId]/page.tsx`       | Booking confirmation page         |
| `client/src/app/(dashboard)/patient/dashboard/my-appointments/_components/AppointmentConfirmation.tsx` | Confirm + pay/pay-later component |
| `client/src/app/(dashboard)/patient/dashboard/my-appointments/_services/index.ts`                      | Appointment server actions        |
| `client/src/app/(dashboard)/patient/dashboard/my-appointments/_components/AppointmentsList.tsx`        | My appointments list              |
| `client/src/app/(dashboard)/patient/dashboard/my-appointments/_components/AppointmentDetails.tsx`      | Appointment detail view           |
| `client/src/app/(dashboard)/settings/payment/_services/index.ts`                                       | Payment server actions            |
| `client/src/app/(dashboard)/settings/payment/success/page.tsx`                                         | Stripe return URL page            |
| `client/src/app/(dashboard)/admin/dashboard/appointments-management/page.tsx`                          | Admin appointment management      |
| `client/src/app/(dashboard)/doctor/dashboard/appointments/page.tsx`                                    | Doctor appointment management     |

---

## 8. Fixes Applied (2026-07-21)

### Root Cause of UNPAID Issue

Stripe sends webhook **asynchronously** after payment. User is redirected to `/settings/payment/success` immediately after Stripe checkout, but the webhook may not have arrived yet. By the time user lands on my-appointments, the `paymentStatus` is still UNPAID.

### Changes Made

#### Server: `payment.service.ts`

- Added `getPaymentStatus(appointmentId, user)` — fetches payment status for an appointment (with role-based access control)
- Added `getAllFromDB(filters, options)` — lists all payments for admin with pagination
- Added `getById(id)` — gets a single payment by ID with full appointment details

#### Server: `payment.controller.ts`

- Added `getPaymentStatus` — handles `GET /api/v1/payment/status/:appointmentId`
- Added `getAllFromDB` — handles `GET /api/v1/payment/`
- Added `getById` — handles `GET /api/v1/payment/:id`

#### Server: `payment.service.ts` — Added Redis cache invalidation in webhook handler

- After successful `checkout.session.completed`, now also invalidates Redis cache patterns:
  - `appointments:*` — all appointment list caches
  - `doctor_schedules:*` — all doctor schedule caches
- **This was a root cause** of UNPAID display: webhook updated DB, but Redis still served old cached data
- The `getPaymentStatus` endpoint reads directly from DB (no cache), so polling correctly detects PAID

#### Server: `payment.routes.ts` (was empty, now has routes)

| Method | Endpoint                                | Auth                                | Description                       |
| ------ | --------------------------------------- | ----------------------------------- | --------------------------------- |
| GET    | `/api/v1/payment/`                      | ADMIN, SUPER_ADMIN                  | List all payments                 |
| GET    | `/api/v1/payment/status/:appointmentId` | PATIENT, DOCTOR, ADMIN, SUPER_ADMIN | Get payment status by appointment |
| GET    | `/api/v1/payment/:id`                   | ADMIN, SUPER_ADMIN                  | Get payment by ID                 |

#### Server: `appointment.service.ts`

- `createAppointment()` now also returns `appointmentId` alongside `paymentUrl`
- Client stores this in `sessionStorage` for polling on success page

#### Server: `appointment.routes.ts`

- Removed duplicate `/pay-later` route registration (was registered twice)

#### Client: `AppointmentConfirmation.tsx`

- Before redirecting to Stripe checkout, stores `paymentAppointmentId` in `sessionStorage`

#### Client: `PaymentSuccessContent.tsx`

- On page load, retrieves `paymentAppointmentId` from `sessionStorage`
- Polls `GET /api/v1/payment/status/:appointmentId` every 2 seconds (up to 30 seconds)
- Shows visual status: "Confirming payment with server..." / "✓ Payment confirmed" / "Payment status will update shortly"
- When status is PAID → revalidates cache immediately
- Redirects to my-appointments after 5 seconds regardless

### How the Fix Works (3 Layers)

```
Before (broken):
  Stripe Checkout → /settings/payment/success → /my-appointments
                                               → paymentStatus: UNPAID
                                                 (webhook async + Redis cached old data)

After (fixed):
  1. Webhook → DB updated (PAID) + REDIS CACHE INVALIDATED (appointments:*)
  2. Success page → polls GET /payment/status/:appointmentId (direct DB, no cache)
                  → detects PAID
  3. On redirect → revalidateTag("my-appointments") expires Next.js cache
                 → window.location.href = full page reload (bypasses router cache)
                 → fresh render → PAID ✓
```
