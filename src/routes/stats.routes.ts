import {type Request, Router} from "express";
import {PlayerRepository} from "../respositories/player.repository.js";
import {PlayersInformationCollection} from "../db/enums.js";
import {getDB} from "../db/connection.js";
import {z} from "zod";
import {validate} from "../middleware/validationMiddleware.js";
import {StatsService} from "../services/stats.service.js";

const router = Router();

const PlayerStatsParamsSchema = z.object({
    uuid: z.uuid()
})

type PlayerStatsParams = z.infer<typeof PlayerStatsParamsSchema>;

router.get("/stats/:uuid", validate({
    params: PlayerStatsParamsSchema
}), async (req: Request<PlayerStatsParams>, res) => {
    const {uuid} = req.params;
    const repository: PlayerRepository = new PlayerRepository(getDB(), PlayersInformationCollection.Lifetime);
    const service: StatsService = new StatsService(repository);
    const stats = await service.getPlayerStats(uuid);
    res.json({
        success: true,
        data: stats
    });
});

export default router;
