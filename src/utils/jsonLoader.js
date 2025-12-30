import fs from "fs";

export function loadJSON(path) {
  const raw = fs.readFileSync(path, "utf8");
  return JSON.parse(raw);
}