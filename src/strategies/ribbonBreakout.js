import { SMA } from "../utils/indicators.js";

/**
 * Stratégie Ribbon Breakout
 *
 * - MA200 sur le close = filtre de tendance long terme
 * - MA20 High = borne haute du ruban
 * - MA20 Low  = borne basse du ruban
 *
 * CONDITIONS D'ACHAT :
 * --------------------
 * 1) MA20 High > MA200
 * 2) MA20 Low  > MA200
 * 3) close > MA20 High
 *
 * CONDITIONS DE VENTE :
 * ---------------------
 * (optionnel) si allowExitSignal = true :
 * - close < MA20 Low
 *
 * @param {object} stock - données OHLC alignées
 * @param {number[]} stock.closes
 * @param {number[]} stock.highs
 * @param {number[]} stock.lows
 * @param {object} options
 * @param {number} options.fastPeriodHigh - période MA high (ex: 20)
 * @param {number} options.fastPeriodLow  - période MA low  (ex: 20)
 * @param {number} options.slowPeriod     - période MA200
 * @param {boolean} options.allowExitSignal
 *
 * @returns {string[]} "buy" | "sell" | "hold"
 */
export function ribbonBreakoutSignals(
  { closes, highs, lows },
  {
    fastPeriodHigh = 20,
    fastPeriodLow = 20,
    slowPeriod = 200,
    allowExitSignal = true
  } = {}
) {

  const signals = Array(closes.length).fill("hold");

  // --- Calcul des moyennes mobiles ---
  const ma200 = SMA(closes, slowPeriod);
  const maHigh = SMA(highs, fastPeriodHigh);
  const maLow  = SMA(lows, fastPeriodLow);

  for (let i = 0; i < closes.length; i++) {
    const price = closes[i];

    // Si une MA n'est pas encore disponible → on ignore
    if (!ma200[i] || !maHigh[i] || !maLow[i]) continue;

    const trendOK =
      maHigh[i] > ma200[i] &&
      maLow[i]  > ma200[i];

    // === BUY ===
    if (trendOK && price > maHigh[i]) {
      signals[i] = "buy";
      continue;
    }

    // === SELL (optionnel) ===
    if (allowExitSignal && price < maLow[i]) {
      signals[i] = "sell";
      continue;
    }
  }

  return signals;
}