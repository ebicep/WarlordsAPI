import {Router} from "express";
import type {Request, Response} from 'express';
import {UUID_REGEX} from "../utils/validators.js";
import {PlayerRepository} from "../respositories/player.repository.js";
import {COLLECTIONS} from "../db/enums.js";
import {db} from "../db/connection.js";
import {ComputeService} from "../services/compute.service.js";

const router = Router();

interface StatsParams {
    uuid: string;
}

router.get("/stats/:uuid", async (req: Request<StatsParams>, res: Response) => {
    const {uuid}: StatsParams = req.params;
    if (!UUID_REGEX.test(uuid)) {
        return res.status(400).json({error: "Invalid UUID format"});
    }
    const repository: PlayerRepository = new PlayerRepository(db, COLLECTIONS.PLAYERS_INFORMATION)
    const service: ComputeService = new ComputeService(repository);
    const stats = await service.getPlayerStats(uuid);
    res.json({
        success: true,
        data: stats
    });
});



export default router;