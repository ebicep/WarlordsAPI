import {type Request, Router} from "express";
import {z} from "zod";
import {getCollectionNameFromValue, PlayersInformationKeySchema} from "../db/enums.js";
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
import {LeaderboardService} from "../services/leaderboard.service.js";
import {validate} from "../middleware/validationMiddleware.js";

const router = Router();

const LeaderboardParamsSchema = z.object({
    stat: z.string(),
    path: z.array(z.string()).default([]),
})


type LeaderboardParams = z.infer<typeof LeaderboardParamsSchema>;

const LeaderboardQuery = z.object({
    timeframe: PlayersInformationKeySchema,
    // limit: z.coerce.number().int().min(1).max(50).optional().default(30),
    // offset: z.coerce.number().int().nonnegative().optional().default(0)
});

type LeaderboardQuery = z.infer<typeof LeaderboardQuery>;

// /api/leaderboards/kills/pvp/competitive/ctf
// /api/leaderboards/flags-captured/pvp/competitive/ctf
// /api/leaderboards/flags-captured/pvp/competitive
// /api/leaderboards/flags-captured/pvp

async function handleLeaderboardStats(req: Request<LeaderboardParams & ParamsDictionary, any, any, LeaderboardQuery>, res: any) {
    const {stat, path} = req.params;
    const {timeframe} = req.query;
    const {valid, error} = validateLeaderboardPath(stat, path);
    if (!valid) {
        return res.status(400).json({success: false, error});
    }

    const repository: PlayerRepository = new PlayerRepository(getDB(), getCollectionNameFromValue(timeframe));
    const service: LeaderboardService = new LeaderboardService(repository);
    const stats = Object.fromEntries(await service.getLeaderboardStats(stat, path));

    res.json({
        success: true,
        data: stats
    });
}

router.get("/leaderboards/paths", validate({query: LeaderboardQuery}), async (req, res) => {
    let leaderboardPaths: LeaderboardPaths = getLeaderboardPaths();
    res.json({
        success: true,
        data: leaderboardPaths
    });
});

router.get("/leaderboards/stat-paths", validate({query: LeaderboardQuery}), async (req, res) => {
    let leaderboardStatPaths: LeaderboardStatPaths = getLeaderboardStatPaths();
    res.json({
        success: true,
        data: leaderboardStatPaths
    });
});

router.get("/leaderboards/:stat", validate({
    params: LeaderboardParamsSchema,
    query: LeaderboardQuery
}), handleLeaderboardStats);

router.get("/leaderboards/:stat/*path", validate({
    params: LeaderboardParamsSchema,
    query: LeaderboardQuery
}), handleLeaderboardStats);

function validateLeaderboardPath(stat: string, path: string[]): { valid: boolean; error?: string } {
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
