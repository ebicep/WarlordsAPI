import type {PlayerRepository} from "../respositories/player.repository.js";
import type {Document, InferIdType} from "mongodb";

type PlayerStats = Record<string, any> & { _id: string };

export class StatsService {

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

}
