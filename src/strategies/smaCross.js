import { SMA } from "../utils/indicators.js";

/**
 * Génère des signaux "buy", "sell" ou "hold" à partir d'une stratégie de croisement de SMA.
 * @param {number[]} closes - tableau des prix de clôture
 * @param {number} fast - période SMA rapide
 * @param {number} slow - période SMA lente
 * @returns {("buy"|"sell"|"hold")[]}
 */
export function smaCrossSignals(closes, fast = 10, slow = 20) {
  const fastMA = SMA(closes, fast);
  const slowMA = SMA(closes, slow);

  return closes.map((_, i) => {
    // if SMA is not defined
    if (!fastMA[i] || !slowMA[i]) return "hold";

    if (fastMA[i] > slowMA[i]) return "buy";
    if (fastMA[i] < slowMA[i]) return "sell";

    return "hold";
  });
}