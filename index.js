import { loadJSON } from "./src/utils/jsonLoader.js";
import { normalizeData } from "./src/data/normalize.js";
import { backtestAll } from "./src/engine/backtestAll.js";
import { exportTradesToCSV, exportEquityCurveToCSV } from "./src/utils/csvExport.js";
import { globalMetrics, sharpeFromEquityCurve } from "./src/utils/metrics.js";
import { maxDrawdown } from "./src/utils/metrics.js";

function main() {
  console.log("=== Chargement des données SBF120 ===");
  const raw = loadJSON("./src/data/historicSBF120Data.json");
  const stocks = normalizeData(raw);
  const initialCapital = 10000

  console.log("Nombre d'actions :", stocks.length);

  console.log("\n=== Backtest multi-actifs ===");
  const { results, allTrades } = backtestAll(stocks, {
    strategy : "breakout",
    fastMA: 20,
    mediumMA: 50,
    slowMA: 200,
    lookback: 5,
    allowExitSignal: false,
    initialCapital: initialCapital,
    positionPct: 0.1,
    stopLossPct: 0.05,
    takeProfitPct: 0.25
  });

  // === Construction de l'equity curve globale ===
  // Trier tous les trades par date de sortie
  const sortedTrades = [...allTrades].sort((a, b) => {
    return new Date(a.exitDate) - new Date(b.exitDate);
  });

  // Construire l'equity curve globale
  let equity = initialCapital; // capital initial global
  const globalEquityCurve = [];

  for (const trade of sortedTrades) {
    equity += trade.pnlAbs;
    globalEquityCurve.push(equity);
  }
  exportEquityCurveToCSV(globalEquityCurve, "./result/global_equity_curve.csv");
  const globalMDD = maxDrawdown(globalEquityCurve);
  const sharpeRatio = sharpeFromEquityCurve(globalEquityCurve)


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
  console.log(`\n=== Récap global de la stratégie (toutes actions confondues) ===`);

  const gm = globalMetrics(allTrades);

  console.table([{
    "Nombre total de trades": gm.totalTrades,
    "Winrate global": gm.winrate.toFixed(2) + " %",
    "Profit Factor global": gm.profitFactor.toFixed(2),
    "Risk/Reward moyen global": gm.avgRiskReward.toFixed(2),
    "Profit total (toutes actions)": gm.totalProfit.toFixed(2),
    "Max Drawdown" : globalMDD.toFixed(2) + "%",
    "Sharpe Ratio" : sharpeRatio.toFixed(2)
  }]);
}

main();