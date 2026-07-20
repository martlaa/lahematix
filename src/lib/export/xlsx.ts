import ExcelJS from 'exceljs';
import type { Dataset } from './types';

export async function toXlsxBuffer(dataset: Dataset, sheetName: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31)); // Exceli lehe nime piirang on 31 märki

  sheet.addRow(dataset.headers);
  sheet.getRow(1).font = { bold: true };
  for (const row of dataset.rows) {
    sheet.addRow(row.map((cell) => (cell === undefined ? null : cell)));
  }

  sheet.columns.forEach((col) => {
    col.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
