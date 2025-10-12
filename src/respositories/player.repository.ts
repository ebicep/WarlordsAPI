import {Binary, Db, type Document, type WithId} from "mongodb";
import {parse as uuidParse} from "uuid";
import {getKeyFromCollectionName} from "../db/enums.js";

export class PlayerRepository {

    constructor(
        private db: Db,
        private collection: string,
    ) {

    }

    getCacheCollectionName(): string {
        return getKeyFromCollectionName(this.collection).toLowerCase();
    }

    async getByUUID(uuid: string): Promise<WithId<Document> | null> {
        const arr: Buffer<ArrayBuffer> = Buffer.from(uuidParse(uuid));
        const binaryUUID: Binary = new Binary(arr, 4);
        return this.db.collection(this.collection).findOne({uuid: binaryUUID});
    }

    async getAll(mappedPaths: string[]): Promise<WithId<Document>[]> {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 2);

        const baseFields = ["_id", "uuid"];
        const includeFields = [...new Set([...baseFields, ...mappedPaths])];
        const projection = {
            ...Object.fromEntries(includeFields.map(f => [f, 1]))
        };
        return this.db.collection(this.collection)
            .find(
                {last_login: {$gte: oneYearAgo}},
                {projection: projection}
            )
            .toArray();
    }

}