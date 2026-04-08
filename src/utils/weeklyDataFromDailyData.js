/**
 * Construit des bougies weekly (hebdomadaires) à partir de bougies daily.
 *
 * Cette fonction regroupe les données journalières par semaine ISO
 * et génère pour chaque semaine une bougie OHLC complète :
 *
 *   - open  : premier open de la semaine
 *   - high  : plus haut atteint durant la semaine
 *   - low   : plus bas atteint durant la semaine
 *   - close : dernier close de la semaine
 *
 * Elle ajoute également un champ `startDate` permettant de synchroniser
 * correctement les bougies weekly avec les bougies daily.
 *
 * ------------------------------------------------------------
 * PARAMÈTRES
 * ------------------------------------------------------------
 * @param {Array<Object>} dailyBars
 *   Tableau de bougies daily triées par date croissante.
 *   Chaque élément doit contenir :
 *     {
 *       date: "YYYY-MM-DD",
 *       open: Number,
 *       high: Number,
 *       low: Number,
 *       close: Number
 *     }
 *
 * ------------------------------------------------------------
 * RETOUR
 * ------------------------------------------------------------
 * @returns {Array<Object>}
 *   Tableau de bougies weekly, chacune sous la forme :
 *     {
 *       week: "YYYY-WW",     // identifiant de la semaine ISO
 *       startDate: "YYYY-MM-DD", // date du premier jour de la semaine
 *       open: Number,
 *       high: Number,
 *       low: Number,
 *       close: Number
 *     }
 *
 * ------------------------------------------------------------
 * LOGIQUE DE CONSTRUCTION
 * ------------------------------------------------------------
 * - On calcule pour chaque bougie daily son numéro de semaine ISO.
 * - Lorsqu'une nouvelle semaine commence :
 *      → on pousse la bougie weekly précédente dans le tableau final
 *      → on initialise une nouvelle bougie weekly
 * - Pour chaque bougie daily appartenant à la même semaine :
 *      → high = max(high, daily.high)
 *      → low  = min(low, daily.low)
 *      → close = daily.close (dernier close de la semaine)
 */
export function buildWeeklyFromDaily(dailyBars) {
  const weekly = [];
  let current = null;

  for (const bar of dailyBars) {
    const date = new Date(bar.date);
    const week = date.getFullYear() + "-" + getWeekNumber(date);

    // Nouvelle semaine
    if (!current || current.week !== week) {
      if (current) weekly.push(current);

      current = {
        week,
        startDate: bar.date,   // ← nécessaire pour mapWeeklyToDaily
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close
      };
    } else {
      current.high = Math.max(current.high, bar.high);
      current.low = Math.min(current.low, bar.low);
      current.close = bar.close;
    }
  }

  if (current) weekly.push(current);
  return weekly;
}

/**
 * Calcule le numéro de semaine ISO.
 */
function getWeekNumber(d) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

/**
 * Crée un tableau de correspondance daily → weekly.
 *
 * weeklyMap[i] = index de la bougie weekly correspondant à daily[i]
 *
 * ------------------------------------------------------------
 * LOGIQUE :
 * ------------------------------------------------------------
 * - On avance dans les weekly tant que la date de début de la semaine
 *   suivante est <= à la date daily.
 * - Cela permet de savoir à quelle bougie weekly appartient chaque bougie daily.
 *
 * ------------------------------------------------------------
 * RETOUR :
 * ------------------------------------------------------------
 * @returns {Array<number>} mapping
 */
export function mapWeeklyToDaily(dailyBars, weeklyBars) {
  const mapping = [];
  let w = 0;

  for (let i = 0; i < dailyBars.length; i++) {
    const d = new Date(dailyBars[i].date);

    while (
      w < weeklyBars.length - 1 &&
      new Date(weeklyBars[w + 1].startDate) <= d
    ) {
      w++;
    }

    mapping[i] = w;
  }

  return mapping;
}