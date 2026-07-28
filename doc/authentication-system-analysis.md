# অথেনটিকেশন সিস্টেম — সম্পূর্ণ বিশ্লেষণ

> এই ডকুমেন্টটি Life Care Plus প্রোজেক্টের অথেনটিকেশন সিস্টেমের ফ্লো, আর্কিটেকচার, এবং উন্নতির সম্ভাবনা ব্যাখ্যা করে। ভাষা: বাংলা।

---

## ১. আর্কিটেকচার ওভারভিউ

```
লগিন পেজ (client)
    │
    ▼
Server Action (use server) ──► HTTP Fetch ──► Backend API (Express)
    │                                                   │
    │◄────────────────── Set-Cookie headers ◄───────────┘
    │
    ▼
Parse Set-Cookie → Cookie Store এ set → JWT Decode → Role Check → Redirect
```

**গুরুত্বপূর্ণ:** ক্লায়েন্ট-সাইডে কোনো React Context, Jotai, বা State Management নেই। অথ স্টেট সম্পূর্ণভাবে **কুকি + মিডলওয়্যার (proxy.ts)** নির্ভর।

---

## ২. সার্ভার সাইড — API এন্ডপয়েন্ট

### Base: `/api/v1/auth`

| এন্ডপয়েন্ট           | মেথড | বিবরণ                                            |
| -------------------- | ---- | ------------------------------------------------ |
| `/login`             | POST | ইমেইল/পাসওয়ার্ড লগিন, `authLimiter` প্রয়োগ       |
| `/refresh-token`     | POST | রিফ্রেশ টোকেন ব্যবহার করে নতুন accessToken      |
| `/change-password`   | POST | অথেনটিকেটেড ইউজার পাসওয়ার্ড পরিবর্তন             |
| `/forgot-password`   | POST | ইমেইলে রিসেট লিংক পাঠায়                          |
| `/reset-password`    | POST | Token-based অথবা needPasswordChange ইউজারের জন্য |
| `/me`                | GET  | লগিন করা ইউজারের তথ্য (কুকি থেকে টোকেন নিয়ে)     |
| `/google`            | GET  | Google OAuth শুরু                                |
| `/google/callback`   | GET  | Google OAuth callback                            |
| `/facebook`          | GET  | Facebook OAuth শুরু                              |
| `/facebook/callback` | GET  | Facebook OAuth callback                          |
| `/logout`            | POST | টোকেন ব্ল্যাকলিস্ট + কুকি ক্লিয়ার                |

### User creation: `/api/v1/user`

| এন্ডপয়েন্ট           | মেথড  | বিবরণ                                   |
| -------------------- | ----- | --------------------------------------- |
| `/create-admin`      | POST  | সুপার অ্যাডমিন/অ্যাডমিন তৈরি            |
| `/create-doctor`     | POST  | ডাক্তার তৈরি                            |
| `/create-patient`    | POST  | পেশেন্ট তৈরি (public, no auth required) |
| `/me`                | GET   | নিজের প্রোফাইল দেখা                     |
| `/update-my-profile` | PATCH | নিজের প্রোফাইল আপডেট                    |
| `/push-subscription` | POST  | Push notification সাবস্ক্রিপশন সেভ      |

---

## ৩. জেডব্লিউটি টোকেন

### generateToken (server/src/helpers/jwtHelpers.ts)

```typescript
// Payload: { email, role }
// Algorithm: HS256
// Access token secret: JWT_SECRET, expires: EXPIRES_IN (7d)
// Refresh token secret: REFRESH_TOKEN_SECRET, expires: REFRESH_TOKEN_EXPIRES_IN (1y)
```

- **Access Token** → ৭ দিন (ডিফল্ট), কুকিতে সংরক্ষিত
- **Refresh Token** → ১ বছর, কুকিতে সংরক্ষিত
- **Reset Password Token** → ৫ মিনিট, URL query parameter এ পাঠানো হয়

### Token Payload

```typescript
{ email: string, role: "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT" }
```

**লক্ষ্যণীয়:** টোকেনে `userId` বা `name` নেই, শুধুমাত্র `email` এবং `role` আছে। এজন্য `getMe` এ প্রতিবার `email` দিয়ে ইউজার খুঁজতে হয়।

