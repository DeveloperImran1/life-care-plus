import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { fileUploader } from '../../../helpers/fileUploader';

const router = express.Router();

// ১. আমার সব কনভারসেশন দেখতে (শুধুমাত্র লগড-ইন ইউজার)
router.get(
  '/',
  auth(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ChatController.getMyConversations,
);

// ২. নির্দিষ্ট চ্যাটের মেসেজগুলো দেখতে
router.get(
  '/:conversationId/messages',
  auth(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ChatController.getMessages,
);

// ৩. চ্যাটে ফাইল আপলোড করতে
router.post(
  '/upload-file',
  auth(UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.upload.single('file'), // 'file' নামের ফিল্ড দিয়ে ফাইল রিসিভ করবে
  ChatController.uploadFile,
);

// ৪. নতুন চ্যাট তৈরি করতে (বাটন ক্লিক করলে এটা কল হবে)
router.post(
  '/',
  auth(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ChatController.createConversation,
);

export const ChatRoutes = router;
