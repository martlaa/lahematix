import type { LikertItem, QuestionnaireDefinition } from './types';

// Transkribeeritud failist "LAHEMATE_Lisa8_Opetaja_kysimustik.docx".
// Taustaandmete plokis (dokumendi plokk 0) jäetakse küsimata "Õpetaja kood", "Kool"
// ja "Peamiselt rakendatud meetod" — need on juba teada Teacher/School kirjete kaudu
// (kuvatakse vormil loetavana infona, mitte küsimusena, vt src/app/opetaja/kysimustik).

const SCALE_LABELS: [string, string, string, string, string] = [
  '1 = üldse ei nõustu',
  '2 = pigem ei nõustu',
  '3 = nii ja naa',
  '4 = pigem nõustun',
  '5 = nõustun täielikult',
];

const kogemusProjektis: LikertItem[] = [
  { key: '1', label: 'Osalemine projektis oli mulle professionaalselt arendav' },
  { key: '2', label: 'Projektis osalemise ajakulu oli minu jaoks mõistlikus mahus' },
  { key: '3', label: 'Tunnen, et minu panust õpetajana väärtustati' },
  { key: '4', label: 'Osaleksin sarnases projektis uuesti' },
  { key: '5', label: 'See projekt on tugevdanud minu motivatsiooni jätkata matemaatikaõpetajana' },
  { key: '6', label: 'Soovitaksin sarnases projektis osalemist ka kolleegidele' },
];

const meetodiVordlusItems: LikertItem[] = [
  { key: 'a', label: 'Meetod sobib hästi Eesti matemaatika õppekavaga' },
  { key: 'b', label: 'Rakendamiseks vajalik ettevalmistus (materjalid, planeerimine) on mõistlikus mahus' },
  { key: 'c', label: 'Õpilased võtsid meetodi hästi omaks' },
  { key: 'd', label: 'Meetod sobib erineva tasemega õpilastega klassis' },
  { key: 'e', label: 'Kasutaksin seda meetodit ka edaspidi, ilma projekti toetuseta' },
];

const kasiraamat: LikertItem[] = [
  { key: '1', label: 'Käsiraamat oli selge ja arusaadav' },
  { key: '2', label: 'Käsiraamat andis piisavalt praktilist juhist tunni läbiviimiseks' },
  { key: '3', label: 'Näidistunnikavad olid otse kasutatavad või kergesti kohandatavad' },
  { key: '4', label: 'Näidisülesanded sobisid minu õpilaste tasemega' },
  { key: '5', label: 'Materjalide maht ja põhjalikkus olid tasakaalus (ei liiga vähe ega liiga palju)' },
];

const projektimeeskonnaTugi: LikertItem[] = [
  { key: '1', label: 'Koolitus enne piloteerimist valmistas mind rakendamiseks piisavalt ette' },
  { key: '2', label: 'Sain piloteerimise ajal vajadusel projektimeeskonnalt tuge' },
  { key: '3', label: 'Suhtlus ja tagasiside projektimeeskonnaga olid õigeaegsed' },
  { key: '4', label: 'Õpetajate-uurijate võrgustik (kolleegidega kogemuste jagamine) oli mulle kasulik' },
  { key: '5', label: 'Kolleegi tunni vaatlemine ja/või enda tunni vaadeldavaks tegemine oli kasulik kogemus' },
];

const enneMotteviis: LikertItem[] = [
  { key: '1', label: 'Usun, et kõik minu õpilased võivad piisava pingutusega matemaatikat hästi selgeks saada' },
  { key: '2', label: 'Pean õpilaste vigu väärtuslikuks õppimisvõimaluseks' },
  { key: '3', label: 'Rõhutan oma tundides pigem sügavat mõistmist kui kiirust' },
  { key: '4', label: 'Käsitlen matemaatikat pigem loomingulise kui reeglipõhise ainena' },
  {
    key: '5',
    label: 'Minu õpilaste matemaatikavõimekus on suuresti kaasasündinud ja seda on raske muuta',
    reverseScored: true,
  },
  { key: '6', label: 'Minu õpilased võivad pingutades oma matemaatikavõimekust oluliselt suurendada' },
  { key: '7', label: 'Ükskõik kui palju õpilased pingutavad, nende matemaatikaoskus ei muutu palju', reverseScored: true },
  { key: '8', label: 'Minu enda õpetamisviis mõjutab seda, kuivõrd minu õpilased end matemaatikas võimekaks peavad' },
];

const opilasteAreng: LikertItem[] = [
  { key: '1', label: 'Õpilaste huvi matemaatika vastu kasvas' },
  { key: '2', label: 'Nõrgemate õpilaste õpilüngad vähenesid' },
  { key: '3', label: 'Õpiraskustega õpilased said tundides paremini hakkama' },
  { key: '4', label: 'Õpilaste matemaatikaärevus vähenes' },
  { key: '5', label: 'Õpilaste kognitiivne kaasatus tundides kasvas' },
  { key: '6', label: 'Õpilaste mõisteline arusaamine (mitte ainult mehaaniline oskus) paranes' },
  { key: '7', label: 'Õpilaste matemaatikaalane probleemilahendusoskus paranes' },
];

