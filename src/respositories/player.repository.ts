import {Binary, Collection, Db, type Document, MongoClient, type WithId} from "mongodb";
import { parse as uuidParse } from "uuid";

export class PlayerRepository {

    constructor(
        private db: Db,
        private collection: string,
    ) {

    }

    async getByUUID(uuid: string): Promise<WithId<Document> | null> {
        const arr: Buffer<ArrayBuffer> = Buffer.from(uuidParse(uuid));
        const binaryUUID: Binary = new Binary(arr, 4);
        return this.db.collection(this.collection).findOne({uuid : binaryUUID});
    }

    async getAll(): Promise<WithId<Document>[]> {
        return this.db.collection(this.collection).find().toArray();
    }

}