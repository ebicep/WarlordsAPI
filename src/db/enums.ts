import {z} from "zod";

export const Database = {
    Warlords: "Warlords",
} as const;

export const PlayersInformationCollection = {
    Lifetime: "Lifetime",
    Monthly: "Monthly",
    Weekly: "Weekly",
    Daily: "Daily",
} as const;

export function getCollectionNameFromValue(collection: keyof typeof PlayersInformationCollection): string {
    return getCollectionNameFromKey(PlayersInformationSchema.parse(collection));
}

function getCollectionNameFromKey(collection: keyof typeof PlayersInformationCollection): string {
    switch (collection) {
        case PlayersInformationCollection.Lifetime:
            return "Players_Information";
        case PlayersInformationCollection.Monthly:
            return "Players_Information_Monthly";
        case PlayersInformationCollection.Weekly:
            return "Players_Information_Weekly";
        case PlayersInformationCollection.Daily:
            return "Players_Information_Daily";
        default:
            throw new Error("Invalid collection");
    }
}

export function getKeyFromCollectionName(collectionName: string): keyof typeof PlayersInformationCollection {
    switch (collectionName) {
        case "Players_Information":
            return PlayersInformationCollection.Lifetime;
        case "Players_Information_Monthly":
            return PlayersInformationCollection.Monthly;
        case "Players_Information_Weekly":
            return PlayersInformationCollection.Weekly;
        case "Players_Information_Daily":
            return PlayersInformationCollection.Daily;
        default:
            throw new Error("Invalid collection name");
    }
}

export const PlayersInformationKeySchema = zodEnumMapCaseInsensitive(PlayersInformationCollection, "Lifetime");

export const PlayersInformationSchema = PlayersInformationKeySchema.transform(
    (key) => PlayersInformationCollection[key as keyof typeof PlayersInformationCollection]
);

export function zodEnumMapCaseInsensitive<T extends Record<string, string>>(
    obj: T,
    defaultKey?: keyof T
) {
    const lowerKeyMap = Object.fromEntries(
        Object.keys(obj).map((k) => [k.toLowerCase(), k])
    ) as Record<string, keyof T>;

    return z
        .string()
        .optional()
        .transform((val: string | undefined) => val?.toLowerCase())
        .transform((val) => {
            const matchedKey = val && lowerKeyMap[val] ? lowerKeyMap[val] : defaultKey;
            if (!matchedKey) {
                throw new Error("No valid key provided and no default key configured.");
            }
            return obj[matchedKey];
        });
}
