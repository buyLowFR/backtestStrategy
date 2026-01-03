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

/**
 * Exporte une courbe d'equity dans un fichier CSV.
 *
 * @param {number[]} equityCurve - Liste des valeurs d'equity
 * @param {string} filepath - Chemin du fichier CSV à créer
 */
export function exportEquityCurveToCSV(equityCurve, filepath) {
  const header = "index,equity\n";

  const rows = equityCurve
    .map((value, i) => `${i},${value}`)
    .join("\n");

  fs.writeFileSync(filepath, header + rows, "utf8");
}