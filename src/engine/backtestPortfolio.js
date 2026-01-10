import { getStrategySignals } from "../strategies/strategyFactory.js";

export function backtestPortfolio(
  stocks,
  {
    strategy = "breakout",
    fastMA = 20,
    mediumMA = 50,
    slowMA = 200,
    lookback = 5,
    allowExitSignal = false,
    initialCapital = 10000,
    positionPct = 0.1,
    stopLossPct = 0.05,
    takeProfitPct = 0.25
  } = {}
) {
  let capital = initialCapital;
  const positions = {}; // { ticker: { qty, entryPrice, entryIndex, stopLoss, takeProfit } }
  const allTrades = [];
  const equityCurve = [];

  // Pré-calcul des signaux pour chaque action
  const signalsByStock = stocks.map(stock => ({
    stock,
    signals: getStrategySignals(strategy, stock, {
      fastMA,
      mediumMA,
      slowMA,
      lookback,
      allowExitSignal
    })
  }));

  const nbDays = stocks[0].closes.length;

  for (let i = 0; i < nbDays; i++) {

    // === 1) Gestion des SL/TP ===
    for (const { stock } of signalsByStock) {
      const pos = positions[stock.ticker];
      if (!pos) continue;

      const price = stock.closes[i];
      // Si le prix est invalide, on ignore cette action pour ce jour
      if (price === undefined || price === null || isNaN(price) || price <= 0) {
        continue;
      }



      if (price <= pos.stopLoss || price >= pos.takeProfit) {
        const exitValue = pos.qty * price;
        capital += exitValue;

        allTrades.push({
          symbol: stock.ticker,
          entryPrice: pos.entryPrice,
          exitPrice: price,
          qty: pos.qty,
          pnlAbs: exitValue - pos.qty * pos.entryPrice,
          exitReason: price <= pos.stopLoss ? "stop_loss" : "take_profit",
          entryDate: stock.dates[pos.entryIndex],
          exitDate: stock.dates[i]
        });

        delete positions[stock.ticker];
      }
    }

    // === 2) Gestion des signaux BUY/SELL ===
    for (const { stock, signals } of signalsByStock) {
      const signal = signals[i];
      const price = stock.closes[i];
      const hasPosition = !!positions[stock.ticker];

      // SELL
      if (signal === "sell" && hasPosition) {
        const pos = positions[stock.ticker];
        const exitValue = pos.qty * price;
        capital += exitValue;

        allTrades.push({
          symbol: stock.ticker,
          entryPrice: pos.entryPrice,
          exitPrice: price,
          qty: pos.qty,
          pnlAbs: exitValue - pos.qty * pos.entryPrice,
          exitReason: "signal",
          entryDate: stock.dates[pos.entryIndex],
          exitDate: stock.dates[i]
        });

        delete positions[stock.ticker];
      }

      // BUY
      if (signal === "buy" && !hasPosition) {
        // Montant fixe basé sur le capital initial (et non le capital restant)
        const amountToInvest = initialCapital * positionPct;

        // Si le capital restant est insuffisant, on n'investit pas
        if (capital < amountToInvest) continue;

        // Si le capital est à 0, on n'investit pas
        if (capital <= 0) continue;

        // Achat
        const qty = amountToInvest / price;
        capital -= amountToInvest;

        positions[stock.ticker] = {
            qty,
            entryPrice: price,
            entryIndex: i,
            stopLoss: price * (1 - stopLossPct),
            takeProfit: price * (1 + takeProfitPct)
        };
      }
    }

    // === 3) Equity globale ===
    let equity = capital;
    for (const { stock } of signalsByStock) {
      const pos = positions[stock.ticker];
      if (pos) {
        equity += pos.qty * stock.closes[i];
      }
    }
    equityCurve.push(equity);
  }

  // === 4) Liquidation finale ===
  for (const { stock } of signalsByStock) {
    const pos = positions[stock.ticker];
    if (!pos) continue;

    const lastPrice = stock.closes[nbDays - 1];
    const exitValue = pos.qty * lastPrice;
    if (!lastPrice || lastPrice <= 0) continue;

    capital += exitValue;

    allTrades.push({
      symbol: stock.ticker,
      entryPrice: pos.entryPrice,
      exitPrice: lastPrice,
      qty: pos.qty,
      pnlAbs: exitValue - pos.qty * pos.entryPrice,
      exitReason: "end_of_data",
      entryDate: stock.dates[pos.entryIndex],
      exitDate: stock.dates[nbDays - 1]
    });
  }

  return {
    initialCapital,
    finalCapital: capital,
    equityCurve,
    allTrades
  };
}