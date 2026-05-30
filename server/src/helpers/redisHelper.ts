import { redis } from "../lib/redis";

const DEFAULT_TTL = 60 * 60 * 24; // 24 hours

const getOrSetCache = async <T>(
    key: string,
    cb: () => Promise<T>,
    ttl: number = DEFAULT_TTL
): Promise<T> => {
    const cachedData = await redis.get(key);

    if (cachedData) {
        console.log('Data from Redis cache:', key);
        return JSON.parse(cachedData);
    }

    const freshData = await cb();

    await redis.setex(key, ttl, JSON.stringify(freshData));

    console.log('Data from DB and saved to Redis:', key);

    return freshData;
};

const deleteCacheByPattern = async (pattern: string) => {
    const keys: string[] = [];

    let cursor = '0';

    do {
        const [nextCursor, foundKeys] = await redis.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100
        );

        cursor = nextCursor;
        keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length > 0) {
        await redis.del(...keys);
        console.log('Redis cache deleted:', keys);
    }
};

export const redisHelper = {
    getOrSetCache,
    deleteCacheByPattern,
};