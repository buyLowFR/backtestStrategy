import { tripleMASignals } from "./smaCross.js";
import { highBreakoutSignals } from "./highBreakout.js";
import { pivotBreakoutSignals } from "./pivotBreakout.js";
import { ribbonBreakoutSignals } from "./ribbonBreakout.js";
import {pivotBreakoutWeeklyFilter} from "./pivotBreakoutWeeklyFilter.js"

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
        {
          closes :stock.closes,
          highs : stock.highs,
          opens : stock.opens
        },
        { 
          pivotLife: options.pivotLife,
          lenHigh: options.lenHigh,
          allowExitSignal: options.allowExitSignal,
          trendMA: options.slowMA,
          requireHigherHigh: options.requireHigherHigh,
          priceSource : options.priceSource,
          requireGap : options.requireGap
        }
      );
    
    case "ribbonBreakout" :
      return ribbonBreakoutSignals(stock,{
        fastPeriodHigh: options.fastPeriodHigh,
        fastPeriodLow : options.fastPeriodLow,
        slowMA : options.slowMA,
        allowExitSignal: options.allowExitSignal,
      })
    
    case "pivotBreakoutWeekly":
      return pivotBreakoutWeeklyFilter(
        {
          closes: stock.closes,
          highs: stock.highs,
          opens: stock.opens
        },
        stock.weeklyBars,   // ← tu dois les ajouter dans ton loader
        stock.weeklyMap,    // ← idem
        {
          pivotLife: options.pivotLife,
          lenHigh: options.lenHigh,
          allowExitSignal: options.allowExitSignal,
          trendMA: options.slowMA,
          requireHigherHigh: options.requireHigherHigh,
          priceSource: options.priceSource,
          requireGap: options.requireGap
        }
      );

    default:
      throw new Error(`Stratégie inconnue : ${strategyName}`);
  }
}