import {Db, MongoClient} from "mongodb";
import {Database} from "./enums.js";

export let db: Db;

export async function connect() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not defined in environment variables.");
        return;
    }
    console.log("Connecting to MongoDB...");
    const client: MongoClient = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db(Database.Warlords);
    // const collection: Collection = db.collection(COLLECTIONS.PLAYERS_INFORMATION);
    //
    // const docs: WithId<Document>[] = await collection.find().toArray();
    // docs.forEach(value => {
    //     console.log(value["name"] + " = " + sumKeyAtPath(value, "comp_stats", "kills"));
    // })
}
