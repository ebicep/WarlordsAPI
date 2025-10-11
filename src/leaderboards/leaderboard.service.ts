import type {PlayerRepository} from "../respositories/player.repository.js";
import {sumKeyAtPath} from "./leaderboard.utils.js";
import {getLeaderboardPaths, getLeaderboardStatPaths, type LeaderboardStatPaths} from "../config/leaderboardPaths.js";
import type {Document, WithId} from "mongodb";
import {CacheService} from "../cache/cache.service.js";
import type {SortedPlayerStats} from "./leaderboard.types.js";

export class LeaderboardService {

    constructor(
        private playerRepo: PlayerRepository
    ) {

    }

    private getCacheKey(path: string[], stat: string, cacheMappings: Record<string, string>): string {
        let cacheKey = `leaderboards:${this.playerRepo.getCacheCollectionName()}:${path.join(":")}:${stat}`;
        for (const key in cacheMappings) {
            const value = cacheMappings[key];
            if (!value) {
                continue;
            }
            const regex = new RegExp(key, 'g');
            cacheKey = cacheKey.replace(regex, value);
        }
        return cacheKey;
    }

    async getLeaderboardStats(stat: string, path: string[]): Promise<SortedPlayerStats> {
        console.log("Getting leaderboard stats for stat:", stat, "- path:", path);
        const start = performance.now();
        const {categories, universal_stats, mappings, stat_mappings, cache_mappings} = getLeaderboardPaths();
        const cacheKey: string = this.getCacheKey(path, stat, cache_mappings);
        let cacheService: CacheService = new CacheService();
        let cacheResult: {} | null = await cacheService.get(cacheKey);
        if (cacheResult) {
            const end = performance.now();
            console.log("Cache Hit for", cacheKey, "(took", (end - start).toFixed(2), "ms)");
            return {
                data: new Map(Object.entries(cacheResult as Record<string, number>)),
                cached: true,
                durationMs: end - start
            };
        }

        const leaderboardStatPaths: LeaderboardStatPaths = getLeaderboardStatPaths();

        const statPaths: string[] | undefined = universal_stats.includes(stat)
            ? leaderboardStatPaths["universal"]
            : leaderboardStatPaths[stat];

        if (!statPaths) {
            throw new Error("Invalid stat");
        }

        const mappedStat: string = stat_mappings[stat] ?? stat;
        const statPathPrefix: string = path.join(".");
        const matchingMappedStatPaths: string[] = statPaths
            .filter(p => p.startsWith(statPathPrefix))
            .map(p => p
                .split(".")
                .map(seg => mappings[seg] ?? seg)
                .filter(Boolean)
                .join(".")
            );

        console.log("Mapped stat:", mappedStat);
        console.log("Path prefix:", statPathPrefix);
        console.log("Matching mapped stat paths:", matchingMappedStatPaths);

        let sortedStats: Map<string, number> = await this.getAllSortedStats(mappedStat, matchingMappedStatPaths);
        await cacheService.set(cacheKey, JSON.stringify(Object.fromEntries(sortedStats)));
        const end = performance.now();
        console.log("Cache Miss for", cacheKey, "(took", (end - start).toFixed(2), "ms)");
        return {
            data: sortedStats,
            cached: false,
            durationMs: end - start
        };
    }

    private async getAllSortedStats(stat: string, mappedPaths: string[]): Promise<Map<string, number>> {
        console.log("Calculating leaderboard for stat:", stat, "- paths:", mappedPaths);
        const allPlayers: WithId<Document>[] = await this.playerRepo.getAll();
        console.log("Fetched players:", allPlayers.length);
        const mappedPlayers: Map<any, number> = new Map(
            allPlayers.map(player => {
                const uuid = player.uuid.toString();
                const total = mappedPaths.reduce((sum, path) => {
                    const val = sumKeyAtPath(player, path, stat) || 0;
                    return sum + val;
                }, 0);
                return [uuid, total];
            })
        );
        let result: Map<any, number> = new Map([...mappedPlayers.entries()].sort((a, b) => b[1] - a[1]));
        console.log("Result:", result);
        return result;
    }

}


