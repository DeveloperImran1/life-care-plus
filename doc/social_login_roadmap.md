# Social Login Implementation Roadmap

হ্যালো! আপনার আগের নোটগুলো খুবই চমৎকার এবং গোছানো। যেহেতু আপনি নিজে কোড করে প্র্যাকটিস করতে চাচ্ছেন, তাই আমি সরাসরি আপনার ফাইলে কোড না লিখে, আপনার আগের নোটের উপর ভিত্তি করে **Google** এবং **Facebook** লগিন ইমপ্লিমেন্ট করার একটি কমপ্লিট স্টেপ-বাই-স্টেপ গাইডলাইন বা রোডম্যাপ তৈরি করে দিলাম। 

আপনার প্রজেক্টের `server` এবং `client` ফোল্ডারে নিচে দেওয়া স্টেপগুলো লজিক অনুযায়ী ইমপ্লিমেন্ট করবেন।

---

### Step 1: Database Schema Update (MongoDB/Mongoose)
যেহেতু ইউজার এখন পাসওয়ার্ড ছাড়াও সোশ্যাল মিডিয়া দিয়ে লগিন করতে পারবে, তাই আপনার ইউজারের স্কিমাতে কিছু পরিবর্তন আনতে হবে। 
*   **Password field:** সোশ্যাল লগিনের ক্ষেত্রে ইউজার পাসওয়ার্ড দিবে না। তাই স্কিমাতে `password` ফিল্ডটি `required: false` করতে হবে।
*   **Auths array:** আপনার নোটে যেমন ছিল, ইউজার কোন প্রোভাইডার (Google/Facebook) দিয়ে লগিন করেছে তা স্টোর করার জন্য একটি ফিল্ড রাখতে হবে।

```typescript
// Example Logic for User Schema
password: { type: String, required: false },
auths: [
  {
    provider: { type: String, enum: ['google', 'facebook'] },
    providerId: String,
  }
]
```

---

### Step 2: Credentials & Keys Setup
আপনাকে Google এবং Facebook উভয়ের ডেভেলপার কনসোল থেকে API Keys যোগাড় করতে হবে।

**Google:**
*   আপনার আগের নোট অনুযায়ী Google Cloud Console থেকে `GOOGLE_CLIENT_ID` এবং `GOOGLE_CLIENT_SECRET` সংগ্রহ করুন।
*   **Redirect URI:** `http://localhost:5000/api/v1/auth/google/callback` (পোর্টের নাম আপনার সার্ভারের পোর্টের সাথে মিলিয়ে নিবেন)।

