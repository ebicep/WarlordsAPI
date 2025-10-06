import type {PlayerRepository} from "../respositories/player.repository.js";
import type {Document, InferIdType} from "mongodb";
import {sumKeyAtPath} from "./compute.utils.js";

type PlayerStats = Record<string, any> & { _id: string };
type SortedPlayerStats = Map<string, number>;

export class ComputeService {

    constructor(
        private playerRepo: PlayerRepository
    ) {

    }

    async getPlayerStats(uuid: string): Promise<PlayerStats | null> {
        const player: (Document & { _id: InferIdType<Document> }) | null = await this.playerRepo.getByUUID(uuid);
        if (!player) {
            return null;
        }

        return {
            ...player,
            _id: player._id.toString()
        };
    }

    async getAllSortedStats(stat: string, mappedPaths: string[]): Promise<SortedPlayerStats> {
        // const allPlayers = await this.playerRepo.getAll();
        const allPlayers = [(await this.playerRepo.getByUUID("5a8046c6-731b-429f-a121-7f3da033fabc"))!];
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


