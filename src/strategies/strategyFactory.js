import { tripleMASignals } from "./smaCross.js";
import { highBreakoutSignals } from "./highBreakout.js";
import { pivotBreakoutSignals } from "./pivotBreakout.js";

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

    case "pivotBreakout":
      return pivotBreakoutSignals(
        stock.closes,
        { 
          pivotLife: options.pivotLife,
          lenHigh: options.lenHigh,
          allowExitSignal: options.allowExitSignal,
          trendMA: options.slowMA
        }
      );

    default:
      throw new Error(`Stratégie inconnue : ${strategyName}`);
  }
}