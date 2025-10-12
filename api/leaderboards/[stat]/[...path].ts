import type {VercelRequest, VercelResponse} from '@vercel/node';
import {connectRedis, getRedisClient} from "../../../src/cache/redis.js";
import {connectMongo, getDB} from "../../../src/db/connection.js";
import {
    type LeaderboardParams,
    LeaderboardParamsSchema,
    type LeaderboardQuery,
    LeaderboardQuerySchema
} from "../../../src/leaderboards/leaderboard.routes.types.js";
import {getLeaderboardStats} from "../../../src/leaderboards/leaderboard.routes.js";
import {z} from "zod";

function extractVercelParams(req: VercelRequest): { stat: string; path: string } {
    const stat = req.query.stat as string;

    // Vercel uses an array for catch-all segments (e.g., [...path])
    const pathArray = req.query.path;
    let path: string;

    if (Array.isArray(pathArray)) {
        path = '/' + pathArray.join('/');
    } else if (typeof pathArray === 'string') {
        path = '/' + pathArray;
    } else {
        path = '';
    }

    return {stat, path};
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({success: false, error: 'Method Not Allowed'});
    }
    try {
        getRedisClient();
    } catch (e) {
        await connectRedis();
    }
    try {
        getDB();
    } catch (e) {
        await connectMongo();
    }

    try {
        const {stat, path} = extractVercelParams(req);

        const params: LeaderboardParams = LeaderboardParamsSchema.parse({stat, path});
        const query: LeaderboardQuery = LeaderboardQuerySchema.parse(req.query);

        const result: {} = await getLeaderboardStats(params, query);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({success: false, error: 'Validation Failed', details: error.message});
        }
        console.error(error);
        return res.status(500).json({success: false, error: 'Internal Server Error'});
    }

}