---

## ৪. কুকি ম্যানেজমেন্ট

### সার্ভার সাইড (server/src/helpers/cookieSet.ts)

```typescript
res.cookie(key, token, {
  secure: true, // শুধু HTTPS এ
  httpOnly: true, // ক্লায়েন্ট JS পড়তে পারবে না
  sameSite: "none", // Cross-site অনুমতি
  maxAge, // মেয়াদ
});
```

### ক্লায়েন্ট সাইড — Login (login-user.service.ts)

- সার্ভার পাঠানো `Set-Cookie` হেডার থেকে value + attributes পার্স করে
- `token-handlers.service.ts` এর `setCookie()` কল করে কুকি সেট করে
- অপশন: `secure: true, httpOnly: true, sameSite: from server (default "none")`

### ক্লায়েন্ট সাইড — Social Login (SocialLoginHandler.tsx)

- সার্ভার redirect করে `?token=...&refreshToken=...` সহ
- ক্লায়েন্ট-সাইড কম্পোনেন্ট URL থেকে টোকেন নিয়ে `setCookie()` কল করে
- অপশন: `secure: true, sameSite: "lax"` (httpOnly উহ্য -> ডিফল্ট true)
- **সমস্যা:** টোকেন URL-এ দেখা যায় (সিকিউরিটি ইস্যু)

### Social Login Cookie Consistency Issue

- Credential login: `sameSite: "none"` (সার্ভার থেকে আসা, login-user.service.ts কপি করে)
- Social login: `sameSite: "lax"` (SocialLoginHandler.tsx হার্ডকোডেড)

---

## ৫. Credential Login Flow (সম্পূর্ণ)

```
1. ইউজার লগিন ফর্ম ফিলাপ করে → Submit
2. LoginForm (client) → useActionState → loginUser (server action)
3. loginUser:
   a. ফর্ম ডাটা ভ্যালিডেশন (Zod)
   b. serverFetch.post("/auth/login")
   c. serverFetch → getNewAccessToken() কল (skip for this endpoint)
   d. সার্ভারে: auth.controller → auth.service.loginUser
      - Login Attempt চেক (৫ বার ভুল পাসওয়ার্ডে ৩০ মিনিট লক)
      - ইউজার খুঁজে (email + ACTIVE status)
      - bcrypt.compare পাসওয়ার্ড
      - LoginAttempt লগ
      - সফল হলে: পূর্বের failed attempt মুছে
      - JWT generate (access + refresh)
      - cookieSet (res, "accessToken", ..., "refreshToken", ...)
   e. রেসপন্স Set-Cookie হেডারসহ ফিরে
4. loginUser (client):
   a. Set-Cookie হেডার পার্স
   b. setCookie("accessToken", ...) এবং setCookie("refreshToken", ...)
   c. JWT ডিকোড → role বের
   d. needPasswordChange চেক
   e. রিডাইরেক্ট চেক:
      - needPasswordChange true → /reset-password
      - redirectTo আছে ও role-compatible → redirectTo?loggedIn=true
      - না হলে → getDefaultDashboardRoute(role)?loggedIn=true
   f. revalidatePath("/", "layout")
```

---

## ৬. Google/Facebook OAuth Flow

```
1. ইউজার SocialLoginButton এ ক্লিক করে
2. window.location.href = `${API_URL}/auth/google?redirect=/patient/dashboard`
3. ব্রাউজার ব্যাকএন্ডে চলে যায় → Google লগিন পেজ
4. Google সফল হলে → /auth/google/callback → passport.authenticate('google')
5. passport.config এ:
   - ইউজার না থাকলে: new User + Patient + AuthAccount (GOOGLE) তৈরি
   - ইউজার থাকলে কিন্তু google auth না থাকলে: AuthAccount যোগ
6. socialLoginCallback কন্ট্রোলার:
   - JWT generate (access + refresh)
   - cookieSet (res, ...)
   - redirectTo = req.query.state (passport state param এ redirect URL ছিল)
   - res.redirect(`${FRONTEND_URL}/${redirectTo}?token=${accessToken}&refreshToken=${refreshToken}`)
7. SocialLoginHandler (client):
   - URL থেকে token ও refreshToken পড়ে
   - window.history.replaceState দিয়ে URL পরিষ্কার
   - setCookie কল করে
   - toast.success দেখায়
   - router.replace("/") + 500ms পর window.location.reload()
```

