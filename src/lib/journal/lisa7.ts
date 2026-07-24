import type { JournalDefinition } from './types';

// Transkribeeritud failist LAHEMATE_Lisa7_Opetaja_paevik.docx.
//
// NB! 2026-07-24: uurijapäeviku kvantitatiivne osa asendati CLASS-põhise
// ad-hoc skaala asemel sama TRU (Teaching for Robust Understanding)
// raamistikuga, mida kasutab tunnivaatlusprotokoll (Lisa 6c, vt
// src/lib/observation/lisa6.ts) — samad 6 dimensiooni ja 11 tunnust
// (M1,M2/K1,K2/V1,V2/O1,O2/T1,T2/MT1), ainult esimeses isikus (õpetaja
// enesehinnang, mitte kõrvalvaatleja hinnang) ja 1-5 skaalal (mitte 1-4).
// See võimaldab rida-realt võrrelda õpetaja enda ja vaatleja hinnanguid
// samale tunnile. Rolfe (What/So what/Now what) refleksiooni struktuur jäi
// samaks, ainult abiküsimuste sõnastus täpsustus veidi.

export const lisa7: JournalDefinition = {
  code: 'lisa7',
  title: 'Uurijapäeviku sissekanne',
  intro:
    'Kirjuta see sissekanne kohe pärast uudsel õppemeetodil (Boaler / Liljedahl / Toh) põhinevat katsetundi — ideaalis samal päeval, kuni tund on veel värskelt meeles. Kvantitatiivne osa põhineb täpselt samal Teaching for Robust Understanding (TRU) raamistikul, mida kasutab ka tunnivaatlusprotokoll (Lisa 6) — väited on sõnastatud identsete konstruktide alusel, mis võimaldab rida-realt võrrelda Sinu enda ja kõrvalvaatleja hinnanguid samale tunnile. Kirjuta konkreetselt ja faktipõhiselt (nt "Kolm õpilast neljast rühmast jõudsid iseseisvalt teise lahendusviisini"), mitte üldsõnaliselt ("läks hästi"). Sissekanded pseudonümiseeritakse ja neid käideldakse konfidentsiaalselt — väldi õpilaste nimede kasutamist (võid vajadusel kasutada õpilase pseudonüümi).',
  scaleLabels: [
    '1 = üldse ei nõustu',
    '2 = pigem ei nõustu',
    '3 = nii ja naa',
    '4 = pigem nõustun',
    '5 = nõustun täielikult',
  ],
  domains: [
    {
      key: 'M',
      title: '1. Matemaatiline sisukus',
      items: [
        { key: 'M1', label: 'Minu tunni matemaatiline sisu oli hästi õppekavaga seostatud' },
        {
          key: 'M2',
          label:
            'Ülesanded võimaldasid õpilastel kasutada mitut lahenduskäiku ja luua seoseid erinevate matemaatika valdkondade vahel',
        },
      ],
    },
    {
      key: 'K',
      title: '2. Kognitiivne nõudlikkus',
      items: [
        { key: 'K1', label: 'Andsin õpilastele aega ja võimalusi produktiivseks takerdumiseks enne abi pakkumist' },
        {
          key: 'K2',
          label: 'Õpilased tegelesid probleemilahendusega süvitsi, mitte ei kiirustanud kohe valmislahenduseni',
        },
      ],
    },
    {
      key: 'V',
      title: '3. Võrdne juurdepääs matemaatikale',
      items: [
        {
          key: 'V1',
          label: 'Kõigil õpilastel, mitte ainult aktiivsematel/kiirematel, oli võimalus matemaatilises mõtlemises osaleda',
        },
        { key: 'V2', label: 'Kaasasin teadlikult ka vaiksemaid/tagasihoidlikumaid õpilasi' },
      ],
    },
    {
      key: 'O',
      title: '4. Õpilase agentsus, omanikutunne ja identiteet',
      items: [
        {
          key: 'O1',
          label: 'Õpilased selgitasid ja põhjendasid oma mõtlemist oma sõnadega, mitte ei korranud minu sõnu või õpikuteksti',
        },
        { key: 'O2', label: 'Õpilased tundusid matemaatikas pädevad ja aktiivsed, mitte ärevad/ebakindlad' },
      ],
    },
    {
      key: 'T',
      title: '5. Kujundav (õppimist toetav) tagasiside',
      items: [
        {
          key: 'T1',
          label: 'Jälgisin jooksvalt õpilaste mõtlemist (mitte ainult lõpptulemust) ja kohandasin tagasisidet vastavalt',
        },
        { key: 'T2', label: 'Minu tagasiside oli konkreetne ja mõtlema suunav, mitte ainult "õige/vale"' },
      ],
    },
    {
      key: 'MT',
      title: '6. Meetodi truudus',
      items: [
        {
          key: 'MT1',
          label: 'Minu tund järgis valitud meetodi (Boaler / Liljedahl / Toh) põhimõtteid ja soovitusi vastavalt tunnikavale',
        },
      ],
    },
  ],
  rolfe: {
    whatIntro: '1. What? Mis juhtus?',
    whatHelp:
      'Kirjelda, mida Sina ja õpilased täna tunni erinevate etappide jooksul tegid. Ole faktipõhine ja keskendu toimunu kirjeldamisele, ära selles etapis veel hinda. Abiküsimused: Mida tegid Sina igas tunnikava etapis? Mida tegid õpilased? Millised ülesanded/juhised anti ja kuidas õpilased neile reageerisid? Mis juhtus ootamatut (intsident, üllatav küsimus, tehniline probleem)? Kes/mis mõjutas tunni kulgu kõige rohkem?',
    whatStageLabels: ['I etapp', 'II etapp', 'III etapp'],
    soWhatIntro: '2. So what? Mida see tähendab?',
    soWhatHelp:
      'Analüüsi, mis õnnestus ja mis mitte, ning miks. Abiküsimused: Mis õnnestus hästi ja mis Sinu hinnangul selle põhjustas? Mis ei läinud plaanipäraselt ja miks? Kas ja kuidas rakendus meetodi (Boaler/Liljedahl/Toh) põhiidee tänases tunnis ehedalt? Mida see ütleb õpilaste mõtlemise, kaasatuse või emotsioonide kohta? Kas midagi üllatas Sind enda õpetamisviisi juures? Kas eespool antud kvantitatiivsed hinnangud haakuvad selle analüüsiga — kui mitte, siis miks?',
    nowWhatIntro: '3. Now what? Millised järeldused teen selle analüüsi põhjal edasiseks?',
    nowWhatHelp:
      'Otsusta, mida oleks järgmistes tundides vaja muuta tänase analüüsi põhjal. Abiküsimused: Mida teeksid järgmine kord sama teema/tunni puhul teisiti? Mida katsetad meetodi rakendamisel järgmises tunnis teisiti? Millist konkreetset tuge, materjali või ettevalmistust vajaksid? Sõnasta üks konkreetne asi, mida järgmises tunnis kindlasti proovid.',
  },
};
