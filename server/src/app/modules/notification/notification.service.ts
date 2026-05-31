import { NotificationType, Prisma } from '@prisma/client';
import { SocketIOServer } from '../../../socket/socket.server';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import logger from '../../../lib/logger';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  actionUrl?: string;
}

/**
 * Emit notification to specific user(s) and save to DB
 */
const emitNotification = async (userId: string | string[], payload: NotificationPayload) => {
  const io: SocketIOServer = (global as any).io;

  const userIds = Array.isArray(userId) ? userId : [userId];

  // Save to database
  try {
    await prisma.notification.createMany({
      data: userIds.map((id) => ({
        userId: id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        priority: payload.priority || 'MEDIUM',
        actionUrl: payload.actionUrl,
      })),
    });
  } catch (error) {
    logger.error('Failed to save notifications to database', error as Error);
  }

  // Emit to connected clients
  if (io) {
    userIds.forEach((id) => {
      io.to(`user:${id}`).emit('notification', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
    });
  } else {
    logger.warn('Socket.io not initialized, skipping real-time emit');
  }
};

/**
 * Emit notification to all users of a specific role and save to DB
 */
const emitToRole = async (role: 'ADMIN' | 'SUPER_ADMIN' | 'DOCTOR' | 'PATIENT', payload: NotificationPayload) => {
  const io: SocketIOServer = (global as any).io;

  // Emit to connected clients via role room
  if (io) {
    io.to(`role:${role.toLowerCase()}`).emit('notification', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // Save to all users of that role in DB
  try {
    const users = await prisma.user.findMany({
      where: { role: role as any },
      select: { id: true },
    });

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data || {},
          priority: payload.priority || 'MEDIUM',
          actionUrl: payload.actionUrl,
        })),
      });
    }
  } catch (error) {
    logger.error('Failed to save role notifications to database', error as Error);
  }
};

/**
 * Broadcast notification to all connected clients (no DB save)
 */
const broadcastToAll = async (payload: NotificationPayload) => {
  const io: SocketIOServer = (global as any).io;

  if (io) {
    io.emit('notification', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get notifications for a user with pagination
 */
const getUserNotifications = async (userId: string, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const whereConditions: Prisma.NotificationWhereInput = {
    userId,
  };

  const resultData = await prisma.notification.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.notification.count({
    where: whereConditions,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return {
    meta: {
      total,
      page,
      limit,
      unreadCount,
    },
    data: resultData,
  };
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId: string, userId: string) => {
  const result = await prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Ensure user owns this notification
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result;
};

export const NotificationService = {
  emitNotification,
  emitToRole,
  broadcastToAll,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
