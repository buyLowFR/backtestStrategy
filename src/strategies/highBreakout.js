import { SMA } from "../utils/indicators.js";

/**
 * Stratégie Breakout avec filtre de tendance MA200 :
 * - BUY uniquement si cassure du plus haut ET prix > MA200
 *
 * @param {number[]} closes - Liste des prix de clôture
 * @param {number} lookback - Nombre de périodes pour chercher le dernier point haut
 * @param {object} options
 * @param {boolean} options.allowExitSignal - Active/désactive les signaux SELL
 * @param {number} options.trendMA - Période de la MA utilisée comme filtre (ex: 200)
 *
 * @returns {string[]} Tableau de signaux : "buy" | "sell" | "hold"
 */
export function highBreakoutSignals(
  closes,
  lookback = 20,
  { allowExitSignal = true, trendMA = 200 } = {}
) {
  const signals = Array(closes.length).fill("hold");

  // --- MA200 pour filtre de tendance ---
  const maTrend = SMA(closes, trendMA);

  for (let i = lookback; i < closes.length; i++) {
    // 1) Filtre de tendance : prix doit être > MA200
    if (!maTrend[i] || closes[i] <= maTrend[i]) {
      continue; // pas de BUY possible
    }

    // 2) Trouver le plus haut des lookback dernières clôtures
    const window = closes.slice(i - lookback, i);
    const highestHigh = Math.max(...window);

    const prevClose = closes[i - 1];
    const currClose = closes[i];

    // BUY : cassure haussière du dernier point haut + filtre MA200
    const bullishBreakout =
      prevClose <= highestHigh && currClose > highestHigh;

    // SELL : cassure baissière (optionnel)
    const bearishBreakout =
      prevClose >= highestHigh && currClose < highestHigh;

    if (bullishBreakout) {
      signals[i] = "buy";
    } else if (bearishBreakout && allowExitSignal) {
      signals[i] = "sell";
    }
  }

  return signals;
}