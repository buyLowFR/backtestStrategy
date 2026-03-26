import { runBatch } from "./src/optimizer/batchRunner.js";
import { loadMultipleJSON } from "./src/data/loadData.js";

async function main() {
    // Liste de tes fichiers
  const files = [
    //"./src/data/historicSBF120Data.json"
    "./src/data/SP500(1-50).json",
    "./src/data/SP500(51-100).json",
    "./src/data/SP500(101-150).json",
    "./src/data/SP500(151-200).json",
    "./src/data/SP500(201-250).json",
    "./src/data/SP500(251-300).json",
    "./src/data/SP500(301-350).json",
    "./src/data/SP500(351-400).json",
    "./src/data/SP500(401-450).json",
    "./src/data/SP500(451-500).json",
  ];


  const stocks = loadMultipleJSON(files);

  const results = runBatch(stocks, {
    strategy: "pivotBreakout", //"smaCross",
    vary: {
      //lookback: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19, 20,25, 30,35,40,45, 50],
      //tradeProbability: [0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.2]
      //takeProfitPct: [0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5]
      slowMA: [100,125,150,175, 200],
      fastMA: [5,10,,15,20,25,30],
      mediumMA: [40,45,50,55,60,65,70,75,80]
      //pivotLife: [10,15,20,25,30,35,40],
      //lenHigh:[3,4,5,6,7,8,9,10,11],
      //requireHigherHigh: [true, false]
    },
    baseOptions: {
      strategy : "pivotBreakout",//"smaCross",
      fastMA: 20,
      mediumMA: 50,
      slowMA: 200,
      lookback: 5,
      pivotLife: 15,
      lenHigh: 3,
      allowExitSignal: false,
      initialCapital: 10000,
      positionPct: 0.1,
      stopLossPct: 0.05,
      takeProfitPct: 0.05,
      requireHigherHigh : false,
      tradeProbability : 1
    },
    output: "./result/batch_breakout.csv"
  });

  console.table(results.slice(0, 100));
}

main();