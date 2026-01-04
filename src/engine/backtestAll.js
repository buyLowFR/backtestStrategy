import { getStrategySignals } from "../strategies/strategyFactory.js";
import { backtestSingle } from "./backtestSingle.js";

export function backtestAll(
  stocks,
  {
    strategy = "smaCross",
    fastMA = 20,      // ex: MA20
    mediumMA = 50,    // ex: MA50
    slowMA = 200,     // ex: MA200
    lookback = 5,
    allowExitSignal= false,
    initialCapital = 10000,
    positionPct = 0.25,
    stopLossPct = 0.05,
    takeProfitPct = 0.1
  } = {}
) {
  const results = [];
  const allTrades = [];

  for (const stock of stocks) {
    const signals = getStrategySignals(strategy, stock, {
      fastMA,
      mediumMA,
      slowMA,
      lookback,
      allowExitSignal
    });


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
      tradesCount: stats.trades.length,
      maxDrawdown: stats.maxDrawdown,
      winrate: stats.winrate,
      profitFactor: stats.profitFactor,
      avgRiskReward: stats.avgRiskReward
    });

    allTrades.push(...stats.trades);
  }

  return {
    results,
    allTrades
  };
}