// Tunnivaatlusprotokoll (Lisa 6). Hindamistunnused (6 domeeni, 11 tunnust,
// Teaching for Robust Understanding / TRU raamistikul põhinevad — vt
// LAHEMATE_Lisa6_Tunnivaatlusprotokoll.docx) on hardcoded siia, samamoodi
// nagu küsimustikud/testid/päevik — DB salvestab ainult vastuseid
// (ObservationProtocol.ratingsJson). Checkpointide arv ja pealkirjad tulevad
// dünaamiliselt tunnikava (LessonPlan) osadest, mitte siitsamast failist.
//
// NB! Varasem versioon põhines CLASS/Danielson raamistikul, mille kasutamiseks
// projektil litsentsi ei ole — asendatud 2026-07-21 TRU raamistikuga (avalik,
// UC Berkeley/MARS projekti töö), mida projektil on lubatud kasutada.

export type ObservationDomainKey = 'M' | 'K' | 'V' | 'O' | 'T' | 'MT';

export interface ObservationItem {
  key: string; // nt "M1"
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
    key: 'M',
    label: 'Matemaatiline sisukus',
    frameworkNote: 'TRU: Mathematics',
    items: [
      { key: 'M1', label: 'Tunni matemaatiline sisu on hästiseostatud, mitte üksikute faktide/protseduuride kogum' },
      { key: 'M2', label: 'Ülesanded võimaldavad mitut lahenduskäiku ja seoseid erinevate matemaatika valdkondade vahel' },
    ],
  },
  {
    key: 'K',
    label: 'Kognitiivne nõudlikkus',
    frameworkNote: 'TRU: Cognitive Demand',
    items: [
      { key: 'K1', label: 'Õpilastele antakse aega ja võimalusi produktiivseks takerdumiseks enne abi pakkumist' },
      { key: 'K2', label: 'Õpilased tegelevad probleemilahendusega süvitsi, mitte ei kiirusta kohe valmislahenduseni' },
    ],
  },
  {
    key: 'V',
    label: 'Võrdne juurdepääs matemaatikale',
    frameworkNote: 'TRU: Equitable Access',
    items: [
      { key: 'V1', label: 'Kõigil õpilastel, mitte ainult aktiivsematel/kiirematel, on võimalus matemaatilises mõtlemises osaleda' },
      { key: 'V2', label: 'Õpetaja kaasab teadlikult ka vaiksemaid/tagasihoidlikumaid õpilasi' },
    ],
  },
  {
    key: 'O',
    label: 'Õpilase agentsus, omanikutunne ja identiteet',
    frameworkNote: 'TRU: Agency, Ownership, Identity',
    items: [
      { key: 'O1', label: 'Õpilased selgitavad ja põhjendavad oma mõtlemist oma sõnadega, mitte ei korda õpetaja sõnu või õpikuteksti' },
      { key: 'O2', label: 'Õpilased tunduvad matemaatikas pädevad ja aktiivsed, mitte ärevad/ebakindlad' },
    ],
  },
  {
    key: 'T',
    label: 'Kujundav (õppimist toetav) tagasiside',
    frameworkNote: 'TRU: Formative Assessment',
    items: [
      { key: 'T1', label: 'Õpetaja jälgib jooksvalt õpilaste mõtlemist (mitte ainult lõpptulemust) ja kohandab tagasisidet vastavalt' },
      { key: 'T2', label: 'Tagasiside on konkreetne ja mõtlema suunav, mitte ainult "õige/vale"' },
    ],
  },
  {
    key: 'MT',
    label: 'Meetodi truudus',
    frameworkNote: 'LAHEMATE oma tunnus (mitte TRU)',
    items: [
      { key: 'MT1', label: 'Tund järgib valitud meetodi (Boaler / Liljedahl / Toh) põhimõtteid ja soovitusi vastavalt tunnikavale' },
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
