export function SMA(values, period) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + Number(b), 0) / period;
    result.push(avg);
  }
  return result;
}