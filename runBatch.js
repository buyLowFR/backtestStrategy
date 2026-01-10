import { runBatch } from "./src/optimizer/batchRunner.js";
import { loadMultipleJSON } from "./src/data/loadData.js";

async function main() {
    // Liste de tes fichiers
  const files = [
    "./src/data/SP500(1-100).json",
    "./src/data/SP500(101-200).json",
    "./src/data/SP500(201-300).json",
    "./src/data/SP500(301-400).json",
    "./src/data/SP500(401-500).json"
  ];


  const stocks = loadMultipleJSON(files);

  const results = runBatch(stocks, {
    strategy: "breakout",
    vary: {
      lookback: [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19, 20,25, 30,35,40,45, 50],
      slowMA: [100,150, 200],
    },
    baseOptions: {
      strategy : "breakout",
      fastMA: 20,
      mediumMA: 50,
      slowMA: 200,
      lookback: 5,
      allowExitSignal: false,
      initialCapital: 10000,
      positionPct: 0.1,
      stopLossPct: 0.05,
      takeProfitPct: 0.25
    },
    output: "./result/batch_breakout.csv"
  });

  console.table(results.slice(0, 100));
}

main();