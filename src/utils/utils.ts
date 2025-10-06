export function navigateJson(obj: any, keys: string[]): string[] | undefined {
    return keys.reduce((acc, key) => {
        if (acc && acc[key] !== undefined) {
            return acc[key];
        }
        return undefined;  // If any key is not found, return undefined
    }, obj);
}

export function collectArrays(data: any): string[] {
    let result: string[] = [];
    if (Array.isArray(data)) {
        result = result.concat(data);
    } else if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                result = result.concat(collectArrays(data[key]));
            }
        }
    }
    return result;
}