import {getRedisClient} from "../cache/redis.js";

// type CacheData = Record<string, number>

export class CacheService {

    async get(key: string): Promise<{} | null> {
        try {
            const redisClient = getRedisClient();
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    async set(key: string, value: string | number, expirySeconds: number = 300): Promise<boolean> {
        try {
            const client = getRedisClient();
            await client.set(key, value);
            return true;
        } catch (error) {
            console.error("Cache set error for key ${key}:", error);
            return false;
        }
    }

}
