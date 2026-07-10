import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';
import { NotificationPayload } from '../modules/notification/notification.service';

const NOTIFICATION_QUEUE_NAME = 'role-notification-queue';

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: getRedisConnection() as any,
});

export interface IRoleNotificationJobData {
  role: 'ADMIN' | 'SUPER_ADMIN' | 'DOCTOR' | 'PATIENT';
  payload: NotificationPayload;
}

/**
 * Adds a role notification job to the BullMQ queue.
 */
export const addRoleNotificationJob = async (data: IRoleNotificationJobData): Promise<void> => {
  await notificationQueue.add('send-role-notification', data, {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 5000, 
    },
    removeOnComplete: true, // Auto-delete job metadata on success to save Redis space
    removeOnFail: false,    // Keep failed jobs for debugging
  });
};
