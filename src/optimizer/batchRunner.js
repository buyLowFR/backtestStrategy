import { backtestAll } from "../engine/backtestAll.js";
import {exportToCSV} from "../utils/csvExport.js"
import { globalPortfolioMetrics } from "../utils/metrics.js";

/**
 * Lance un batch de backtests en faisant varier des paramètres.
 *
 * @param {Array} stocks - données des actions
 * @param {object} config
 * @param {string} config.strategy - nom de la stratégie
 * @param {object} config.vary - paramètres à faire varier
 * @param {object} config.baseOptions - options fixes
 * @param {string} config.output - fichier de sortie JSON
 */
export function runBatch(stocks, {
  strategy,
  vary,
  baseOptions = {},
  output = "./result/batch_results.csv"
}) {
  const combinations = generateCombinations(vary);
  const results = [];

  for (const combo of combinations) {
    const options = { ...baseOptions, ...combo, strategy };

    const { results: btResults, allTrades } = backtestAll(stocks, options);

    // Construire l'equity curve globale
    let equity = baseOptions.initialCapital;
    const globalEquityCurve = [];

    const sortedTrades = [...allTrades].sort((a, b) => {
    return new Date(a.exitDate) - new Date(b.exitDate);
    });

    for (const trade of sortedTrades) {
    equity += trade.pnlAbs;
    globalEquityCurve.push(equity);
    }

    const gm = globalPortfolioMetrics(allTrades, globalEquityCurve, baseOptions.initialCapital);

    // Agrégation simple des métriques globales
    const global = {
      ...combo,
      finalCapital: btResults.reduce((acc, r) => acc + r.finalCapital, 0),
      roi: gm.roi,
      winrate: gm.winrate,
      profitFactor: gm.profitFactor,
      MaxDrawdown: gm.maxDrawdown,
      trades: allTrades.length,
      sharpeRatio : gm.sharpe
    };

    results.push(global);
  }

  exportToCSV(results, output);

  return results;
}

/**
 * Génère toutes les combinaisons possibles des paramètres.
 */
function generateCombinations(paramObject) {
  const keys = Object.keys(paramObject);
  const values = Object.values(paramObject);

  const combos = [[]];

  for (const arr of values) {
    const newCombos = [];
    for (const combo of combos) {
      for (const val of arr) {
        newCombos.push([...combo, val]);
      }
    }
    combos.splice(0, combos.length, ...newCombos);
  }

  return combos.map(c =>
    Object.fromEntries(c.map((v, i) => [keys[i], v]))
  );
}