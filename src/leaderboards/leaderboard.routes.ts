import {type Request, Router} from "express";
import {getCollectionNameFromValue} from "../db/enums.js";
import type {ParamsDictionary} from "express-serve-static-core";
import {
    getLeaderboardPaths,
    getLeaderboardStatPaths,
    type LeaderboardPaths,
    type LeaderboardStatPaths
} from "../config/leaderboardPaths.js";
import {collectArrays, navigateJson} from "../utils/utils.js";
import {PlayerRepository} from "../respositories/player.repository.js";
import {getDB} from "../db/connection.js";
import {LeaderboardService} from "./leaderboard.service.js";
import {validate} from "../middleware/validationMiddleware.js";
import type {CachedResult, Result} from "../types/common.types.js";
import {
    type LeaderboardParams,
    LeaderboardParamsSchema,
    type LeaderboardQuery,
    LeaderboardQuerySchema
} from "./leaderboard.routes.types.js";

const router = Router();

// /api/leaderboards/kills/pvp/competitive/ctf
// /api/leaderboards/flags-captured/pvp/competitive/ctf
// /api/leaderboards/flags-captured/pvp/competitive
// /api/leaderboards/flags-captured/pvp

router.get("/leaderboards/paths", validate({query: LeaderboardQuerySchema}), async (req, res) => {
    let leaderboardPaths: LeaderboardPaths = getLeaderboardPaths();
    res.json({
        success: true,
        data: leaderboardPaths
    });
});

router.get("/leaderboards/stat-paths", validate({query: LeaderboardQuerySchema}), async (req, res) => {
    let leaderboardStatPaths: LeaderboardStatPaths = getLeaderboardStatPaths();
    res.json({
        success: true,
        data: leaderboardStatPaths
    });
});

router.get("/leaderboards/:stat", validate({
    params: LeaderboardParamsSchema,
    query: LeaderboardQuerySchema
}), handleLeaderboardStats);

router.get("/leaderboards/:stat/*path", validate({
    params: LeaderboardParamsSchema,
    query: LeaderboardQuerySchema
}), handleLeaderboardStats);

export async function handleLeaderboardStats(req: Request<LeaderboardParams & ParamsDictionary, any, any, typeof LeaderboardParamsSchema>, res: any) {
    const params: LeaderboardParams = {
        stat: req.params.stat,
        path: req.params.path
    };
    const query: LeaderboardQuery = LeaderboardQuerySchema.parse(req.query);
    const result: Result = await getLeaderboardStats(params, query);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

export async function getLeaderboardStats(
    params: LeaderboardParams,
    query: LeaderboardQuery
): Promise<Result> {
    const {stat, path} = params;
    const {timeframe, limit} = query;

    const {valid, error} = validateLeaderboardPath(stat, path);
    if (!valid) {
        return {success: false, error: error ?? "Invalid path or stat"};
    }

    const repository: PlayerRepository = new PlayerRepository(getDB(), getCollectionNameFromValue(timeframe));
    const service: LeaderboardService = new LeaderboardService(repository);
    const result: CachedResult<Map<string, number>> = await service.getLeaderboardStats(stat, path, limit);

    return {
        success: true,
        data: Object.fromEntries(result.data),
        cached: result.cached,
        durationMs: result.durationMs
    };
}

export function validateLeaderboardPath(stat: string, path: string[]): { valid: boolean; error?: string } {
    const {categories, universal_stats} = getLeaderboardPaths();
    const validObject = navigateJson(categories, path);
    if (!validObject) {
        return {valid: false, error: "Invalid path"};
    }

    const validStats = collectArrays(validObject);
    validStats.push(...universal_stats);
    if (!validStats.includes(stat)) {
        return {valid: false, error: "Invalid stat for the given path"};
    }

    return {valid: true};
}


export default router;
