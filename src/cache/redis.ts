import {Redis} from "ioredis"

let client: Redis | null = null;

export function getRedisClient(): Redis {
    if (!client) {
        throw new Error("Redis Client not initialized");
    }
    return client;
}

export async function connectRedis() {
    if (!process.env.REDIS_URL) {
        console.error("REDIS_URL is not defined in environment variables.");
        return;
    }
    client = new Redis(process.env.REDIS_URL);
    client.on('error', (err) => console.error('Redis Client Error', err));
    client.on('connect', () => console.info('Redis Client Connected'));
}
