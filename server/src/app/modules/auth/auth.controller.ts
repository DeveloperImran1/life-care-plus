import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from '../auth/auth.service';
import getTokenMaxAge from '../../../helpers/getTokenMaxAge';
import { cookieSet } from '../../../helpers/cookieSet';
import AppError from '../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { Secret } from 'jsonwebtoken';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const accessTokenExpiresIn = config.jwt.expires_in as string;
  const refreshTokenExpiresIn = config.jwt.refresh_token_expires_in as string;

  // convert accessTokenExpiresIn to milliseconds
  const accessTokenMaxAge: number = getTokenMaxAge(accessTokenExpiresIn);

  // convert refreshTokenExpiresIn to milliseconds
  const refreshTokenMaxAge: number = getTokenMaxAge(refreshTokenExpiresIn);

  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  cookieSet(res, 'accessToken', accessToken, accessTokenMaxAge);
  cookieSet(res, 'refreshToken', refreshToken, refreshTokenMaxAge);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully!',
    data: {
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  /*
  EXPIRES_IN=7d 

REFRESH_TOKEN_EXPIRES_IN=1y 
  */
  const accessTokenExpiresIn = config.jwt.expires_in as string;
  const refreshTokenExpiresIn = config.jwt.refresh_token_expires_in as string;

  // convert accessTokenExpiresIn to milliseconds
  let accessTokenMaxAge: number;
  const accessTokenUnit = accessTokenExpiresIn.slice(-1);
  const accessTokenValue = parseInt(accessTokenExpiresIn.slice(0, -1));
  if (accessTokenUnit === 'y') {
    accessTokenMaxAge = accessTokenValue * 365 * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === 'M') {
    accessTokenMaxAge = accessTokenValue * 30 * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === 'w') {
    accessTokenMaxAge = accessTokenValue * 7 * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === 'd') {
    accessTokenMaxAge = accessTokenValue * 24 * 60 * 60 * 1000;
  } else if (accessTokenUnit === 'h') {
    accessTokenMaxAge = accessTokenValue * 60 * 60 * 1000;
  } else if (accessTokenUnit === 'm') {
    accessTokenMaxAge = accessTokenValue * 60 * 1000;
  } else if (accessTokenUnit === 's') {
    accessTokenMaxAge = accessTokenValue * 1000;
  } else {
    accessTokenMaxAge = 1000 * 60 * 60; // default 1 hour
  }

  // convert refreshTokenExpiresIn to milliseconds
  let refreshTokenMaxAge: number;
  const refreshTokenUnit = refreshTokenExpiresIn.slice(-1);
  const refreshTokenValue = parseInt(refreshTokenExpiresIn.slice(0, -1));
  if (refreshTokenUnit === 'y') {
    refreshTokenMaxAge = refreshTokenValue * 365 * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === 'M') {
    refreshTokenMaxAge = refreshTokenValue * 30 * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === 'w') {
    refreshTokenMaxAge = refreshTokenValue * 7 * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === 'd') {
    refreshTokenMaxAge = refreshTokenValue * 24 * 60 * 60 * 1000;
  } else if (refreshTokenUnit === 'h') {
    refreshTokenMaxAge = refreshTokenValue * 60 * 60 * 1000;
  } else if (refreshTokenUnit === 'm') {
    refreshTokenMaxAge = refreshTokenValue * 60 * 1000;
  } else if (refreshTokenUnit === 's') {
    refreshTokenMaxAge = refreshTokenValue * 1000;
  } else {
    refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 30; // default 30 days
  }

  const result = await AuthServices.refreshToken(refreshToken);

  cookieSet(res, 'accessToken', result.accessToken, accessTokenMaxAge);
  cookieSet(res, 'refreshToken', result.refreshToken, refreshTokenMaxAge);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token genereated successfully!',
    data: {
      message: 'Access token genereated successfully!',
    },
  });
});

const changePassword = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;

  const result = await AuthServices.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Changed successfully',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check your email!',
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  // Extract token from Authorization header (remove "Bearer " prefix)
  const authHeader = req.headers.authorization;
  console.log({ authHeader });
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  const user = req.user; // Will be populated if authenticated via middleware

  await AuthServices.resetPassword(token, req.body, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Reset!',
    data: null,
  });
});

const getMe = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.cookies;

  const result = await AuthServices.getMe(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const socialLoginCallback = catchAsync(async (req: Request, res: Response) => {
  // Passport লগিন সাকসেস হলে ইউজারের ডাটা req.user এর মধ্যে রেখে দেয়
  const user = req.user as any;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // লজিক ১: টোকেন তৈরি করুন (আপনার আগের লজিক অনুযায়ী
  console.log('auth controller theke google user', user);

  // accessToken এবং refreshToken জেনারেট করার ফাংশন কল করুন
  const accessToken = jwtHelpers.generateToken(
    {
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: user.email,
      role: user.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string,
  );

  // লজিক ২: রিফ্রেশ টোকেন কুকিতে সেট করুন
  const accessTokenExpiresIn = config.jwt.expires_in as string;
  const refreshTokenExpiresIn = config.jwt.refresh_token_expires_in as string;

  // convert accessTokenExpiresIn to milliseconds
  const accessTokenMaxAge: number = getTokenMaxAge(accessTokenExpiresIn);

  // convert refreshTokenExpiresIn to milliseconds
  const refreshTokenMaxAge: number = getTokenMaxAge(refreshTokenExpiresIn);
  cookieSet(res, 'accessToken', accessToken, accessTokenMaxAge);
  cookieSet(res, 'refreshToken', refreshToken, refreshTokenMaxAge);

  // লজিক ৩: ফ্রন্ট-এন্ডে রিডাইরেক্ট করা
  let redirectTo = req.query.state ? (req.query.state as string) : '';
  if (redirectTo.startsWith('/')) {
    redirectTo = redirectTo.slice(1);
  }

  // URL এর সাথে Access Token পাঠিয়ে দিতে পারেন, যাতে ফ্রন্ট-এন্ড সেটা লোকাল স্টোরেজ বা কুকিতে সেভ করতে পারে
  res.redirect(`${config.frontendUrl}/${redirectTo}?token=${accessToken}`);
});

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
  socialLoginCallback,
};
