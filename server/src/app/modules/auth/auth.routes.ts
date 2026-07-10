import { UserRole } from '@prisma/client';
import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { authLimiter } from '../../middlewares/rateLimiter';
import { AuthController } from '../auth/auth.controller';
import passport from 'passport';
import config from '../../../config';

const router = express.Router();

router.post('/login', authLimiter, AuthController.loginUser);

router.post('/refresh-token', AuthController.refreshToken);

router.post(
  '/change-password',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changePassword,
);

router.post('/forgot-password', AuthController.forgotPassword);

router.post(
  '/reset-password',
  (req: Request, res: Response, next: NextFunction) => {
    //user is resetting password without token and logged in newly created admin or doctor
    if (!req.headers.authorization && req.cookies.accessToken) {
      auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)(req, res, next);
    } else {
      //user is resetting password via email link with token
      next();
    }
  },
  AuthController.resetPassword,
);

router.get('/me', AuthController.getMe);

// For Google Authentication
// ১. এই রাউটে হিট করলে গুগল লগিন পেজে নিয়ে যাবে
router.get('/google', (req, res, next) => {
  const redirect = req.query.redirect || '/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: redirect as string,
  })(req, res, next);
});
// ২. গুগল লগিন সাকসেসফুল হলে গুগল এই লিংকে ডাটা পাঠাবে
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${config.frontendUrl}/login?error=true` }),
  AuthController.socialLoginCallback,
);

// For Facebook Authentication
// ১. এই রাউটে হিট করলে ফেসবুক লগিন পেজে নিয়ে যাবে
router.get('/facebook', (req, res, next) => {
  const redirect = req.query.redirect || '/';
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email'], // আমরা ইমেইল পারমিশন চাচ্ছি
    state: redirect as string,
  })(req, res, next);
});

// ২. ফেসবুক লগিন সাকসেসফুল হলে ডাটা এখানে আসবে
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${config.frontendUrl}/login?error=true` }),
  AuthController.socialLoginCallback, // গুগলের যেই কন্ট্রোলার ব্যবহার করেছি, এখানেও হুবহু সেটাই কাজ করবে!
);

export const AuthRoutes = router;
