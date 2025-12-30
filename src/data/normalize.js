export function normalizeData(rawData) {
  return rawData.map(stock => {
    const dates = stock.closePrice.map(p => p.date);
    const closes = stock.closePrice.map(p => Number(p.close));

    return {
      name: stock.name.trim(),
      ticker: stock.ticker,
      dates,
      closes
    };
  });
}