import type {PlayerRepository} from "../respositories/player.repository.js";
import {sumKeyAtPath} from "./leaderboard.utils.js";
import {getLeaderboardPaths, getLeaderboardStatPaths, type LeaderboardStatPaths} from "../config/leaderboardPaths.js";
import type {Document, WithId} from "mongodb";

type SortedPlayerStats = Map<string, number>;

export class LeaderboardService {

    constructor(
        private playerRepo: PlayerRepository
    ) {

    }

    async getLeaderboardStats(stat: string, path: string[]): Promise<SortedPlayerStats> {
        console.log("Getting leaderboard stats for stat:", stat, "- path:", path);
        const {categories, universal_stats, mappings, stat_mappings} = getLeaderboardPaths();
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

        return this.getAllSortedStats(mappedStat, matchingMappedStatPaths);
    }

    private async getAllSortedStats(stat: string, mappedPaths: string[]): Promise<SortedPlayerStats> {
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


