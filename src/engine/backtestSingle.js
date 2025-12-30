import { maxDrawdown, tradeMetrics } from "../utils/metrics.js";

/**
 * Backtest d'une seule action avec journal de trades + métriques avancées.
 *
 * @param {number[]} closes
 * @param {("buy"|"sell"|"hold")[]} signals
 * @param {string[]} [dates] - dates correspondantes (optionnel mais recommandé)
 * @param {object} options
 */
export function backtestSingle(
  closes,
  signals,
  dates = [],
  {
    symbol = "",
    name = "",
    initialCapital = 10000,
    positionPct = 1.0,
    stopLossPct = 0.05,
    takeProfitPct = 0.1
  } = {}
) {
  let capital = initialCapital;
  let positionSize = 0;
  let entryPrice = null;
  let entryIndex = null;
  let stopLossPrice = null;
  let takeProfitPrice = null;

  const trades = [];
  const equityCurve = [];

  const getDate = (i) => (dates && dates[i]) ? dates[i] : null;

  const closePosition = (exitPrice, exitIndex, exitReason) => {
    const exitValue = positionSize * exitPrice;
    const entryValue = positionSize * entryPrice;
    const pnlAbs = exitValue - entryValue;
    const pnlPct = (exitPrice / entryPrice - 1) * 100;

    capital += exitValue;

    trades.push({
      symbol,
      name,
      entryIndex,
      entryDate: getDate(entryIndex),
      entryPrice,
      exitIndex,
      exitDate: getDate(exitIndex),
      exitPrice,
      exitReason,
      positionPct,
      qty: positionSize,
      pnlAbs,
      pnlPct
    });

    positionSize = 0;
    entryPrice = null;
    entryIndex = null;
    stopLossPrice = null;
    takeProfitPrice = null;
  };

  for (let i = 0; i < closes.length; i++) {
    const price = closes[i];
    const signal = signals[i];
    const hasPosition = positionSize > 0;

    // 1) Stop loss / Take profit
    if (hasPosition) {
      if (price <= stopLossPrice) {
        closePosition(price, i, "stop_loss");
      } else if (price >= takeProfitPrice) {
        closePosition(price, i, "take_profit");
      }
    }

    // 2) Signaux buy/sell
    if (signal === "buy" && !hasPosition) {
      const amountToInvest = capital * positionPct;

      if (amountToInvest > 0) {
        positionSize = amountToInvest / price;
        capital -= amountToInvest;

        entryPrice = price;
        entryIndex = i;
        stopLossPrice = entryPrice * (1 - stopLossPct);
        takeProfitPrice = entryPrice * (1 + takeProfitPct);
      }
    }

    if (signal === "sell" && hasPosition) {
      closePosition(price, i, "signal");
    }

    // 3) Equity curve (capital + valeur de la position)
    const equity = capital + (positionSize * price);
    equityCurve.push(equity);
  }

  // 4) Liquidation finale
  if (positionSize > 0) {
    const lastPrice = closes[closes.length - 1];
    closePosition(lastPrice, closes.length - 1, "end_of_data");
    equityCurve[equityCurve.length - 1] = capital; // mise à jour finale
  }

  // 5) Calcul des métriques
  const finalCapital = capital;
  const profit = finalCapital - initialCapital;
  const roi = (finalCapital / initialCapital - 1) * 100;

  const mdd = maxDrawdown(equityCurve);
  const tm = tradeMetrics(trades);

  return {
    initialCapital,
    finalCapital,
    profit,
    roi,
    trades,
    equityCurve,
    maxDrawdown: mdd,
    winrate: tm.winrate,
    profitFactor: tm.profitFactor,
    avgRiskReward: tm.avgRR
  };
}