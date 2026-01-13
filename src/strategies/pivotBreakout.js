import { SMA } from "../utils/indicators.js";

/**
 * Stratégie Pivot Breakout (version TradingView adaptée)
 *
 * PARAMÈTRES :
 * ------------
 * lenHigh :
 *    → largeur du pivot haut (swing high)
 *    → correspond au nombre de barres à gauche ET à droite
 *      nécessaires pour confirmer un pivot haut.
 *    → Exemple : lenHigh = 5 signifie :
 *         - la bougie centrale doit être plus haute que les 5 précédentes
 *         - ET plus haute que les 5 suivantes
 *      → C’est un pivot structurel, pas un plus haut glissant.
 *
 * pivotLife :
 *    → durée de vie du pivot après sa confirmation
 *    → nombre de barres pendant lesquelles le pivot reste valide
 *      et peut être cassé.
 *    → Si le prix casse le pivot pendant cette fenêtre → BUY
 *    → Sinon → pivot expiré, on l’ignore.
 *    → Exemple : pivotLife = 30 → pivot valide pendant 30 barres.
 *
 * allowExitSignal :
 *    → si true : SELL sur cassure baissière du pivot
 *    → si false : seules les sorties SL/TP sont utilisées
 *
 * trendMA :
 *    → période de la moyenne mobile utilisée comme filtre de tendance
 *    → BUY uniquement si prix > MA(trendMA)
 *
 * @returns {string[]} Tableau de signaux : "buy" | "sell" | "hold"
 */

export function pivotBreakoutSignals(
  closes,
  {
    lenHigh = 5,
    pivotLife = 30,
    allowExitSignal = true,
    trendMA = 200
  } = {}
) {
  const signals = Array(closes.length).fill("hold");

  // --- MA pour filtre de tendance ---
  const maTrend = SMA(closes, trendMA);

  let pivotY = null;      // valeur du pivot
  let pivotIndex = null;  // index du pivot
  let pivotActive = false;

  // --- Détection pivot haut (équivalent ta.pivothigh) ---
  function isPivotHigh(i) {
    if (i < lenHigh || i > closes.length - lenHigh - 1) return false;

    const center = closes[i];

    for (let k = 1; k <= lenHigh; k++) {
      if (closes[i - k] >= center) return false;
      if (closes[i + k] >= center) return false;
    }
    return true;
  }

  for (let i = 0; i < closes.length; i++) {
    const price = closes[i];

    // 1) Nouveau pivot confirmé
    if (isPivotHigh(i)) {
      pivotY = closes[i];
      pivotIndex = i;
      pivotActive = true;
    }

    // 2) Si pivot actif, vérifier expiration
    if (pivotActive) {
      if (i - pivotIndex > pivotLife) {
        pivotActive = false;
        pivotY = null;
        pivotIndex = null;
        continue;
      }

      // --- Filtre MA200 : prix doit être > MA200 ---
      const trendOK = maTrend[i] && price > maTrend[i];

      // 3) Cassure haussière → BUY si tendance OK
      if (price > pivotY && trendOK) {
        signals[i] = "buy";
        pivotActive = false;
      }

      // 4) Cassure baissière → SELL (optionnel)
      if (allowExitSignal && price < pivotY) {
        signals[i] = "sell";
        pivotActive = false;
      }
    }
  }

  return signals;
}