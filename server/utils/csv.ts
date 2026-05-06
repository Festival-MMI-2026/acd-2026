// Parseur CSV minimal mais correct : gère les cellules entre quotes, les
// quotes échappées (""), les sauts de ligne à l'intérieur d'une cellule, et
// accepte ; ou , comme délimiteur (auto-détecté ligne par ligne).
//
// Retourne un tableau de lignes, chaque ligne étant un tableau de cellules
// (chaînes brutes, non-trimmées dans les cellules quotées).
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let delimiter: "," | ";" | null = null;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    // Détermine le délimiteur sur la première occurrence rencontrée
    if (delimiter === null && (c === ";" || c === ",")) {
      delimiter = c as ";" | ",";
    }

    if (delimiter !== null && c === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (c === "\r") {
      // skip — \n vient juste après dans \r\n
      continue;
    }

    if (c === "\n") {
      row.push(cell);
      // ignore les lignes complètement vides
      if (row.length > 1 || (row.length === 1 && row[0]!.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += c;
  }

  // dernière cellule / ligne
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.length > 1 || (row.length === 1 && row[0]!.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}
