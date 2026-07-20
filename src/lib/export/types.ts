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

// Need andmestikud sisaldavad õpilaste/õpetajate hoiaku- ja õpitulemuste
// andmeid (eetikataotlus p 4.1) — teadur ei saa neid otse alla laadida,
// vaid peab iga kord taotlema admini kinnituse (vt ExportRequest).
export const GATED_DATASET_KEYS = ['kysimustikud', 'testitulemused', 'paevik'] as const;

export function isGatedDataset(key: string): boolean {
  return (GATED_DATASET_KEYS as readonly string[]).includes(key);
}
