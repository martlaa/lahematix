import type { JournalDefinition } from './types';

// Transkribeeritud failist LAHEMATE_Lisa7_Opetaja_paevik.docx.

export const lisa7: JournalDefinition = {
  code: 'lisa7',
  title: 'Uurijapäeviku sissekanne',
  intro:
    'Kirjuta see sissekanne kohe pärast uudsel õppemeetodil (Boaler / Liljedahl / Toh) põhinevat katsetundi — ideaalis samal päeval, kuni tunnis toimunu on veel värskelt meeles. Kirjuta konkreetselt ja faktipõhiselt (nt "Kolm õpilast neljast rühmast jõudsid iseseisvalt teise lahendusviisini"), mitte üldsõnaliselt ("läks hästi"). Sissekanded pseudonümiseeritakse ja neid käideldakse konfidentsiaalselt — väldi õpilaste nimede kasutamist (võid vajadusel kasutada õpilase pseudonüümi).',
  scaleLabels: [
    '1 = üldse ei nõustu',
    '2 = pigem ei nõustu',
    '3 = nii ja naa',
    '4 = pigem nõustun',
    '5 = nõustun täielikult',
  ],
  domains: [
    {
      key: 'struktuur',
      title: 'Struktuur ja meetodi rakendamine',
      items: [
        { key: '1', label: 'Tund kulges suuresti vastavalt tunnikavale' },
        {
          key: '2',
          label:
            'Rakendasin tunnis edukalt katsetatava meetodi põhivõtteid (nt Boaler: avatud ülesanded; Liljedahl: juhuslikud rühmad / vertikaalpinnad; Toh: probleemilahenduse 4 etappi)',
        },
      ],
    },
    {
      key: 'kaasatus',
      title: 'Õpilaste kaasatus ja mõtlemine',
      items: [
        { key: '3', label: 'Enamik õpilasi oli tunnis aktiivselt kaasatud' },
        {
          key: '4',
          label: 'Nägin, et õpilased mõtlesid iseseisvalt/süvitsi, mitte ei oodanud minu valmislahendust',
        },
        { key: '5', label: 'Õpilaste omavaheline koostöö/arutelu oli sisuline' },
      ],
    },
    {
      key: 'kliima',
      title: 'Emotsionaalne kliima',
      items: [
        {
          key: '6',
          label: 'Nägin õpilastel matemaatikaärevuse või ebamugavuse märke',
          reverseScored: true,
        },
        { key: '7', label: 'Klassi õhkkond oli positiivne ja toetav' },
      ],
    },
    {
      key: 'tagasiside',
      title: 'Tagasiside ja minu enda kogemus',
      items: [
        { key: '8', label: 'Sain tunnis anda piisavalt individuaalset tagasisidet' },
        { key: '9', label: 'Olin selle tunniga üldiselt rahul' },
      ],
    },
  ],
  rolfe: {
    whatIntro: '1. What? — Mis juhtus?',
    whatHelp:
      'Kirjelda, mida Sina ja õpilased täna tunni erinevate etappide jooksul tegid. Ole faktipõhine — kirjelda, ära veel hinda. Abiküsimused: Mida tegid Sina igas tunnikava etapis? Mida tegid õpilased? Millised ülesanded/juhised anti ja kuidas õpilased neile reageerisid? Mis juhtus ootamatut (intsident, üllatav küsimus, tehniline probleem)? Kes/mis mõjutas tunni kulgu kõige rohkem?',
    whatStageLabels: ['I etapp', 'II etapp', 'III etapp'],
    soWhatIntro: '2. So what? — Mida see tähendab?',
    soWhatHelp:
      "Analüüsi, mis õnnestus ja mis mitte, ning miks. Proovi \"miks\" analüüsis kasutada Boaler'i/Liljedahl'i/Toh raamistikku kui võimalik. Abiküsimused: Mis õnnestus hästi ja mis Sinu hinnangul selle põhjustas? Mis ei läinud plaanipäraselt ja miks? Kas ja kuidas rakendus meetodi (Boaler/Liljedahl/Toh) põhiidee tänases tunnis ehedalt? Mida see ütleb õpilaste mõtlemise, kaasatuse või emotsioonide kohta? Kas midagi üllatas Sind enda õpetamisviisi juures? Kas eespool antud kvantitatiivsed hinnangud haakuvad selle analüüsiga — kui mitte, siis miks?",
    nowWhatIntro: '3. Now what? — Mida nüüd teha?',
    nowWhatHelp:
      'Otsusta, mida oleks järgmistes tundides vaja muuta tänase analüüsi põhjal. Abiküsimused: Mida teeksid tänase kogemuse analüüsi põhjal järgmine kord sama teema/tunni puhul teisiti? Mida katsetad meetodi rakendamisel järgmises LAHEMATE katsetunnis teisiti? Millist konkreetset tuge, materjali või ettevalmistust vajaksid? Sõnasta üks konkreetne asi, mida järgmises tunnis kindlasti muuta proovid.',
  },
};
