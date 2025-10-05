import express, {type ErrorRequestHandler, type NextFunction} from "express";
import dataRoutes from "./routes/data.routes.js";
import {connect} from "./db/connection.js";

const app = express();
app.use(express.json());
app.use("/api", dataRoutes);
app.use(((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({error: err.message || "Internal Server Error"});
}) as ErrorRequestHandler);

await connect()

export default app;