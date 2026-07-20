export type CellValue = string | number | boolean | null | undefined;

export interface Dataset {
  headers: string[];
  rows: CellValue[][];
}

export interface DatasetDefinition {
  key: string;
  label: string;
  description: string;
  build: () => Promise<Dataset>;
}
