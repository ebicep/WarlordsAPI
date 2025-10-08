import {Db, MongoClient} from "mongodb";
import {Database} from "./enums.js";

let db: Db | null = null;

export function getDB(): Db {
    if (!db) {
        throw new Error("DB not initialized");
    }
    return db;
}

export async function connectMongo() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not defined in environment variables.");
        return;
    }
    console.log("Connecting to MongoDB...");
    const client: MongoClient = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db(Database.Warlords);
}
