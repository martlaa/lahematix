// Tunnivaatlusprotokoll (Lisa 6c). Hindamistunnused (6 domeeni, 11 tunnust,
// Teaching for Robust Understanding / TRU raamistikul põhinevad — vt
// LAHEMATE_Lisa6c_Tunnivaatlusprotokoll.docx) on hardcoded siia, samamoodi
// nagu küsimustikud/testid/päevik — DB salvestab ainult vastuseid
// (ObservationProtocol.ratingsJson).
//
// NB! Varasem versioon põhines CLASS/Danielson raamistikul, mille kasutamiseks
// projektil litsentsi ei ole — asendatud 2026-07-21 TRU raamistikuga (avalik,
// UC Berkeley/MARS projekti töö), mida projektil on lubatud kasutada.
//
// NB! 2026-07-22: vaatlejate tagasiside põhjal jagati protokoll kaheks —
// (1) ajatempliga intsidentide/sündmuste logi TUNNIOSA kohta (vabas vormis
// kirjeldus + konstrukti valik menüüst, mitte hinnang), ja (2) struktureeritud
// TRU 1-4 hinnang TUNNILE TERVIKUNA, täidetav üks kord tunni lõpul — varem
// tuli 11 tunnust hinnata iga tunniosa kohta eraldi, mis osutus vaatlejale
// liiga koormavaks.

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

// Seotud konstruktid — LAHEMATE teoreetilise raamistiku fikseeritud sõnavara
// (vt Lisa 6c juhend "vali menüüst"), vaatleja valib intsidendi kohta ühe või
// mitu, mitte ei sisesta ise vabas vormis.
export const CONSTRUCT_OPTIONS = [
  'Agentsus',
  'Kognitiivne kaasatus',
  'Dweck: juurdekasvu-uskumus',
  'Dweck: jäävuskumus',
  'Matemaatiline mõtlemine',
  'Toestamine',
  'Tagasiside',
  'Motivatsioon',
  'Matemaatikaärevus',
  'Ülesande esitamine',
  'Polya: ülesande mõistmine',
  'Polya: lahenduse kavandamine',
  'Polya: lahendamine',
  'Polya: lahenduse hindamine',
  'Muu',
];

// Iga tunniosa intsidentide logis kuvatavate tühjade ridade arv (vaatleja
// täidab nii mitu, kui vaja, ülejäänud tühjad read jäetakse salvestamisel
// kõrvale — vt api/vaatlused/protokoll/route.ts).
export const INCIDENT_ROWS_PER_PART = 6;

export interface ItemRating {
  value: number | null; // 1-4
  note: string;
}

// ÜKS struktureeritud TRU hinnang tunnile TERVIKUNA (mitte enam tunniosade
// kaupa) — täidetakse üks kord tunni lõpus.
export type ObservationRatings = Record<string, ItemRating>; // itemKey -> rating

export interface IncidentLogRow {
  lessonPlanPartId: string;
  timeMin: string;
  description: string;
  constructs: string[]; // CONSTRUCT_OPTIONS väärtused, valitud menüüst
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
