import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { NotificationController } from './notification.controller';

const router = express.Router();

/**
 * GET /api/v1/notification
 * Get my notifications (paginated)
 */
router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  NotificationController.getMyNotifications,
);

/**
 * PATCH /api/v1/notification/read-all
 * Mark all notifications as read
 */
router.patch(
  '/read-all',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  NotificationController.markAllAsRead,
);

/**
 * PATCH /api/v1/notification/:id/read
 * Mark a single notification as read
 */
router.patch(
  '/:id/read',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  NotificationController.markAsRead,
);

export const NotificationRoutes = router;
