/**
 * Recursively searches inside an object for a given key and sums values.
 *
 * @param obj - The root object (MongoDB doc or plain JS object)
 * @param path - Dot-notation path string, e.g. "ctf_stats.game_1"
 * @param key - Key name to match (e.g. "kills")
 */
export function sumKeyAtPath(
    obj: any,
    path: string,
    key: string
): number {
    // Navigate to path (e.g. obj["ctf_stats"]["game_1"])
    const parts = path.split(".");
    let current: any = obj;
    for (const part of parts) {
        current = current?.[part];
        if (current === undefined) {
            return 0;
        }
    }

    // Recursively walk object and sum/concat values
    function recursiveSum(node: any): any {
        if (!node || typeof node !== "object") {
            return 0;
        }

        let total: number = 0;

        for (const [k, v] of Object.entries(node)) {
            if (k === key && typeof v === "number") {
                total += v;
            }
            if (typeof v === "object") {
                total += recursiveSum(v);
            }
        }
        return total;
    }

    return recursiveSum(current);
}