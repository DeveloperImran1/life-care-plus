import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';

const EMAIL_QUEUE_NAME = 'email-dispatch-queue';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: getRedisConnection() as any,
});

interface IEmailJobData {
  email: string;
  html: string;
}

/**
 * Adds an email job to the BullMQ email dispatch queue.
 * Configures retries with exponential backoff and cleanup rules.
 */
export const addEmailJob = async (data: IEmailJobData): Promise<void> => {
  await emailQueue.add('send-email', data, {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with a 5-second delay, doubling each retry (5s, 10s, 20s)
    },
    removeOnComplete: true, // Auto-delete job metadata on success to save Redis space
    removeOnFail: false, // Keep failed jobs for logging/debugging purposes
  });
};
