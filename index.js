import { loadJSON } from "./src/utils/jsonLoader.js";
import { normalizeData } from "./src/data/normalize.js";
import { backtestAll } from "./src/engine/backtestAll.js";
import { exportTradesToCSV } from "./src/utils/csvExport.js";
import { globalMetrics } from "./src/utils/metrics.js";   // <-- AJOUT

function main() {
  console.log("=== Chargement des données SBF120 ===");
  const raw = loadJSON("./src/data/historicSBF120Data.json");
  const stocks = normalizeData(raw);

  console.log("Nombre d'actions :", stocks.length);

  console.log("\n=== Backtest multi-actifs ===");
  const { results, allTrades } = backtestAll(stocks, {
    fast: 10,
    slow: 20,
    initialCapital: 10000,
    positionPct: 0.25,
    stopLossPct: 0.05,
    takeProfitPct: 0.1
  });

  console.log("Nombre total de trades :", allTrades.length);

  console.log("\n=== Export CSV ===");
  exportTradesToCSV(allTrades, "./result/trade_journal_sbf120.csv");

  console.log("\n=== Exemple de résultats sur les actifs ===");
  console.table(results.slice(0, 10));

  console.log("\n=== Top 10 des meilleures actions (ROI décroissant) ===");
  const top10 = [...results]
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);

  console.table(top10);

  // 🔥 AJOUT : RÉCAP GLOBAL DE LA STRATÉGIE
  console.log("\n=== Récap global de la stratégie (toutes actions confondues) ===");

  const gm = globalMetrics(allTrades);

  console.table([{
    "Nombre total de trades": gm.totalTrades,
    "Winrate global": gm.winrate.toFixed(2) + " %",
    "Profit Factor global": gm.profitFactor.toFixed(2),
    "Risk/Reward moyen global": gm.avgRiskReward.toFixed(2),
    "Profit total (toutes actions)": gm.totalProfit.toFixed(2)
  }]);
}

main();