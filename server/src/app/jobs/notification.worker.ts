import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './connection';
import prisma from '../../shared/prisma';
import logger from '../../lib/logger';
import { IRoleNotificationJobData } from './notification.queue';
import { SocketIOServer } from '../../socket/socket.server';

const NOTIFICATION_QUEUE_NAME = 'role-notification-queue';

/**
 * BullMQ worker that processes bulk role-based notification jobs.
 */
export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job: Job<IRoleNotificationJobData>) => {
    const { role, payload } = job.data;
    logger.info(`🔔 Processing role notification job ${job.id} for role: ${role}`);

    try {
      const io: SocketIOServer = (global as any).io;

      // Emit to connected clients via role room
      if (io) {
        io.to(`role:${role.toLowerCase()}`).emit('notification', {
          ...payload,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.warn('Socket.io not initialized in background worker, skipping real-time emit for role.');
      }

      // Save to all users of that role in DB
      // Note: for extremely large datasets (>10k users), you might want to chunk this.
      // prisma.notification.createMany is generally efficient enough for thousands of rows.
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
        logger.info(`✅ Successfully created notifications for ${users.length} users with role ${role}`);
      } else {
        logger.info(`ℹ️ No users found for role ${role}, no notifications created.`);
      }
    } catch (error) {
      logger.error(`❌ Failed to process role notification job (Job ${job.id}):`, error as Error);
      throw error; // Re-throw so BullMQ knows the job failed and can retry
    }
  },
  {
    connection: getRedisConnection() as any,
    concurrency: 2, // Process up to 2 bulk notifications in parallel to prevent DB locking
  }
);

notificationWorker.on('completed', (job) => {
  logger.info(`🎉 Role Notification Job ${job.id} has completed successfully.`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`⚠️ Role Notification Job ${job?.id} failed permanently: ${err.message}`);
});
