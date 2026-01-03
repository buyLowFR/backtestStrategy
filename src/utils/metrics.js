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