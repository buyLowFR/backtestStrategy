import { backtestPortfolio } from "./src/engine/backtestPortfolio.js";
import { exportTradesToCSV, exportEquityCurveToCSV } from "./src/utils/csvExport.js";
import { globalPortfolioMetrics } from "./src/utils/metrics.js";
import { loadMultipleJSON } from "./src/data/loadData.js";

function main() {
  console.log("=== Chargement des données SP500 ===");

  const files = [
    "./src/data/SP500(1-50).json",
    "./src/data/SP500(51-100).json",
    "./src/data/SP500(101-150).json",
    "./src/data/SP500(151-200).json",
    "./src/data/SP500(201-250).json",
    "./src/data/SP500(251-300).json",
    "./src/data/SP500(301-350).json",
    "./src/data/SP500(351-400).json",
    "./src/data/SP500(401-450).json",
    "./src/data/SP500(451-500).json",
  ];

  const stocks = loadMultipleJSON(files);
  const initialCapital = 10000;

  console.log("Nombre d'actions :", stocks.length);

  console.log("\n=== Backtest portefeuille global ===");

  const {
    finalCapital,
    equityCurve,
    allTrades
  } = backtestPortfolio(stocks, {
    strategy: "pivotBreakout", //"ribbonBreakout" "pivotBreakout"
    fastMA: 20,
    mediumMA: 50,
    slowMA: 200,
    lookback: 5,
    allowExitSignal: false,
    initialCapital,
    positionPct: 0.1,
    stopLossPct: 0.05,
    takeProfitPct: 0.05,
    lenHigh: 3,
    pivotLife : 15,
    fastPeriodHigh: 20,
    fastPeriodLow : 20,
    requireHigherHigh: false,
    tradeProbability : 1
  });

  exportEquityCurveToCSV(equityCurve, "./result/global_equity_curve.csv");
  exportTradesToCSV(allTrades, "./result/trade_journal_portfolio.csv");

  console.log("Nombre total de trades :", allTrades.length);

  console.log("\n=== Récap global du portefeuille ===");

  const gm = globalPortfolioMetrics(allTrades, equityCurve, initialCapital);

  console.table([{
    "Capital initial": initialCapital,
    "Capital final": finalCapital.toFixed(2),
    "Profit total": (finalCapital - initialCapital).toFixed(2),
    "Winrate global": gm.winrate.toFixed(2) + " %",
    "Profit Factor": gm.profitFactor.toFixed(2),
    "Risk/Reward moyen": gm.avgRiskReward.toFixed(2),
    "Max Drawdown": gm.maxDrawdown.toFixed(2) + " %",
    "Sharpe Ratio": gm.sharpe.toFixed(2),
    "Durée moyenne des trades": gm.averageTradeDuration.toFixed(2) + " jours"
  }]);
}

main();