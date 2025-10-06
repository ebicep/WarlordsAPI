import express, {type ErrorRequestHandler} from "express";
import stats from "./routes/stats.routes.js";
import leaderboards from "./routes/leaderboard.routes.js";
import {connect} from "./db/connection.js";

const app = express();
app.use(express.json());
app.use("/api", stats);
app.use("/api", leaderboards);
app.use(((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({error: err.message || "Internal Server Error"});
}) as ErrorRequestHandler);

await connect()

export default app;
