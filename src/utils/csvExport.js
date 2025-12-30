import fs from "fs";

export function exportTradesToCSV(trades, outputPath) {
  if (!trades || trades.length === 0) {
    console.warn("Aucun trade à exporter.");
    return;
  }

  const headers = [
    "symbol",
    "name",
    "entryIndex",
    "entryDate",
    "entryPrice",
    "exitIndex",
    "exitDate",
    "exitPrice",
    "exitReason",
    "positionPct",
    "qty",
    "pnlAbs",
    "pnlPct"
  ];

  const lines = [];

  // Ligne d'en-tête
  lines.push(headers.join(";"));

  // Lignes de données
  for (const t of trades) {
    const row = [
      t.symbol,
      t.name,
      t.entryIndex,
      t.entryDate ?? "",
      t.entryPrice,
      t.exitIndex,
      t.exitDate ?? "",
      t.exitPrice,
      t.exitReason,
      t.positionPct,
      t.qty,
      t.pnlAbs,
      t.pnlPct
    ];
    lines.push(row.join(";"));
  }

  const csvContent = lines.join("\n");

  fs.writeFileSync(outputPath, csvContent, "utf8");
  console.log(`Journal de trades exporté dans : ${outputPath}`);
}