**সমস্যা:** টোকেন URL query parameter এ আসে — browser history te theke jay, referrer header diye leak korte pare।

---

## ৭. Token Refresh Flow

### কোথায় কল হয়?

1. **proxy.ts (Middleware):** প্রতিটি রিকুয়েস্টের শুরুতে
2. **http.ts (serverFetch):** `/auth/refresh-token` ছাড়া প্রতিটি API কলের আগে

### getNewAccessToken() — ৪টি কেস

```
Case 1: accessToken + refreshToken দুটোই নেই → logged out
Case 2: accessToken আছে এবং valid → no refresh needed
Case 3: accessToken নেই/invalid + refreshToken নেই → logged out
Case 4: accessToken নেই/invalid + refreshToken আছে → API call to refresh
```

### Proxy-তে Loop Prevention

- Token রিফ্রেশ হলে → `?tokenRefreshed=true` সহ একই URL এ redirect
- দ্বিতীয় রিকুয়েস্টে `hasTokenRefreshedParam` ডিটেক্ট করে প্যারামিটার সরিয়ে normal process

### http.ts এ Recursion Protection

```typescript
if (endpoint !== "/auth/refresh-token") {
  await getNewAccessToken();
}
```

---

## ৮. ক্যাশিং ও রিভ্যালিডেশন

| Action                              | Revalidation                                |
| ----------------------------------- | ------------------------------------------- |
| Login success                       | `revalidatePath("/", "layout")`             |
| Registration                        | auto-login → same as login                  |
| Password reset (email)              | `revalidateTag("user-info", { expire: 0 })` |
| Password reset (needPasswordChange) | `revalidateTag("user-info", { expire: 0 })` |
| Profile update                      | `revalidateTag("user-info", { expire: 0 })` |
| Logout                              | `revalidatePath("/", "layout")`             |

### user-info.service.ts

```typescript
fetch("/auth/me", { cache: "no-store" }); // সবসময় fresh data
```

---

## ৯. মিসিং / ইমপ্রুভমেন্টের সম্ভাবনা

### ক্রিটিক্যাল ইস্যু

| #   | সমস্যা                                                                                                                                                                     | সুপারিশ                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Social login এ টোকেন URL-এ** — `/callback?token=...&refreshToken=...` URL-এ টোকেন দেখা যায়, browser history, referrer header থেকে লিক হতে পারে                           | সার্ভার থেকে cookies সেট করেই redirect করা উচিত, টোকেন URL-এ না দিয়ে। অথবা `state` প্যারামিটার ব্যবহার করে একটি temporary code (PKCE-like) তৈরি করে redirect করা |
| 2   | **http.ts এ প্রতিটি API call-এ JWT verify** — `getNewAccessToken()` প্রতিটি রিকুয়েস্টের আগে কল হয়, যা JWT verify করে এবং প্রয়োজনে refresh API কল করে — অপ্রয়োজনীয় লেটেন্সি | শুধুমাত্র 401 রেসপন্স পেলে refresh করা উচিত                                                                                                                      |
| 3   | **Login এ Double Cookie Set** — সার্ভার `cookieSet()` করে AND ক্লায়েন্ট server action `setCookie()` করে — রিডান্ডেন্ট                                                      | ক্লায়েন্ট সরাসরি API response body থেকে token নিয়ে cookie set করলে Set-Cookie header parse করার প্রয়োজন নেই                                                      |

### মিডিয়াম ইস্যু

