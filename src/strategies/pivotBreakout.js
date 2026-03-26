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
 * requireHigherHigh :
 *    → si true : on n'entre que si le pivot actuel est PLUS HAUT que le pivot précédent.
 *    → permet de ne trader que les structures haussières (higher highs).
 *
 * @returns {string[]} Tableau de signaux : "buy" | "sell" | "hold"
 */

export function pivotBreakoutSignals(
  {closes, highs, opens},
  {
    lenHigh = 5,
    pivotLife = 30,
    allowExitSignal = true,
    trendMA = 200, 
    requireHigherHigh = false,
    priceSource = "close",
    requireGap = false
  } = {}
) {
  const signals = Array(closes.length).fill("hold");

  // --- MA pour filtre de tendance ---
  const maTrend = SMA(closes, trendMA);

  let pivotY = null;      // valeur du pivot
  let lastPivotY = null // Dernier pivot cassé (validé)
  let pivotIndex = null;  // index du pivot
  let pivotActive = false;
  
  // choix de la détection du pivot (close ou high)
  const serie = priceSource === "high" ? highs : closes

  // --- Détection pivot haut (équivalent ta.pivothigh) ---
  function isPivotHigh(i) {
    if (i < lenHigh || i > serie.length - lenHigh - 1) return false;

    const center = serie[i];

    for (let k = 1; k <= lenHigh; k++) {
      if (serie[i - k] >= center) return false;
      if (serie[i + k] >= center) return false;
    }
    return true;
  }

  for (let i = 0; i < closes.length; i++) {
    const price = closes[i];

    // 1) Nouveau pivot confirmé
    if (isPivotHigh(i)) {
      pivotY = serie[i];
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

      // --- Condition Higher High ----
      const higherHighOK = !requireHigherHigh || lastPivotY === null || pivotY > lastPivotY

      // --- Condition d'ouverture en gap ---
      const gapOk = !requireGap || (i>0 && opens[i]>closes[i-1])

      // 3) Cassure haussière → BUY si tendance OK
      if (price > pivotY && trendOK && higherHighOK && gapOk) {
        signals[i] = "buy";
        lastPivotY = pivotY
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