const tulemuslikkus: LikertItem[] = [
  { key: '1', label: 'Minu hinnangul on see metoodika tulemuslikum kui traditsiooniline õpetamisviis' },
  { key: '2', label: 'Metoodika kasutuselevõtt on aja/vaeva väärt võrreldes saadava kasuga' },
  { key: '3', label: 'Enamik matemaatikaõpetajaid suudaks seda metoodikat piisava koolitusega rakendada' },
  { key: '4', label: 'Seda metoodikat oleks realistlik rakendada laiemalt Eesti koolides praeguste ressurssidega' },
  { key: '5', label: 'Eeltingimuse olulisus: piisav esmane ja järelkoolitus' },
  {
    key: '6',
    label: 'Eeltingimuse olulisus: kvaliteetsed ja kergesti kättesaadavad materjalid (käsiraamat, tunnikavad, ülesanded)',
  },
  { key: '7', label: 'Eeltingimuse olulisus: kolleegide/võrgustiku tugi ja kogemuste jagamine' },
  { key: '8', label: 'Eeltingimuse olulisus: kooli juhtkonna toetus ja prioriseerimine' },
  { key: '9', label: 'Eeltingimuse olulisus: piisav ajaline ressurss tunniks ettevalmistumiseks' },
  {
    key: '10',
    label: 'Eeltingimuse olulisus: tunnustussüsteem ja/või hindamissüsteemi kohandamine, mis toetab uut lähenemist',
  },
];

export const lisa8: QuestionnaireDefinition = {
  code: 'lisa8',
  title: 'Küsimustik õpetajale — projekti lõpp',
  intro:
    'Täidetakse veebipõhiselt pärast piloteerimisperioodi lõppu. Eeldatav täitmisaeg u 30 minutit. Vastuseid käideldakse konfidentsiaalselt ja pseudonümiseeritult vastavalt projekti andmehaldusplaanile.',
  scaleLabels: SCALE_LABELS,
  blocks: [
    {
      type: 'fields',
      key: 'taustaandmed',
      title: '0. Taustaandmed',
      items: [
        { key: 'kooliastmed', label: 'Õpetatav(ad) kooliaste(med)', inputType: 'text' },
        { key: 'staaz', label: 'Õpetajastaaž (aastates)', inputType: 'number' },
        { key: 'tundideArv', label: 'Tundide arv, mis jõudsid õpetada', inputType: 'number' },
        {
          key: 'tagasisideTeisteMeetoditega',
          label:
            'Kas said projekti käigus tagasisidet/vaatlesid ka teisi meetodeid (kolleegide tunnid, koolitus, materjalid)? Palun täpsusta.',
          inputType: 'textarea',
        },
      ],
    },
    { type: 'likert', key: 'kogemus_projektis', title: '1. Sinu kogemus projektis', items: kogemusProjektis },
    {
      type: 'method_comparison',
      key: 'meetodite_vordlus',
      title: '2. Meetodite võrdlev hindamine',
      intro:
        'Hinda kõiki kolme meetodit, k.a. neid, mida ise ei rakendanud (tuginedes koolitusele, materjalidele ja/või kolleegide tunnivaatlustele). Kui Sul ei ole meetodiga piisavalt kokkupuudet, märgi "EOH" (ei oska hinnata) numbrilise hinnangu asemel.',
      methods: [
        { key: 'BOALER', label: "Jo Boaler'i Mathematical Mindset" },
        { key: 'LILJEDAHL', label: "Peter Liljedahl'i Thinking Classroom" },
        { key: 'TOH', label: 'Toh jt Mathematical Problem Solving for Everyone (MProSE)' },
      ],
      items: meetodiVordlusItems,
    },
    { type: 'likert', key: 'kasiraamat', title: '3. Käsiraamat, näidistunnikavad ja -ülesanded', items: kasiraamat },
    {
      type: 'likert',
      key: 'projektimeeskonna_tugi',
      title: '4. Projektimeeskonna tugi ja koolitus',
      items: projektimeeskonnaTugi,
    },
    { type: 'likert', key: 'enne_motteviis', title: '5. Sinu enda matemaatiline mõtteviis', items: enneMotteviis },
    {
      type: 'likert',
      key: 'opilaste_areng',
      title: '6. Õpilaste areng sekkumise tulemusel (Sinu hinnangul)',
      items: opilasteAreng,
    },
    {
      type: 'likert',
      key: 'tulemuslikkus',
      title: '7. Tulemuslikkus, skaleeruvus ja eeltingimused Eesti koolikontekstis',
      items: tulemuslikkus,
    },
    {
      type: 'text',
      key: 'avatud_kusimused',
      title: '8. Avatud küsimused',
      items: [
        {
          key: '1',
          label:
            'Milline neist kolmest meetodist (Boaler, Liljedahl, Toh/MProSE) sobib Sinu hinnangul kõige paremini Eesti koolikonteksti ja miks?',
        },
        { key: '2', label: 'Mis oli suurim väljakutse metoodika rakendamisel?' },
        { key: '3', label: 'Mis oli kõige väärtuslikum osa projektis osalemisest?' },
        { key: '4', label: 'Mida sooviksid käsiraamatus, tunnikavades või ülesannetes muuta või täiendada?' },
        {
          key: '5',
          label:
            'Mis on Sinu hinnangul kõige olulisem eeltingimus, mis praegu Eesti koolides puudu on, et seda metoodikat laiemalt kasutusele võtta?',
        },
        { key: '6', label: 'Muud kommentaarid või soovitused projekti meeskonnale' },
      ],
    },
  ],
};
