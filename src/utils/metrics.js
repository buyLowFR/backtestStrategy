export function maxDrawdown(equity) {
  let peak = equity[0];
  let maxDD = 0;

  for (const value of equity) {
    if (value > peak) peak = value;
    const dd = (peak - value) / peak;
    if (dd > maxDD) maxDD = dd;
  }

  return maxDD * 100; // en %
}

export function tradeMetrics(trades) {
  if (trades.length === 0) {
    return {
      winrate: 0,
      profitFactor: 0,
      avgRR: 0
    };
  }

  const wins = trades.filter(t => t.pnlAbs > 0);
  const losses = trades.filter(t => t.pnlAbs < 0);

  const winrate = (wins.length / trades.length) * 100;

  const totalWin = wins.reduce((acc, t) => acc + t.pnlAbs, 0);
  const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnlAbs, 0));

  const profitFactor = totalLoss === 0 ? Infinity : totalWin / totalLoss;

  const avgWin = wins.length ? totalWin / wins.length : 0;
  const avgLoss = losses.length ? totalLoss / losses.length : 0;

  const avgRR = avgLoss === 0 ? Infinity : avgWin / avgLoss;

  return {
    winrate,
    profitFactor,
    avgRR
  };
}

export function globalMetrics(allTrades) {
  if (allTrades.length === 0) {
    return {
      totalTrades: 0,
      winrate: 0,
      profitFactor: 0,
      avgRiskReward: 0,
      totalProfit: 0
    };
  }

  const wins = allTrades.filter(t => t.pnlAbs > 0);
  const losses = allTrades.filter(t => t.pnlAbs < 0);

  const totalProfit = allTrades.reduce((acc, t) => acc + t.pnlAbs, 0);

  const winrate = (wins.length / allTrades.length) * 100;

  const totalWin = wins.reduce((acc, t) => acc + t.pnlAbs, 0);
  const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnlAbs, 0));

  const profitFactor = totalLoss === 0 ? Infinity : totalWin / totalLoss;

  const avgWin = wins.length ? totalWin / wins.length : 0;
  const avgLoss = losses.length ? totalLoss / losses.length : 0;

  const avgRR = avgLoss === 0 ? Infinity : avgWin / avgLoss;

  return {
    totalTrades: allTrades.length,
    winrate,
    profitFactor,
    avgRiskReward: avgRR,
    totalProfit
  };
}

/**
 * Calcule la durée moyenne des trades en jours.
 *
 * Pourquoi cette fonction existe ?
 * --------------------------------
 * Elle permet de comprendre le "rythme" réel de la stratégie :
 * - une stratégie avec des trades très courts = plus de frais, plus de bruit
 * - une stratégie avec des trades longs = plus tendance, moins de rotation
 *
 * Comment ça marche ?
 * -------------------
 * On parcourt tous les trades, on calcule la différence entre la date d'entrée
 * et la date de sortie, on convertit en jours, puis on fait la moyenne.
 *
 * Hypothèses :
 * ------------
 * - entryDate et exitDate sont des chaînes compatibles avec new Date()
 * - chaque trade a bien une entrée et une sortie (pas de trade "ouvert")
 *
 * @param {Array} allTrades - Liste de tous les trades du portefeuille
 * @returns {number} Durée moyenne en jours
 */
function calculateAverageTradeDuration(allTrades) {
  // Si aucun trade, on retourne 0 pour éviter une division par zéro
  if (allTrades.length === 0) return 0;

  let totalDays = 0;

  for (const t of allTrades) {
    // Conversion des dates en objets Date
    const entry = new Date(t.entryDate);
    const exit = new Date(t.exitDate);

    // Différence en millisecondes
    const diffMs = exit - entry;

    // Conversion en jours (1000 ms * 60 sec * 60 min * 24 h)
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Accumulation
    totalDays += diffDays;
  }

  // Moyenne des durées
  return totalDays / allTrades.length;
}

export function globalPortfolioMetrics(allTrades, equityCurve, initialCapital) {
  const gm = globalMetrics(allTrades);
  const mdd = maxDrawdown(equityCurve);
  const sharpe = sharpeFromEquityCurve(equityCurve);
  const averageTradeDuration = calculateAverageTradeDuration(allTrades)

  return {
    ...gm,
    finalCapital: equityCurve[equityCurve.length - 1],
    roi: (equityCurve[equityCurve.length - 1] / initialCapital - 1) * 100,
    maxDrawdown: mdd,
    sharpe,
    averageTradeDuration
  };
}

export function sharpeFromEquityCurve(equityCurve) {
  if (!equityCurve || equityCurve.length < 2) return 0;

  // 1) Calcul des rendements journaliers
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const r = (equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1];
    returns.push(r);
  }

  if (returns.length === 0) return 0;

  // 2) Moyenne des rendements
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;

  // 3) Volatilité (écart-type)
  const variance =
    returns.reduce((acc, r) => acc + Math.pow(r - avg, 2), 0) /
    returns.length;

  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;

  // 4) Sharpe annualisé
  return (avg / stdDev) * Math.sqrt(252);
}