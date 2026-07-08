import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import config from './index'; //
import prisma from '../shared/prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId as string,
      clientSecret: config.googleClientSecret as string,
      callbackURL: config.googleCallbackUrl as string,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email not found from Google'), false);
        }

        // লজিক ১: ডাটাবেজে চেক করুন এই ইমেইলের ইউজার আছে কিনা
        let user = await prisma.user.findUnique({
          where: { email },
          include: { authAccounts: true }, // Auth অ্যাকাউন্টগুলোও নিয়ে আসলাম
        });

        // লজিক ২: ইউজার না থাকলে নতুন ইউজার এবং Patient প্রোফাইল বানাবো
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              role: 'PATIENT',
              // জাদুকরী Nested Write: একসাথে Patient এবং AuthAccount তৈরি
              patient: {
                create: {
                  name: profile?.displayName || 'Google User',
                  profilePhoto: profile?.photos?.[0]?.value,
                },
              },
              authAccounts: {
                create: {
                  provider: 'GOOGLE',
                  providerId: profile.id,
                },
              },
            },
          });
        }

        // লজিক ৩: ইউজার থাকলে চেক করবো তার AuthAccount এ গুগল অ্যাড করা আছে কিনা
        else {
          const hasGoogleAuth = user.authAccounts.find((auth) => auth.provider === 'GOOGLE');
          if (!hasGoogleAuth) {
            // যদি গুগল দিয়ে আগে লগিন না করে থাকে, তবে AuthAccount এ গুগল যোগ করে দিবো
            await prisma.authAccount.create({
              data: {
                userId: user.id,
                provider: 'GOOGLE',
                providerId: profile.id,
              },
            });
          }
        }

        // সব ঠিক থাকলে ইউজার ডাটা রিটার্ন করে দিবো
        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
);

// সেশনে ইউজার আইডি সেভ রাখা
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// সেশন থেকে ইউজার আইডি দিয়ে ইউজারের ডাটা বের করা
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
