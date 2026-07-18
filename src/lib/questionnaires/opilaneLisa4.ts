import type { LikertItem, QuestionnaireDefinition } from './types';

// Transkribeeritud failist "LAHEMATE_Lisa4_kysimustik_jareltest.docx".
// Plokid 1–6 on dokumendi enda sõnul samad, mis eeltestis (võimaldavad eel/järel
// võrdlust) — eraldi eeltesti-faili ei olnud, seega eeltesti sissejuhatuse tekst on
// siin kohandatud (mitte otse dokumendist transkribeeritud), aga väited on identsed.

const SCALE_LABELS: [string, string, string, string, string] = [
  '1 = üldse ei nõustu',
  '2 = pigem ei nõustu',
  '3 = nii ja naa',
  '4 = pigem nõustun',
  '5 = nõustun täielikult',
];

const olulisus: LikertItem[] = [
  { key: '1', label: 'Matemaatika oskamine on minu jaoks oluline' },
  { key: '2', label: 'Võrreldes teiste õppeainetega, on matemaatika oskamine minu jaoks olulisem' },
  { key: '3', label: 'Minu jaoks on oluline, et ma olen matemaatikas hea' },
  { key: '4', label: 'Matemaatika oskamine aitab mul elus paremini hakkama saada' },
];

const kasulikkus: LikertItem[] = [
  { key: '1', label: 'Matemaatika oskamine on minu jaoks kasulik ka teistes õppeainetes' },
  { key: '2', label: 'Matemaatika oskamine on minu jaoks kasulik ka tulevikus' },
  { key: '3', label: 'Matemaatika oskamine on mulle kasulik' },
  { key: '4', label: 'Matemaatika oskamine on mulle kasulik igapäevaelus' },
];

const kulu: LikertItem[] = [
  { key: '1', label: 'Matemaatika õppimine on minu jaoks liiga väsitav' },
  { key: '2', label: 'Matemaatika õppimine nõuab minult liiga palju pingutust' },
  { key: '3', label: 'Ma pean nägema liiga palju vaeva, et teha matemaatika koolitöid' },
  { key: '4', label: 'Matemaatika õppimine nõuab minult liiga palju aega' },
];

const enesetohusus: LikertItem[] = [
  { key: '1', label: 'Ma olen matemaatikas võimekas' },
  { key: '2', label: 'Matemaatika on minu jaoks raske' },
  { key: '3', label: 'Mul läheb matemaatikas hästi' },
];

const huvi: LikertItem[] = [
  { key: '1', label: 'Mulle meeldivad arvutamise ja matemaatikaga seotud ülesanded' },
  { key: '2', label: 'Ma lahendan koolis hea meelega arvutamise ja matemaatikaga seotud ülesandeid' },
  { key: '3', label: 'Ma lahendan kodus hea meelega arvutamise ja matemaatikaga seotud ülesandeid' },
  { key: '4', label: 'Matemaatikaülesannete lahendamine on minu jaoks huvitav' },
];

const matemaatikaarevus: LikertItem[] = [
  { key: '1', label: 'Tunnen end ärevana, kui pean iseseisvalt matemaatika töölehte täitma' },
  { key: '2', label: 'Tunnen end ärevana, kui mõtlen järgmise päeva matemaatika kontrolltöö peale' },
  { key: '3', label: 'Tunnen end ärevana, kui teen matemaatika kontrolltööd' },
  { key: '4', label: 'Tunnen end ärevana, kui matemaatikas alustatakse uue teemaga' },
  {
    key: '5',
    label: 'Tunnen end ärevana, kui teen raskete ülesannetega matemaatika kodutööd, mis tuleb järgmisel päeval ära anda',
  },
];

const matemaatilineMotteviis: LikertItem[] = [
  { key: '1', label: 'Igaüks võib piisavalt pingutades matemaatikat hästi selgeks saada' },
  { key: '2', label: 'Vigade tegemine aitab mul matemaatikat paremini mõista' },
  { key: '3', label: 'Matemaatikas on tähtsam mõista ideid sügavalt kui kiiresti vastuseid leida' },
  { key: '4', label: 'Matemaatika on minu jaoks pigem loominguline kui ainult reeglite meeldejätmise aine' },
  { key: '5', label: 'Erinevate lahendusviiside otsimine on matemaatikas sama oluline kui õige vastuse leidmine' },
];

const kasvuleSuunatudMotteviis: LikertItem[] = [
  { key: '1', label: 'Minu matemaatikavõimekus on suuresti kaasasündinud ja seda on raske muuta', reverseScored: true },
  { key: '2', label: 'Ma võin pingutades oma matemaatikavõimekust oluliselt suurendada' },
  { key: '3', label: 'Ükskõik kui palju ma pingutan, minu matemaatikaoskus ei muutu palju', reverseScored: true },
  { key: '4', label: 'Uute asjade õppimine aitab mul matemaatikas targemaks saada' },
];

