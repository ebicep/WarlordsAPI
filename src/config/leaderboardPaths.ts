import {loadConfigFile} from "../utils/fileLoader.js";

export interface LeaderboardPaths {
    categories: Categories;
    universal_stats: string[];
    timeframes: string[];
    mappings: Record<string, string>;
    stat_mappings: Record<string, string>;
}

export interface Categories {
    pvp: Pvp;
    pve: Pve;
}

export interface Pve {
    modes: PveModes;
}

export interface PveModes {
    "wave-defense": Stats;
    onslaught: Stats;
}

export interface Stats {
    stats: string[];
}

export interface Pvp {
    modes: PvpModes;
}

export interface PvpModes {
    competitive: Competitive;
    public: Competitive;
}

export interface Competitive {
    types: Types;
}

export interface Types {
    ctf: Stats;
}

function invertSchema(schema: LeaderboardPaths): LeaderboardStatPaths {
    const result: LeaderboardStatPaths = {};
    const allPaths: Set<string> = new Set<string>();

    function walk(obj: any, path: string[] = []) {
        for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value)) {
                for (const stat of value) {
                    if (!result[stat]) {
                        result[stat] = [];
                    }
                    const p = path.concat(key).join(".");
                    result[stat].push(p);
                    allPaths.add(p);
                }
            } else if (typeof value === "object" && value !== null) {
                walk(value, path.concat(key));
            }
        }
    }

    walk(schema.categories);

    result["universal"] = Array.from(allPaths);

    return result;
}

let loaded = false;
let leaderboardPaths: LeaderboardPaths | null = null;
let leaderboardStatPaths: LeaderboardStatPaths | null = null;

export type LeaderboardStatPaths = Record<string, string[]>;

function loadLeaderboardPaths() {
    leaderboardPaths = loadConfigFile<LeaderboardPaths>("leaderboard_paths.json");
    leaderboardStatPaths = invertSchema(leaderboardPaths);
    loaded = true;
    console.log("Loaded leaderboard paths:", leaderboardPaths);
    console.log("Loaded leaderboard stat paths:", leaderboardStatPaths);
}

export function getLeaderboardPaths(): LeaderboardPaths {
    if (!loaded) {
        loadLeaderboardPaths();
    }
    return <LeaderboardPaths>leaderboardPaths;
}

export function getLeaderboardStatPaths(): LeaderboardStatPaths {
    if (!loaded) {
        loadLeaderboardPaths();
    }
    return <LeaderboardStatPaths>leaderboardStatPaths;
}
