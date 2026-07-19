// Tunnivaatlusprotokoll (Lisa 6). Hindamistunnused (A–D domeenid, 12 tunnust)
// on hardcoded siia, samamoodi nagu küsimustikud/testid/päevik — DB salvestab
// ainult vastuseid (ObservationProtocol.ratingsJson). Checkpointide arv ja
// pealkirjad tulevad dünaamiliselt tunnikava (LessonPlan) osadest, mitte
// siitsamast failist.

export type ObservationDomainKey = 'A' | 'B' | 'C' | 'D';

export interface ObservationItem {
  key: string; // nt "A1"
  label: string;
}

export interface ObservationDomain {
  key: ObservationDomainKey;
  label: string;
  frameworkNote: string;
  items: ObservationItem[];
}

export const OBSERVATION_DOMAINS: ObservationDomain[] = [
  {
    key: 'A',
    label: 'Emotsionaalne tugi ja õhkkond',
    frameworkNote: 'CLASS: Emotional Support; Danielson 2a',
    items: [
      { key: 'A1', label: 'Soe, positiivne suhtlus (õpetaja–õpilane, õpilased omavahel)' },
      { key: 'A2', label: 'Õpetaja märkab ja reageerib õpilaste raskustele/tunnetele' },
      { key: 'A3', label: 'Matemaatikaärevuse märke ei ole näha (kõhklus, vältimine, alahindamine)' },
    ],
  },
  {
    key: 'B',
    label: 'Klassi juhtimine ja struktuur',
    frameworkNote: 'CLASS: Classroom Organization; Danielson 2c, 3c',
    items: [
      { key: 'B1', label: 'Selged juhised, sujuvad üleminekud, vähe kadunud aega' },
      { key: 'B2', label: 'Õpilased hõivatud ülesandega; häirimist juhitakse tõhusalt' },
      { key: 'B3', label: 'Tund järgib meetodi (Boaler/Liljedahl/Toh) põhivõtteid tunnikava kohaselt' },
    ],
  },
  {
    key: 'C',
    label: 'Õpetuslik tugi ja mõtlemise arendamine',
    frameworkNote: 'CLASS: Instructional Support; Danielson 3b, 3d',
    items: [
      { key: 'C1', label: 'Avatud küsimused, mis nõuavad põhjendamist, mitte meenutamist' },
      { key: 'C2', label: 'Tagasiside konkreetne ja arengule suunatud (mitte ainult "õige/vale")' },
      { key: 'C3', label: 'Õpilaste mõtlemine nähtav; takerdumist toetatakse enne sekkumist' },
    ],
  },
  {
    key: 'D',
    label: 'Õpilaste kaasatus',
    frameworkNote: 'CLASS: Student Engagement',
    items: [
      { key: 'D1', label: 'Enamik õpilasi aktiivselt hõivatud (käitumuslik kaasatus)' },
      { key: 'D2', label: 'Õpilased süvenevad sisusse, mitte pealiskaudsed (kognitiivne kaasatus)' },
      { key: 'D3', label: 'Näha huvi/motivatsiooni ja koostööd matemaatika teemal' },
    ],
  },
];

export const RATING_SCALE_LABELS: Record<number, string> = {
  1: 'ei ole märgata / madal',
  2: 'pigem mitte / kesk-madal',
  3: 'pigem jah / kesk-kõrge',
  4: 'selgelt näha / kõrge',
};

export const INCIDENT_CONSTRUCT_OPTIONS = [
  'TAGASISIDE',
  'ÄREVUS',
  'MOTIVATSIOON',
  'MÕTLEMINE',
  'KOOSTÖÖ',
  'KÄITUMINE',
  'MUU',
];

export interface ItemRating {
  value: number | null; // 1-4
  note: string;
}

export type CheckpointRatings = Record<string, ItemRating>; // itemKey -> rating

export interface ObservationRatings {
  [lessonPlanPartId: string]: CheckpointRatings;
}

export interface IncidentLogRow {
  timeMin: string;
  description: string;
  construct: string;
  whoWith: string;
}

export interface ObservationSummary {
  shortSummary: string;
  methodFidelity: string;
  surprises: string;
  recommendations: string;
}

export function allItemKeys(): string[] {
  return OBSERVATION_DOMAINS.flatMap((d) => d.items.map((i) => i.key));
}
