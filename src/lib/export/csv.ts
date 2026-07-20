import type { CellValue, Dataset } from './types';

// Eraldajaks semikoolon, mitte koma — Eesti (ja üldisemalt Euroopa) Exceli
// vaikeasetustes on koma kümnendkoha eraldaja, mistõttu koma-eraldatud CSV
// avaneb valesti (kõik ühes veerus). UTF-8 BOM tagab, et Excel tunneb ka
// täpitähed (õäöü) õigesti ära, mitte ei näita neid untitud kujul.
const DELIMITER = ';';
const BOM = '﻿';

function escapeCell(value: CellValue): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(DELIMITER) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(dataset: Dataset): string {
  const lines = [dataset.headers, ...dataset.rows].map((row) =>
    row.map(escapeCell).join(DELIMITER),
  );
  return BOM + lines.join('\r\n');
}
