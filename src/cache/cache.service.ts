import {getRedisClient} from "./redis.js";

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

    async set(key: string, value: string | number, expirySeconds: number = 60 * 5): Promise<boolean> {
        try {
            const client = getRedisClient();
            await client.set(key, value, "EX", expirySeconds);
            return true;
        } catch (error) {
            console.error("Cache set error for key ${key}:", error);
            return false;
        }
    }

}