**Facebook:**
1.  [Facebook Developers](https://developers.facebook.com/) পোর্টালে যান।
2.  নতুন একটি App তৈরি করুন (App Type: Consumer বা None সিলেক্ট করতে পারেন)।
3.  অ্যাড প্রোডাক্ট থেকে "Facebook Login" সেটআপ করুন।
4.  **Valid OAuth Redirect URIs** এর ঘরে দিন: `http://localhost:5000/api/v1/auth/facebook/callback`
5.  Settings > Basic এ গেলে `FACEBOOK_APP_ID` এবং `FACEBOOK_APP_SECRET` পেয়ে যাবেন।

**আপনার সার্ভারের `.env` ফাইলে ভ্যালুগুলো রাখুন:**
```env
# Google
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Facebook
FACEBOOK_APP_ID=your_facebook_id
FACEBOOK_APP_SECRET=your_facebook_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

# Express Session
EXPRESS_SESSION_SECRET=your_super_secret_session_key
FRONTEND_URL=http://localhost:3000 # অথবা আপনার ক্লায়েন্ট যে পোর্টে রান করছে (e.g., 5173)
```

---

### Step 3: Install Required Packages
আপনার `server` ডিরেক্টরিতে গিয়ে নিচের প্যাকেজগুলো ইন্সটল করে নিন:

```bash
npm install passport passport-google-oauth20 passport-facebook express-session
npm install -D @types/passport @types/passport-google-oauth20 @types/passport-facebook @types/express-session
```

---

### Step 4: Configure Passport (`config/passport.ts`)
আপনার আগের নোটের মতই `passport.ts` ফাইলে Google Strategy কনফিগার করবেন। সাথে Facebook Strategy ও যুক্ত করবেন।

1.  **Google Strategy:** আপনার নোটে দেওয়া লজিক হুবহু ব্যবহার করতে পারবেন।
2.  **Facebook Strategy:** Google এর মতোই কাজ করবে।
    *   `passport-facebook` থেকে `Strategy as FacebookStrategy` ইম্পোর্ট করুন।
    *   Facebook এর ক্ষেত্রে `profileFields: ['id', 'displayName', 'photos', 'email']` অপশনটি অবশ্যই পাঠাতে হবে, নাহলে Facebook ইউজারের ইমেইল দিবে না।

```typescript
// Facebook Strategy Logic (Similar to Google)
passport.use(
  new FacebookStrategy(
    {
      clientID: envVars.FACEBOOK_APP_ID,
      clientSecret: envVars.FACEBOOK_APP_SECRET,
      callbackURL: envVars.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email'] // Very Important
    },
    async (accessToken, refreshToken, profile, done) => {
       // এখানে Google এর মতই লজিক লিখবেন:
       // 1. profile থেকে email বের করবেন।
       // 2. DataBase এ চেক করবেন এই email এর ইউজার আছে কিনা।
       // 3. না থাকলে নতুন ইউজার create করবেন (provider: "facebook" দিয়ে)।
       // 4. সবশেষে return done(null, user); কল করে দিবেন।
    }
  )
);
```

---

### Step 5: Initialize Session & Passport (`app.ts`)
আপনার সার্ভারের মেইন ফাইল (যেমন: `app.ts`) তে রাউটের উপরে `express-session` এবং `passport` ইনিশিয়ালাইজ করতে হবে (আপনার নোটে যেমন ছিল)।

```typescript
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

import "./config/passport"; // Passport config ফাইলটি ইম্পোর্ট করতে ভুলবেন না
```

---

### Step 6: Backend Routes (`auth.route.ts`)
আপনার অথেনটিকেশন রাউট ফাইলে Google এবং Facebook এর জন্য আলাদা রাউট তৈরি করতে হবে। 

**Google Routes (From your notes):**
*   `GET /google` -> (redirect parameter রিসিভ করে state এ পাঠাবেন)
*   `GET /google/callback` -> `passport.authenticate` এবং কন্ট্রোলার কল করবেন।

**Facebook Routes:**
একদম Google এর মতোই হবে, শুধু `passport.authenticate("google")` এর জায়গায় `"facebook"` হবে।

```typescript
router.get("/facebook", (req, res, next) => {
  const redirect = req.query.redirect || "/";
  // scope এ email এবং public_profile চাইবেন
  passport.authenticate("facebook", { scope: ["email", "public_profile"], state: redirect as string })(req, res, next);
});

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  AuthControllers.socialLoginCallbackController // একই কন্ট্রোলার ব্যবহার করতে পারবেন!
);
```

---

### Step 7: Controller Logic (`auth.controller.ts`)
আপনার নোটে যেই `googleCallbackcontroller` ছিল, সেটির নাম পরিবর্তন করে `socialLoginCallbackController` দিতে পারেন। কারণ Google এবং Facebook দুইটার callback-এর কাজই একই:
1.  `req.user` থেকে ইউজারের ডেটা নেওয়া।
2.  `req.query.state` থেকে ফ্রন্ট-এন্ডের রিডাইরেক্ট পাথ বের করা।
3.  Token জেনারেট করে Cookies তে সেট করা।
4.  সবশেষে ফ্রন্ট-এন্ড এর URL এ রিডাইরেক্ট করা।

*(আপনার নোটে থাকা লজিকটি পারফেক্ট, ওইটাই ব্যবহার করুন!)*

---

### Step 8: Frontend Implementation (`client` folder)
ফ্রন্ট-এন্ডে সোশ্যাল লগিন বাটনগুলোতে ক্লিক করলে আমরা কোনো `axios` বা `fetch` কল করবো না। কারণ Passport.js এর কনসেন্ট পেজটি (Google/Facebook এর লগিন পেজ) ব্রাউজার থেকে সরাসরি নেভিগেট হতে হয়।

তাই বাটনের `onClick` ইভেন্টে আমরা সরাসরি `window.location.href` পরিবর্তন করে আমাদের ব্যাকএন্ডের রাউটে পাঠিয়ে দিবো। 

```tsx
// Frontend Code Example: LoginForm.tsx

const handleGoogleLogin = () => {
   // অপশনাল: ইউজার লগিন হওয়ার পর কোথায় রিডাইরেক্ট হবে
   const redirectUrl = "/dashboard"; 
   window.location.href = `http://localhost:5000/api/v1/auth/google?redirect=${redirectUrl}`;
}

const handleFacebookLogin = () => {
   const redirectUrl = "/dashboard"; 
   window.location.href = `http://localhost:5000/api/v1/auth/facebook?redirect=${redirectUrl}`;
}
```

**ওয়ার্কফ্লো কিভাবে কাজ করবে?**
1. ইউজার ফ্রন্ট-এন্ড থেকে বাটনে ক্লিক করলে ব্যাকএন্ডের রাউটে (`/auth/google`) যাবে।
2. ব্যাকএন্ড তাকে Google এর লগিন পেজে পাঠাবে।
3. ইউজার লগিন করলে Google ব্যাকএন্ডের callback URL এ ডেটা পাঠাবে।
4. ব্যাকএন্ড ইউজারকে ডাটাবেজে সেভ করে, কুকি সেট করে, ফ্রন্ট-এন্ডে (`/dashboard`) রিডাইরেক্ট করে দিবে।
5. ফ্রন্ট-এন্ডে পেজ লোড হওয়ার পর আপনার অ্যাপ স্বাভাবিকভাবেই কুকি থেকে টোকেন পেয়ে ইউজারের স্টেট আপডেট করে নিবে।

---
**Happy Coding!** আপনি এই রোডম্যাপ ফলো করে ইমপ্লিমেন্ট করা শুরু করুন। কোথাও আটকে গেলে বা কোন কনফিউশন থাকলে আমাকে জানাবেন, আমি লজিক বুঝিয়ে সাহায্য করবো!
