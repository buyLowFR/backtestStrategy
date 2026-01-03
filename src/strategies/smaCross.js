import { SMA } from "../utils/indicators.js";

/**
 * Stratégie triple moyenne mobile générique :
 * fast < medium < slow
 *
 * Conditions :
 * - BUY : fast croise medium à la hausse
 *         ET fast > slow
 *         ET medium > slow
 *
 * - SELL : fast croise medium à la baisse
 *          (désactivable via allowExitSignal)
 *
 * @param {number[]} closes - Liste des prix de clôture
 * @param {number} fast - Période de la moyenne rapide
 * @param {number} medium - Période de la moyenne intermédiaire
 * @param {number} slow - Période de la moyenne lente
 * @param {object} options - Options supplémentaires
 * @param {boolean} options.allowExitSignal - Active/désactive les signaux SELL
 *
 * @returns {string[]} Tableau de signaux : "buy" | "sell" | "hold"
 */
export function tripleMASignals(
  closes,
  fast = 20,
  medium = 50,
  slow = 200,
  { allowExitSignal = true } = {}
) {
  const maFast = SMA(closes, fast);
  const maMedium = SMA(closes, medium);
  const maSlow = SMA(closes, slow);

  const signals = Array(closes.length).fill("hold");

  for (let i = 1; i < closes.length; i++) {
    const prevFast = maFast[i - 1];
    const prevMedium = maMedium[i - 1];
    const currFast = maFast[i];
    const currMedium = maMedium[i];
    const currSlow = maSlow[i];

    // On ne trade que si les 3 MAs existent
    if (!prevFast || !prevMedium || !currFast || !currMedium || !currSlow) continue;

    // BUY : fast croise medium à la hausse + fast & medium > slow
    const bullishCross =
      prevFast < prevMedium &&
      currFast > currMedium &&
      currFast > currSlow &&
      currMedium > currSlow;

    // SELL : fast croise medium à la baisse
    const bearishCross =
      prevFast > prevMedium &&
      currFast < currMedium;

    if (bullishCross) {
      signals[i] = "buy";
    } else if (bearishCross && allowExitSignal) {
      // SELL uniquement si autorisé
      signals[i] = "sell";
    }
  }

  return signals;
}