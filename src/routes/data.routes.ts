import {type Request, Router} from "express";
import {PlayerRepository} from "../respositories/player.repository.js";
import {COLLECTIONS} from "../db/enums.js";
import {db} from "../db/connection.js";
import {ComputeService} from "../services/compute.service.js";
import {z} from "zod";
import {validate} from "../middleware/validationMiddleware.js";

const router = Router();

const StatsParams = z.object({
    uuid: z.uuid()
})

type PlayerStatsParams = z.infer<typeof StatsParams>;

router.get("/stats/:uuid", validate({params: StatsParams}), async (req: Request<PlayerStatsParams>, res) => {
    const {uuid} = req.params;
    const repository: PlayerRepository = new PlayerRepository(db, COLLECTIONS.PLAYERS_INFORMATION);
    const service: ComputeService = new ComputeService(repository);
    const stats = await service.getPlayerStats(uuid);
    res.json({
        success: true,
        data: stats
    });
});


export default router;