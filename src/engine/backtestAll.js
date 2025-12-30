import { smaCrossSignals } from "../strategies/smaCross.js";
import { backtestSingle } from "./backtestSingle.js";

export function backtestAll(
  stocks,
  {
    fast = 10,
    slow = 20,
    initialCapital = 10000,
    positionPct = 0.25,
    stopLossPct = 0.05,
    takeProfitPct = 0.1
  } = {}
) {
  const results = [];
  const allTrades = [];

  for (const stock of stocks) {
    const signals = smaCrossSignals(stock.closes, fast, slow);

    const stats = backtestSingle(
      stock.closes,
      signals,
      stock.dates,
      {
        symbol: stock.ticker,
        name: stock.name,
        initialCapital,
        positionPct,
        stopLossPct,
        takeProfitPct
      }
    );

    results.push({
      ticker: stock.ticker,
      name: stock.name,
      finalCapital: stats.finalCapital,
      profit: stats.profit,
      roi: stats.roi,
      tradesCount: stats.trades.length
    });

    allTrades.push(...stats.trades);
  }

  return {
    results,
    allTrades
  };
}