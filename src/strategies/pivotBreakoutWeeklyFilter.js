import { SMA } from "../utils/indicators.js";
import { pivotBreakoutSignals } from "./pivotBreakout.js";

/**
 * Stratégie Pivot Breakout + Filtre Weekly MA20 High
 *
 * LOGIQUE :
 * ---------
 * 1. On calcule la moyenne mobile 20 semaines sur les "highs" weekly.
 * 2. Pour chaque bougie daily, on récupère la bougie weekly correspondante
 *    via weeklyMap[i].
 * 3. On autorise les BUY uniquement si :
 *        weeklyClose > weeklyMA20High
 * 4. On applique ensuite la stratégie pivotBreakout pour générer les signaux.
 * 5. Si le filtre weekly n'est pas validé :
 *        - on bloque les BUY
 *        - on laisse passer les SELL (pour sortir proprement)
 *
 * PARAMÈTRES :
 * ------------
 * - weeklyBars : tableau de bougies weekly (open/high/low/close)
 * - weeklyMap  : tableau de correspondance daily → weekly
 * - stock      : données daily (closes, highs, opens)
 * - options    : paramètres de pivotBreakout
 *
 * RETOUR :
 * --------
 * - Tableau de signaux daily : "buy" | "sell" | "hold"
 */
export function pivotBreakoutWeeklyFilter(
  { closes, highs, opens },
  weeklyBars,
  weeklyMap,
  options
) {
  const signals = Array(closes.length).fill("hold");

  // --- 1) Calcul MA20 weekly sur les highs ---
  const weeklyHighs = weeklyBars.map(w => w.high);
  const weeklyMA20High = SMA(weeklyHighs, 20);

  // --- 2) Signaux daily de pivotBreakout ---
  const pivotSignals = pivotBreakoutSignals(
    { closes, highs, opens },
    options
  );

  // --- 3) Application du filtre weekly ---
  for (let i = 0; i < closes.length; i++) {
    const w = weeklyMap[i]; // index weekly correspondant à la bougie daily i

    // Si pas assez d'historique weekly → pas de trade
    if (w === undefined || weeklyMA20High[w] === null) {
      signals[i] = "hold";
      continue;
    }

    const weeklyClose = weeklyBars[w].close;
    const weeklyTrendOK = weeklyClose > weeklyMA20High[w];

    // --- BUY filtré ---
    if (pivotSignals[i] === "buy" && weeklyTrendOK) {
      signals[i] = "buy";
      continue;
    }

    // --- SELL toujours autorisé ---
    if (pivotSignals[i] === "sell") {
      signals[i] = "sell";
      continue;
    }

    // Sinon HOLD
    signals[i] = "hold";
  }

  return signals;
}