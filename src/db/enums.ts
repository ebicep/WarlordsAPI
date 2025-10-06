import {z} from "zod";


export const Database = {
    Warlords: "Warlords",
} as const;

export const PlayersInformationCollection = {
    Lifetime: "Players_Information",
    Monthly: "Players_Information_Monthly",
    Weekly: "Players_Information_Weekly",
    Daily: "Players_Information_Daily",
} as const;

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

console.log(PlayersInformationSchema.parse("Lifetime"));
// → "Players_Information"

console.log(PlayersInformationSchema.parse("WEEKLY"));
// → "Players_Information_Weekly"

console.log(PlayersInformationSchema.parse(undefined));
// → "Players_Information"
