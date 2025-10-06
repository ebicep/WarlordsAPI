import fs from "fs";
import path from "path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadConfigFile<T>(fileName: string): T {
    const filePath = path.join(__dirname, "..", "config", fileName);
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as T;
}