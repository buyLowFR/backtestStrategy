export function normalizeData(rawData) {
  return rawData.map(stock => {
    const dates = stock.closePrice.map(p => p.date);
    const closes = stock.closePrice.map(p => Number(p.close));
    const opens = stock.openPrice.map(p => Number(p.open));
    const highs = stock.highPrice.map(p => Number(p.high));
    const lows = stock.lowPrice.map(p => Number(p.low));

    return {
      name: stock.name.trim(),
      ticker: stock.ticker,
      dates,
      closes,
      opens,
      highs,
      lows
    };
  });
}