import { tripleMASignals } from "./smaCross.js";
import { highBreakoutSignals } from "./highBreakout.js";

export function getStrategySignals(strategyName, stock, options) {
  switch (strategyName) {
    case "smaCross":
      return tripleMASignals(
        stock.closes,
        options.fastMA,
        options.mediumMA,
        options.slowMA,
        { allowExitSignal: options.allowExitSignal }
      );

    case "breakout":
      return highBreakoutSignals(
        stock.closes,
        options.lookback,
        { 
            allowExitSignal: options.allowExitSignal,
            trendMA: options.slowMA
         }
      );

    default:
      throw new Error(`Stratégie inconnue : ${strategyName}`);
  }
}