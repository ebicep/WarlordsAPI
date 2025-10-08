import type {PlayerRepository} from "../respositories/player.repository.js";
import {sumKeyAtPath} from "./leaderboard.utils.js";

type SortedPlayerStats = Map<string, number>;

export class LeaderboardService {

    constructor(
        private playerRepo: PlayerRepository
    ) {

    }

    async getAllSortedStats(stat: string, mappedPaths: string[]): Promise<SortedPlayerStats> {
        const allPlayers = await this.playerRepo.getAll();
        console.log("Fetched " + allPlayers.length + " players from database.");
        const mappedPlayers: Map<string, number> = new Map(
            allPlayers.map(value => {
                const uuid = value["uuid"].toString();
                const playerValue = mappedPaths.reduce((sum, path) => {
                    const pathValue = sumKeyAtPath(value, path, stat) || 0;
                    return sum + pathValue;
                }, 0);
                return [uuid, playerValue];
            })
        );
        console.log(mappedPlayers);
        return new Map(
            [...mappedPlayers.entries()].sort((a, b) => b[1] - a[1])
        );
    }

}


