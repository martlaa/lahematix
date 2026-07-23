import type { LessonPartType } from '@prisma/client';

export const MIN_PARTS = 2;
export const MAX_PARTS = 10;

export const LESSON_PART_TYPE_OPTIONS: { value: LessonPartType; label: string }[] = [
  { value: 'OPETAJA_ESITLUS', label: 'Õpetaja esitlus' },
  { value: 'INDIVIDUAALNE_HARJUTAMINE', label: 'Individuaalne harjutamine' },
  { value: 'INDIVIDUAALNE_PROBLEEMILAHENDUS', label: 'Individuaalne probleemilahendus' },
  { value: 'PROBLEEMILAHENDUS_RUHMATOONA', label: 'Probleemilahendus rühmatööna' },
  { value: 'UHINE_ARUTELU', label: 'Ühine arutelu' },
  { value: 'REFLEKSIOON', label: 'Refleksioon' },
];

export const LESSON_PART_TYPE_LABEL: Record<LessonPartType, string> = Object.fromEntries(
  LESSON_PART_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<LessonPartType, string>;

export const MATERIAL_OPTIONS: { key: string; label: string; hasLink: boolean }[] = [
  { key: 'slaidid', label: 'Slaidid', hasLink: true },
  { key: 'toolehed', label: 'Töölehed', hasLink: true },
  { key: 'ulesanded', label: 'Ülesanded/probleemid', hasLink: true },
  { key: 'opik', label: 'Õpik (lk-d)', hasLink: true },
  { key: 'kahoot', label: 'Kahoot / muu digivahend', hasLink: true },
  { key: 'muu', label: 'Muu', hasLink: true },
];

// key present = linnuke märgitud; väärtus = selle materjalitüübi lisatud
// kirjete (linkide/failide/tekstide) loend, kuna igat tüüpi võib olla mitu
// (nt mitu esitlust või mitu ülesannet).
export type MaterialsAnswers = Record<string, string[]>;

// Iga materjalitüübi kohta kuvatava sisestusrea (lingi/teksti) maksimumarv —
// vaba rida jäetakse salvestamisel kõrvale, seega tühjaks tegemine + Salvesta
// eemaldabki selle kirje.
export const MATERIAL_ITEMS_PER_TYPE = 4;
