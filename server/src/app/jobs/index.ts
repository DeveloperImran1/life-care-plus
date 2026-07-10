import logger from '../../lib/logger';
import { emailWorker } from './email.worker';
import { notificationWorker } from './notification.worker';

const workers = [emailWorker, notificationWorker];

/**
 * Initializes all background workers and queues.
 * Simply referencing the workers starts them up.
 */
export const initializeJobs = async (): Promise<void> => {
  logger.info('⚙️ Initializing Background Jobs and Workers...');
  logger.info(`✅ ${workers.length} Worker(s) initialized successfully.`);
};

/**
 * Gracefully shuts down all active background workers.
 */
export const closeJobs = async (): Promise<void> => {
  logger.info('🔄 Shutting down background workers gracefully...');
  try {
    await Promise.all(workers.map((worker) => worker.close()));
    logger.info('✅ Background workers closed.');
  } catch (error) {
    logger.error('❌ Error shutting down background workers:', error as Error);
  }
};
