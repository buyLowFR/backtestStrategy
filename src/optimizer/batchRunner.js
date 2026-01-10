import { backtestPortfolio } from "../engine/backtestPortfolio.js";
import { exportToCSV } from "../utils/csvExport.js";
import { maxDrawdown, tradeMetrics } from "../utils/metrics.js";

export function runBatch(stocks, {
  strategy,
  vary = {},
  baseOptions = {},
  output = null
} = {}) {

  const varyKeys = Object.keys(vary);
  const results = [];

  // Génère toutes les combinaisons
  function* combinations(index = 0, current = {}) {
    if (index === varyKeys.length) {
      yield current;
      return;
    }
    const key = varyKeys[index];
    for (const value of vary[key]) {
      yield* combinations(index + 1, { ...current, [key]: value });
    }
  }

  for (const combo of combinations()) {

    const options = {
      ...baseOptions,
      ...combo,
      strategy
    };

    const {
      finalCapital,
      equityCurve,
      allTrades
    } = backtestPortfolio(stocks, options);

    // ROI
    const roi = (finalCapital / options.initialCapital - 1) * 100;

    // Max Drawdown (réutilisation)
    const maxDD = maxDrawdown(equityCurve);

    // Sharpe (on garde ta version robuste)
    const sharpe = (() => {
      if (!equityCurve || equityCurve.length < 2) return 0;
      const returns = [];
      for (let i = 1; i < equityCurve.length; i++) {
        const prev = equityCurve[i - 1];
        const curr = equityCurve[i];
        if (!prev || !curr || prev <= 0) continue;
        const r = (curr - prev) / prev;
        if (!isFinite(r)) continue;
        returns.push(r);
      }
      if (returns.length === 0) return 0;
      const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((acc, r) => acc + (r - avg) ** 2, 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      if (!isFinite(stdDev) || stdDev === 0) return 0;
      return (avg / stdDev) * Math.sqrt(252);
    })();

    // 🔥 Profit Ratio
    const profitRatio = (() => {
      if (!allTrades || allTrades.length === 0) return 0;
      const wins = allTrades.filter(t => t.pnlAbs > 0);
      const losses = allTrades.filter(t => t.pnlAbs < 0);
      const totalWin = wins.reduce((acc, t) => acc + t.pnlAbs, 0);
      const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnlAbs, 0));
      if (totalLoss === 0) return Infinity;
      return totalWin / totalLoss;
    })();

    // 🔥 WINRATE (réutilisation de tradeMetrics)
    const { winrate } = tradeMetrics(allTrades);

    results.push({
      ...combo,
      finalCapital,
      roi,
      maxDrawdown: maxDD,
      sharpe,
      profitRatio,
      winrate  
    });
  }

  if (output) {
    exportToCSV(results, output);
  }

  return results;
}