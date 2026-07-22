// Ülesannete pank — jagatud õppematerjalide/ülesannete kogu (vt
// prisma/schema.prisma Task-mudeli kommentaar). Faili laadib kasutaja üles
// KAS lingina (GDocs/OneDrive) VÕI failina (docx/jpg/pdf, kuni 50 MB).

export const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_FILE_EXTENSIONS = ['.docx', '.jpg', '.jpeg', '.pdf'];

export const MIME_BY_EXT: Record<string, string> = {
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
};

export const GRADE_BAND_OPTIONS = [
  { value: '4-6', label: '4.–6. klass' },
  { value: '7-9', label: '7.–9. klass' },
  { value: '10-12', label: '10.–12. klass' },
] as const;

export const GRADE_BAND_LABEL: Record<string, string> = Object.fromEntries(
  GRADE_BAND_OPTIONS.map((o) => [o.value, o.label]),
);

export const METHOD_OPTIONS = [
  { value: 'BOALER', label: 'Boaler' },
  { value: 'LILJEDAHL', label: 'Liljedahl' },
  { value: 'TOH', label: 'Toh' },
] as const;

export const METHOD_LABEL: Record<string, string> = Object.fromEntries(
  METHOD_OPTIONS.map((o) => [o.value, o.label]),
);

export function fileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx === -1 ? '' : fileName.slice(idx).toLowerCase();
}

export function isAllowedFileExtension(fileName: string): boolean {
  return ALLOWED_FILE_EXTENSIONS.includes(fileExtension(fileName));
}
