import { loadJSON } from "../utils/jsonLoader.js";
import { normalizeData } from "./normalize.js";

export function loadMultipleJSON(paths) {
  let allStocks = [];

  for (const path of paths) {
    console.log(`Chargement : ${path}`);
    const raw = loadJSON(path);
    const stocks = normalizeData(raw);
    allStocks = allStocks.concat(stocks);
  }

  return allStocks;
}