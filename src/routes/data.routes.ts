import {type Request, Router} from "express";
import {PlayerRepository} from "../respositories/player.repository.js";
import {COLLECTIONS} from "../db/enums.js";
import {db} from "../db/connection.js";
import {ComputeService} from "../services/compute.service.js";
import {z} from "zod";
import {validate} from "../middleware/validationMiddleware.js";
import {
    getLeaderboardPaths,
    getLeaderboardStatPaths,
    type LeaderboardPaths,
    type LeaderboardStatPaths
} from "../config/leaderboardPaths.js";
import type {ParamsDictionary} from 'express-serve-static-core';
import {collectArrays, navigateJson} from "../utils/utils.js";

const router = Router();

const PlayerStatsParamsSchema = z.object({
    uuid: z.uuid()
})

type PlayerStatsParams = z.infer<typeof PlayerStatsParamsSchema>;

router.get("/stats/:uuid", validate({
    params: PlayerStatsParamsSchema
}), async (req: Request<PlayerStatsParams>, res) => {
    const {uuid} = req.params;
    const repository: PlayerRepository = new PlayerRepository(db, COLLECTIONS.PLAYERS_INFORMATION);
    const service: ComputeService = new ComputeService(repository);
    const stats = await service.getPlayerStats(uuid);
    res.json({
        success: true,
        data: stats
    });
});

const LeaderboardParamsSchema = z.object({
    stat: z.string(),
    path: z.array(z.string()).default([]),
})


type LeaderboardParams = z.infer<typeof LeaderboardParamsSchema>;

const LeaderboardQuery = z.object({
    timeframe: z.enum(getLeaderboardPaths()["timeframes"]).optional().default('lifetime'),
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
    const {categories, timeframes, universal_stats, mappings, stat_mappings}: LeaderboardPaths = getLeaderboardPaths();
    const leaderboardStatPaths: LeaderboardStatPaths = getLeaderboardStatPaths();
    if (path.length > 0) {
        const validObject: string[] | undefined = navigateJson(categories, path);
        if (validObject === undefined) {
            res.status(400).json({
                success: false,
                error: "Invalid path"
            });
            return;
        }
        const validStats: string[] = collectArrays(validObject);
        validStats.push(...universal_stats);
        if (!validStats.includes(stat)) {
            res.status(400).json({
                success: false,
                error: "Invalid stat for the given path"
            });
            return;
        }
    }
    let statPaths: string[] | undefined = leaderboardStatPaths[stat];
    if (universal_stats.includes(stat)) {
        statPaths = leaderboardStatPaths["universal"];
    }
    if (!statPaths) {
        res.status(400).json({
            success: false,
            error: "Invalid stat"
        });
        return;
    }
    const mappedStat = stat_mappings[stat] !== undefined ? stat_mappings[stat] : stat;
    const statPath = path.join(".");
    const mappedStatPath = path
        .map(str => mappings[str] !== undefined ? mappings[str] : str)
        .filter(str => str !== "")
        .join(".")
    const matchingMappedStatPaths = statPaths
        .filter(p => p.startsWith(statPath))
        .map(str =>
            str.split(".").map(str => mappings[str] !== undefined ? mappings[str] : str)
                .filter(str => str !== "")
                .join(".")
        )

    const repository: PlayerRepository = new PlayerRepository(db, COLLECTIONS.PLAYERS_INFORMATION);
    const service: ComputeService = new ComputeService(repository);
    const stats = Object.fromEntries(await service.getAllSortedStats(mappedStat, matchingMappedStatPaths));

    res.json({
        success: true,
        data: {
            "stat": stat,
            "stat-path": statPath,
            "mapped-stat-path": mappedStatPath,
            "mapped-stat-paths": matchingMappedStatPaths,
            "stats": stats
        }
    });
}

router.get("/leaderboards/:stat", validate({
    params: LeaderboardParamsSchema,
    query: LeaderboardQuery
}), handleLeaderboardStats);


router.get("/leaderboards/:stat/*path", validate({
    params: LeaderboardParamsSchema,
    query: LeaderboardQuery
}), handleLeaderboardStats);

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

export default router;