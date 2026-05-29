import Redis from 'ioredis';
import ApiError from '../app/errors/ApiError';
import httpStatus from 'http-status';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'REDIS_URL is not defined in environment variables'
    );
}

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});