| #   | সমস্যা                                                                                                                                                                       | সুপারিশ                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 4   | **RefreshToken কন্ট্রোলারে duplicated MaxAge logic** — `refreshToken` কন্ট্রোলারে `getTokenMaxAge` এর লজিক আবার manually লেখা                                                | `getTokenMaxAge` হেলপারটি রিইউজ করা উচিত                                           |
| 5   | **getMe কন্ট্রোলারে confusing parameter name** — `const user = req.cookies` (parameter name 'user' but it's actually cookies)                                                | নাম পরিবর্তন করে `const { accessToken } = req.cookies` করা উচিত                    |
| 6   | **sameSite inconsistency** — credential login: `sameSite: "none"`, social login: `sameSite: "lax"`                                                                           | একই করা উচিত                                                                       |
| 7   | **কুকি তৈরি ও HTTP response-এ cookieSet redundant** — login-success response এ `cookieSet()` করে Set-Cookie পাঠায়, আবার server action parse করে পুনরায় cookieStore.set() করে | কেবল server action-ই cookie set করলে response থেকে Set-Cookie header বাদ দেওয়া যায় |
| 8   | **Token Blacklist cleanup নেই** — `tokenBlacklist` টেবিলে expired tokens জমে থাকে                                                                                            | Cron job যোগ করে মেয়াদোত্তীর্ণ এন্ট্রি মুছতে হবে                                   |
| 9   | **Failed login attempts cleanup শুধু success-এ** — কখনো সফল না হলে failed attempts জমতেই থাকে                                                                                | Cron job বা TTL-based cleanup দরকার                                                |
| 10  | **Login lockout message information leak** — `"Try again after ..."` এ lockout window এর exact time বলে দেয়                                                                  | জেনেরিক মেসেজ দিন যেমন "Too many attempts. Please try again later."                |

### লো ইস্যু / রিফ্যাক্টর

| #   | সমস্যা                                                                                                                    | সুপারিশ                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 11  | **`auth` middleware token source inconsistency** — কিছু জায়গায় `Authorization` header, কিছু জায়গায় `Cookie`               | শুধু Authorization header বা শুধু Cookie — একটিই সোর্স ব্যবহার করা |
| 12  | **Supar admin role missing in some middlewares** — রুট গুলোতে SUPER_ADMIN চেক করা হয়নি                                    | auth() তে SUPER_ADMIN যোগ করুন যেখানে প্রয়োজন                      |
| 13  | **`any` type-এর ব্যাপক ব্যবহার** — auth service, controller, middleware এ `any` টাইপ                                      | TypeScript strict type interface তৈরি করুন                         |
| 14  | **এরর হ্যান্ডলিং inconsistency** — কখনো `ApiError`, কখনো `Error` throw করা হয়                                             | সব জায়গায় `ApiError` ব্যবহার করুন                                  |
| 15  | **Facebook callback-এ duplicate logic** — `fb_code_...` caching logic টি `socialLoginCallback`-এও duplicate               | শুধু একটি জায়গায় রাখুন                                             |
| 16  | **Auth module ফোল্ডারে `emailSender.ts`** — emailSender একটি generic utility, auth module এ না রেখে `helpers/` এ রাখা ভাল | সরিয়ে ফেলুন                                                        |
| 17  | **getMe এ `req.cookies` দিয়ে whole cookies object পাঠানো** — auth.service.ts এ `user.accessToken` বের করতে হয়             | শুধু `accessToken` পাঠান                                           |

---

## ১০. ডাটা মডেল (Prisma) — Auth-Related

### User

```prisma
model User {
  id                String
  email             String     (unique)
  password          String?    (nullable — social users এ পাসওয়ার্ড থাকে না)
  role              UserRole   (SUPER_ADMIN | ADMIN | DOCTOR | PATIENT)
  needPasswordChange Boolean   (default true for admin/doctor, false for patient)
  status            UserStatus (ACTIVE | BLOCKED | DELETED)
  authAccounts      AuthAccount[]
  admin             Admin?
  doctor            Doctor?
  patient           Patient?
  loginAttempts     LoginAttempt[]
  blacklistedTokens TokenBlacklist[]
}
```

### AuthAccount

```prisma
model AuthAccount {
  id         String
  userId     String
  provider   String   (CREDENTIALS | GOOGLE | FACEBOOK)
  providerId String
  user       User
}
```

### LoginAttempt & TokenBlacklist

```prisma
model LoginAttempt {
  id         String
  email      String
  ipAddress  String
  userAgent  String
  success    Boolean
  attemptAt  DateTime  (default now())
}

model TokenBlacklist {
  id        String
  token     String   (unique)
  userId    String
  reason    String
  expiresAt DateTime
  createdAt DateTime  (default now())
}
```

---

## ১১. এনভায়রনমেন্ট ভেরিয়েবলস

| Variable                                    | ব্যবহার                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `JWT_SECRET`                                | Access token sign/verify                                 |
| `REFRESH_TOKEN_SECRET`                      | Refresh token sign/verify                                |
| `EXPIRES_IN`                                | Access token lifetime (ডিফল্ট: `7d`)                     |
| `REFRESH_TOKEN_EXPIRES_IN`                  | Refresh token lifetime (ডিফল্ট: `1y`)                    |
| `RESET_PASS_TOKEN`                          | Reset password token secret                              |
| `RESET_PASS_TOKEN_EXPIRES_IN`               | Reset token lifetime (ডিফল্ট: `5m`)                      |
| `RESET_PASS_LINK`                           | Frontend reset password URL                              |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth                                             |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET`   | Facebook OAuth                                           |
| `EXPRESS_SESSION_SECRET`                    | Express session for Passport                             |
| `NEXT_PUBLIC_BASE_API_URL`                  | Client-side API base URL                                 |
| `FRONTEND_URL`                              | Server-side frontend URL (used in CORS, social redirect) |
| `NODE_ENV`                                  | Controls cookie `secure`/`sameSite` behavior             |

---

## ১২. ফাইল লোকেশন

| ফাইল                        | পাথ                                                         |
| --------------------------- | ----------------------------------------------------------- |
| Auth routes                 | `server/src/app/modules/auth/auth.routes.ts`                |
| Auth controller             | `server/src/app/modules/auth/auth.controller.ts`            |
| Auth service                | `server/src/app/modules/auth/auth.service.ts`               |
| Passport config             | `server/src/config/passport.ts`                             |
| Auth middleware             | `server/src/app/middlewares/auth.ts`                        |
| JWT helpers                 | `server/src/helpers/jwtHelpers.ts`                          |
| Cookie set helper           | `server/src/helpers/cookieSet.ts`                           |
| Token maxAge helper         | `server/src/helpers/getTokenMaxAge.ts`                      |
| User service                | `server/src/app/modules/user/user.service.ts`               |
| User controller             | `server/src/app/modules/user/user.controller.ts`            |
| User routes                 | `server/src/app/modules/user/user.routes.ts`                |
| Client proxy (middleware)   | `client/src/proxy.ts`                                       |
| Login server action         | `client/src/app/(auth)/_services/login-user.service.ts`     |
| Auth server actions         | `client/src/app/(auth)/_services/auth.service.ts`           |
| Logout server action        | `client/src/app/(auth)/_services/logout-user.service.ts`    |
| Cookie handlers             | `client/src/app/(auth)/_services/token-handlers.service.ts` |
| User info service           | `client/src/app/(auth)/_services/user-info.service.ts`      |
| HTTP helper                 | `client/src/services/http.ts`                               |
| Auth utils                  | `client/src/lib/auth/auth-utils.ts`                         |
| JWT handlers (client)       | `client/src/lib/auth/jwt-handlers.ts`                       |
| Login form                  | `client/src/app/(auth)/_components/LoginForm.tsx`           |
| Register form               | `client/src/app/(auth)/_components/RegisterForm.tsx`        |
| Social login button         | `client/src/app/(auth)/_components/SocialLoginButton.tsx`   |
| Social login handler        | `client/src/app/(auth)/_components/SocialLoginHandler.tsx`  |
| Auth token hook             | `client/src/hooks/useAuthToken.ts`                          |
| Social login service (new)  | `client/src/app/(auth)/_services/social-login.service.ts`   |
| Email sender helper (moved) | `server/src/helpers/emailSender.ts`                         |

---

## ১৩. সম্পন্ন করা রিফ্যাক্টর ও ইমপ্রুভমেন্ট

### Phase 1 — emailSender সরানো, getMe ফিক্স, getTokenMaxAge রিইউজ, lockout মেসেজ ফিক্স

| #   | ফাইল                                                                               | পরিবর্তন                                                                                                                  |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `server/src/app/modules/auth/emailSender.ts` → `server/src/helpers/emailSender.ts` | ফাইলটি `auth` মডিউল থেকে `helpers` ফোল্ডারে সরানো হয়েছে। ইম্পোর্ট আপডেট: `email.worker.ts`                                |
| 2   | `server/src/app/modules/auth/auth.controller.ts` (getMe)                           | `const user = req.cookies` → `const accessToken = req.cookies.accessToken` — প্যারামিটার নাম ও ব্যবহার পরিষ্কার করা হয়েছে |
| 3   | `server/src/app/modules/auth/auth.controller.ts` (refreshToken)                    | manual MaxAge parsing সরিয়ে `getTokenMaxAge()` হেলপার রিইউজ করা হয়েছে (৩০+ লাইন কোড কমেছে)                                |
| 4   | `server/src/app/modules/auth/auth.service.ts` (loginUser)                          | lockout message এ exact time leak সরিয়ে জেনেরিক মেসেজ দেওয়া হয়েছে। unused `lockoutEndsAt` ভেরিয়েবল মুছে ফেলা হয়েছে        |

### Phase 2 — ক্রন জব: টোকেন ব্ল্যাকলিস্ট ও লগিন অ্যাটেম্পট ক্লিনআপ

| #   | ফাইল                | পরিবর্তন                                                                                    |
| --- | ------------------- | ------------------------------------------------------------------------------------------- |
| 5   | `server/src/app.ts` | নতুন cron job যোগ করা হয়েছে: প্রতিদিন ৩:০০ AM এ মেয়াদোত্তীর্ণ `tokenBlacklist` এন্ট্রি মুছে |
| 6   | `server/src/app.ts` | নতুন cron job যোগ করা হয়েছে: প্রতিদিন ৩:৩০ AM এ ৭ দিনের পুরনো `loginAttempt` এন্ট্রি মুছে   |

### Phase 3 — sameSite কনসিসটেন্সি

| #   | ফাইল                                                       | পরিবর্তন                                                                                                                          |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 7   | `client/src/app/(auth)/_components/SocialLoginHandler.tsx` | Social login cookie-তে `sameSite: "lax"` → `sameSite: "none"` এবং `httpOnly: true` যোগ করা হয়েছে — credential login-এর সাথে一致性 |

### Phase 4 — Social Login: ওয়ান-টাইম কোড (সিকিউরিটি ইমপ্রুভমেন্ট)

| #   | ফাইল                                                                           | পরিবর্তন                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8   | `server/src/app/modules/auth/auth.controller.ts` (socialLoginCallback)         | টোকেন আর URL query parameter-এ যায় না। পরিবর্তে `crypto.randomUUID()` দিয়ে ওয়ান-টাইম কোড জেনারেট করে Redis-এ টোকেন সংরক্ষণ করে (TTL: ৬০ সেকেন্ড)। URL-এ শুধু `?code=xxx` পাঠায় |
| 9   | `server/src/app/modules/auth/auth.controller.ts` (exchangeSocialCode) **নতুন** | `POST /exchange-code` — ক্লায়েন্ট কোড পাঠায়, Redis থেকে টোকেন রিট্রিভ করে, কোড ডিলিট করে (single-use), টোকেন রিটার্ন করে                                                       |
| 10  | `server/src/app/modules/auth/auth.routes.ts`                                   | `/exchange-code` রাউট যোগ করা হয়েছে                                                                                                                                            |

### Phase 5 — ক্লায়েন্ট সাইড আপডেট

| #   | ফাইল                                                               | পরিবর্তন                                                                                                            |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 11  | `client/src/app/(auth)/_services/social-login.service.ts` **নতুন** | `exchangeSocialCode()` — সার্ভার অ্যাকশন যা ব্যাকএন্ড থেকে কোড এক্সচেঞ্জ করে, কুকি সেট করে, রিডাইরেক্ট করে          |
| 12  | `client/src/app/(auth)/_components/SocialLoginHandler.tsx`         | টোকেন সরাসরি URL থেকে না পড়ে `exchangeSocialCode()` কল করে। `token`/`refreshToken` প্যারামিটার → `code` প্যারামিটার |

### Environment-Aware Cookie Configuration

| ফাইল                                                      | পরিবর্তন                                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client/src/lib/auth/cookie-config.ts` **নতুন**           | `getCookieOptions()` — `NODE_ENV` অনুযায়ী `secure` ও `sameSite` রিটার্ন করে। Production: `{ secure: true, sameSite: 'none' }`, Dev: `{ secure: false, sameSite: 'lax' }` |
| `client/src/app/(auth)/_services/login-user.service.ts`   | cookie options এখন `getCookieOptions()` থেকে আসে                                                                                                                         |
| `client/src/app/(auth)/_services/auth.service.ts`         | `getNewAccessToken`-এ cookie options `getCookieOptions()` থেকে আসে                                                                                                       |
| `client/src/app/(auth)/_services/social-login.service.ts` | Social login cookie `getCookieOptions()` ব্যবহার করে                                                                                                                     |
| `server/src/helpers/cookieSet.ts`                         | `secure` ও `sameSite` এখন `NODE_ENV` অনুযায়ী ডায়নামিক                                                                                                                    |

### কেন এটা গুরুত্বপূর্ণ

- **Dev mode** (localhost:3000, HTTP): `secure: true` কাজ করে না (ব্রাউজার reject করে)। তাই `secure: false`, `sameSite: 'lax'` ব্যবহার হয়
- **Production** (Vercel, Render, HTTPS): Cross-origin cookie-র জন্য `secure: true`, `sameSite: 'none'` আবশ্যক
- কোনো হার্ডকোডেড মান নেই — `NODE_ENV` স্বয়ংক্রিয়ভাবে ঠিক মান নির্বাচন করে

### Phase 6 — বিল্ড & টেস্ট

| প্যাকেজ   | রেজাল্ট                                                             |
| --------- | ------------------------------------------------------------------- |
| `server/` | ✅ Lint পাস, ✅ Build সফল (TypeScript), ✅ ৪ টি টেস্ট পাস (৩ স্যুট) |
| `client/` | ✅ Build সফল (Next.js 16 Turbopack), ✅ Proxy (middleware) সক্রিয়   |

---

## ১৪. টেস্টিং গাইড — কীভাবে চেঞ্জগুলো ভেরিফাই করবেন

### Prerequisites

```
# Server
cd server
npm run dev                 # Starts on port 5000

# Client (separate terminal)
cd client
npm run dev                 # Starts on port 3000

# Docker (DB + Redis + Backend — optional if running server locally)
docker compose up -d db redis
```

### ১. Credential Login — পুরো ফ্লো টেস্ট

| স্টেপ | কী করতে হবে                                                  | কী হবে                                                                                  |
| ----- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1     | `http://localhost:3000/login` এ যান                          | লগিন পেজ দেখতে পাবেন                                                                    |
| 2     | ইমেইল/পাসওয়ার্ড দিয়ে লগিন করুন                               | `login-user.service.ts` → `serverFetch.post("/auth/login")` → ব্যাকএন্ড → টোকেন জেনারেট |
| 3     | ব্রাউজার DevTools → Application → Cookies দেখুন              | দুটি cookie দেখতে পাবেন: `accessToken`, `refreshToken`                                  |
| 4     | Cookie properties চেক করুন                                   | **Dev**: `Secure` ❌, `SameSite: Lax`। **Prod**: `Secure` ✅, `SameSite: None`          |
| 5     | লগিন成功后 আপনাকে আপনার role-এর dashboard এ redirect করা হবে | রিডাইরেক্ট URL-এ `?loggedIn=true` যুক্ত আছে কিনা চেক করুন                               |

**ভেরিফিকেশন চেকলিস্ট:**

- [ ] Cookie সঠিকভাবে সেট হয়েছে
- [ ] JWT ডিকোড করে role অনুযায়ী dashboard এ রিডাইরেক্ট
- [ ] `needPasswordChange` true থাকলে `/reset-password` এ রিডাইরেক্ট
- [ ] ভুল পাসওয়ার্ড দিলে error মেসেজ দেখায়
- [ ] ৫ বার ভুল পাসওয়ার্ড দিলে "Too many failed attempts" মেসেজ দেখায়

### ২. Token Refresh — অটো-রিফ্রেশ টেস্ট

| স্টেপ | কী করতে হবে                                                                | কী হবে                                                                |
| ----- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1     | AccessToken cookie-র value কপি করে [jwt.io](https://jwt.io) তে decode করুন | `exp` দ্যাখে কখন expires হবে                                          |
| 2     | Manually accessToken cookie ডিলিট করুন বা expire করে দিন                   | পরবর্তী API কল বা navigation-এ proxy.ts `getNewAccessToken()` কল করবে |
| 3     | পেজ রিফ্রেশ করুন                                                           | proxy.ts `refresh-token` API কল করে নতুন token নিয়ে আসবে              |
| 4     | Cookies চেক করুন — নতুন accessToken সেট হয়েছে                              | **Dev**: `Secure` ❌, **Prod**: `Secure` ✅                           |

**ভেরিফিকেশন চেকলিস্ট:**

- [ ] Token expire হলে auto-refresh হয়
- [ ] refreshTokenও expire হলে লগিন পেজে রিডাইরেক্ট
- [ ] `http.ts`-এ `/auth/refresh-token` এন্ডপয়েন্টে recursion হয় না

### ৩. Social Login (Google/Facebook) — ওয়ান-টাইম কোড ফ্লো টেস্ট

| স্টেপ | কী করতে হবে                                                              | কী হবে                                                             |
| ----- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 1     | লগিন পেজে Google বাটনে ক্লিক করুন                                        | `window.location.href = BACKEND_URL + "/auth/google?redirect=..."` |
| 2     | Google OAuth কনসেন্ট স্ক্রিন → Allow দিন                                 | Passport Google OAuth সম্পন্ন করে                                  |
| 3     | Backend redirects to: `FRONTEND_URL/?code=xxx`                           | `code` প্যারামিটার — টোকেন নয়                                      |
| 4     | `SocialLoginHandler` কোড ডিটেক্ট করে → `exchangeSocialCode(code)` কল করে | ব্যাকএন্ডের `POST /auth/exchange-code` এন্ডপয়েন্ট কল হয়            |
| 5     | ব্যাকএন্ড Redis থেকে টোকেন রিট্রিভ করে, কোড ডিলিট করে                    | Single-use কোড                                                     |
| 6     | `social-login.service.ts` কুকি সেট করে → dashboard এ রিডাইরেক্ট          | Cookie: Dev → `sameSite: lax`, Prod → `sameSite: none`             |

**ভেরিফিকেশন চেকলিস্ট:**

- [ ] Google login টোকেন URL-এ দেখা যায় না (শুধু `?code=xxx`)
- [ ] Redis-এ `social_login_code_xxx` কী তৈরি হয়েছে (TTL: 60s)
- [ ] `POST /auth/exchange-code` সঠিকভাবে টোকেন রিটার্ন করে
- [ ] দ্বিতীয়বার একই code ব্যবহার করলে "Code is invalid or expired" error
- [ ] ৬০ সেকেন্ড পর code auto-expire হয়

### ৪. একইসাথে Dev ও Prod চেক করার উপায়

**Local Dev টেস্ট (HTTP):**

```bash
NODE_ENV=development npm run dev   # server
npm run dev                        # client
```

- Expected: cookies with `Secure: false, SameSite: Lax`

**Production টেস্ট (HTTPS) — Render + Vercel:**

- Deploy after merge to main → CI/CD triggers
- Expected: cookies with `Secure: true, SameSite: None`

**একই machine-এ Production-like টেস্ট (ngrok):**

```bash
ngrok http 3000   # Client → HTTPS URL
ngrok http 5000   # Server → HTTPS URL
```

- `FRONTEND_URL` ও `NEXT_PUBLIC_BASE_API_URL` ngrok URL-এ সেট করুন
- `FRONTEND_URL` ও `NEXT_PUBLIC_BASE_API_URL` .env.local ও .env-এ সেট করুন
- এখন সবকিছু HTTPS → Production-like আচরণ পাবেন

### ৫. Cookie কনফিগারেশন অটোমেটিক টেস্ট

`client/src/lib/auth/cookie-config.ts`:

| NODE_ENV                         | secure  | sameSite |
| -------------------------------- | ------- | -------- |
| `production`                     | `true`  | `"none"` |
| `development` (or anything else) | `false` | `"lax"`  |

### ৬. ব্যাকএন্ড এন্ডপয়েন্ট ম্যানুয়াল টেস্ট (Postman / curl)

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@gmail.com","password":"123456"}' \
  -v

# দেখবেন Set-Cookie হেডারে:
# Dev: accessToken=...; Secure; HttpOnly; SameSite=Lax
# Prod: accessToken=...; Secure; HttpOnly; SameSite=None
```
