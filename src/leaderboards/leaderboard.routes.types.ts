import {z} from "zod";
import {PlayersInformationKeySchema} from "../db/enums.js";

export const LeaderboardParamsSchema = z.object({
    stat: z.string(),
    path: z.array(z.string()).default([]),
})
export type LeaderboardParams = z.infer<typeof LeaderboardParamsSchema>;

export const LeaderboardQuerySchema = z.object({
    timeframe: PlayersInformationKeySchema,
    limit: z.coerce.number().int().min(1).max(50).default(30),
    // offset: z.coerce.number().int().nonnegative().optional().default(0)
});

export type LeaderboardQuery = z.infer<typeof LeaderboardQuerySchema>;