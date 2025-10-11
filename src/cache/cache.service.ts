import {getRedisClient} from "./redis.js";
import {decodeBlock, encodeBlock, encodeBound} from "lz4";

export class CacheService {

    async get(key: string): Promise<{} | null> {
        try {
            const redisClient = getRedisClient();
            const data = await redisClient.getBuffer(key);
            return data ? decompress(data) : null;
        } catch (e) {
            return null;
        }
    }

    async set(key: string, value: string, expirySeconds: number = 60 * 5): Promise<boolean> {
        try {
            const client = getRedisClient();
            await client.set(key, compress(value), "EX", expirySeconds);
            return true;
        } catch (error) {
            console.error("Cache set error for key ${key}:", error);
            return false;
        }
    }

}

function compress(json: string): Buffer<ArrayBufferLike> {
    const jsonBuffer = Buffer.from(json, 'utf-8');
    const compressedBuffer = Buffer.alloc(encodeBound(jsonBuffer.length));
    const compressedSize = encodeBlock(jsonBuffer, compressedBuffer);
    return compressedBuffer.subarray(0, compressedSize);
}

function decompress(data: Buffer<ArrayBufferLike>): string {
    const decompressed = Buffer.alloc(data.length * 255);
    const decompressedSize = decodeBlock(data, decompressed);
    const decompressedString = decompressed.subarray(0, decompressedSize).toString('utf-8');
    try {
        return JSON.parse(decompressedString);
    } catch {
        return decompressedString;
    }
}