const motlemistundideKogemus: LikertItem[] = [
  { key: '1', label: 'Uutes matemaatikatundides üritasin ülesandeid ise lahendada, enne kui küsisin abi' },
  { key: '2', label: 'Kui ülesanne tundus esmalt raske, jätkasin siiski selle kallal mõtlemist' },
  { key: '3', label: 'Mulle meeldis nendes tundides teistega rühmas koos mõelda ja arutleda' },
  {
    key: '4',
    label: 'Nendes tundides tundsin, et minu enda mõtlemine, mitte ainult õpetaja seletus, oli õppimise juures oluline',
  },
  {
    key: '5',
    label:
      'Eelistan matemaatikatundi, kus saan probleemi kallal ise või koos teistega mõelda, tunnile, kus õpetaja näitab kõigepealt lahenduskäigu ette',
  },
];

const probleemilahendusStrateegiad: LikertItem[] = [
  { key: '1', label: 'Enne ülesande lahendama hakkamist mõtlen läbi, mida ülesanne minult küsib' },
  { key: '2', label: 'Kui üks lahendusviis ei toimi, proovin teistmoodi lähenemist' },
  {
    key: '3',
    label:
      'Kasutan ülesannete lahendamisel teadlikult erinevaid võtteid (nt joonise tegemine, lihtsama juhu vaatlemine, tagurpidi mõtlemine)',
  },
  {
    key: '4',
    label: 'Pärast ülesande lahendamist kontrollin, kas vastus on mõistlik ja kas oleks saanud lahendada ka teisiti',
  },
  { key: '5', label: 'Ma oskan sõnastada, milliseid samme ma ülesande lahendamisel kasutasin' },
];

const kognitiivneKaasatus: LikertItem[] = [
  { key: '1', label: 'Matemaatikat õppides üritan mõista põhimõtteid, mitte ainult valemeid pähe õppida' },
  { key: '2', label: 'Kui teen vea, üritan aru saada, miks ma eksisin' },
  { key: '3', label: 'Seon uusi matemaatikateemasid sellega, mida ma juba tean' },
  { key: '4', label: 'Eelistan valemite pähe õppimist nende sisu mõistmisele', reverseScored: true },
];

const sharedIntro =
  'Siin on väited matemaatika õppimise kohta. Märgi ära iga väite juures, kuivõrd see väide Sind kirjeldab.';

export const lisa4Eel: QuestionnaireDefinition = {
  code: 'lisa4-eel',
  title: 'Küsimustik õpilasele — eeltest',
  intro: `${sharedIntro} Täidetakse enne sekkumisperioodi algust.`,
  scaleLabels: SCALE_LABELS,
  blocks: [
    { type: 'likert', key: 'olulisus', title: 'Olulisus', items: olulisus },
    { type: 'likert', key: 'kasulikkus', title: 'Kasulikkus', items: kasulikkus },
    { type: 'likert', key: 'kulu', title: 'Kulu', items: kulu },
    { type: 'likert', key: 'enesetohusus', title: 'Enesetõhusus', items: enesetohusus },
    { type: 'likert', key: 'huvi', title: 'Huvi', items: huvi },
    { type: 'likert', key: 'matemaatikaarevus', title: 'Matemaatikaärevus', items: matemaatikaarevus },
  ],
};

export const lisa4Jarel: QuestionnaireDefinition = {
  code: 'lisa4-jarel',
  title: 'Küsimustik õpilasele — järeltest',
  intro: `${sharedIntro} Täidetakse pärast sekkumisperioodi (u 15–20 tundi uue õppemeetodi abil, 2–3 kuu jooksul).`,
  scaleLabels: SCALE_LABELS,
  blocks: [
    { type: 'likert', key: 'olulisus', title: 'Olulisus', items: olulisus },
    { type: 'likert', key: 'kasulikkus', title: 'Kasulikkus', items: kasulikkus },
    { type: 'likert', key: 'kulu', title: 'Kulu', items: kulu },
    { type: 'likert', key: 'enesetohusus', title: 'Enesetõhusus', items: enesetohusus },
    { type: 'likert', key: 'huvi', title: 'Huvi', items: huvi },
    { type: 'likert', key: 'matemaatikaarevus', title: 'Matemaatikaärevus', items: matemaatikaarevus },
    {
      type: 'likert',
      key: 'matemaatiline_motteviis',
      title: 'Matemaatiline mõtteviis',
      items: matemaatilineMotteviis,
    },
    {
      type: 'likert',
      key: 'kasvule_suunatud_motteviis',
      title: 'Kasvule suunatud mõtteviis',
      items: kasvuleSuunatudMotteviis,
    },
    { type: 'likert', key: 'motlemistundide_kogemus', title: 'Mõtlemistundide kogemus', items: motlemistundideKogemus },
    {
      type: 'likert',
      key: 'probleemilahenduse_strateegiad',
      title: 'Probleemilahenduse strateegiad',
      items: probleemilahendusStrateegiad,
    },
    { type: 'likert', key: 'kognitiivne_kaasatus', title: 'Kognitiivne kaasatus', items: kognitiivneKaasatus },
  ],
};
