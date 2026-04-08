import { buildWeeklyFromDaily, mapWeeklyToDaily } from "../utils/weeklyDataFromDailyData.js";

export function normalizeData(rawData) {
  return rawData.map(stock => {
    // --- Extraction daily ---
    const dates = stock.closePrice.map(p => p.date);
    const closes = stock.closePrice.map(p => Number(p.close));
    const opens  = stock.openPrice.map(p => Number(p.open));
    const highs  = stock.highPrice.map(p => Number(p.high));
    const lows   = stock.lowPrice.map(p => Number(p.low));

    // --- Construction des bougies daily complètes ---
    const dailyBars = dates.map((date, i) => ({
      date,
      open: opens[i],
      high: highs[i],
      low: lows[i],
      close: closes[i]
    }));

    // --- Weekly OHLC ---
    const weeklyBars = buildWeeklyFromDaily(dailyBars);

    // --- Mapping daily → weekly ---
    const weeklyMap = mapWeeklyToDaily(dailyBars, weeklyBars);

    return {
      name: stock.name.trim(),
      ticker: stock.ticker,

      // Daily
      dates,
      closes,
      opens,
      highs,
      lows,
      dailyBars,

      // Weekly
      weeklyBars,
      weeklyMap
    };
  });
}