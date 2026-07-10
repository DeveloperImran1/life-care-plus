import Redis from 'ioredis';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    'REDIS_URL is not defined in environment variables',
  );
}

/**
 * Returns a new Redis connection instance for BullMQ Queue or Worker.
 * BullMQ requires distinct connection instances for workers to prevent blocking commands from stalling the queue.
 */
export const getRedisConnection = (): Redis => {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
};
