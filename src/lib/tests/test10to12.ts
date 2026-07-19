import type { TestDefinition } from './types';

// Transkribeeritud failist LAHEMATE_probleemilahendus_valikvastustega_10-12.docx.
// NB: ülesande 2 (Pakiveo optimeerimine) alaküsimuse c valikus C oli trükiviga
// tulu arvutuses (kirjas "105 €", tegelik arvutus 15×3+5×6=75 €) — parandasime
// numbri siin (õige vastus jääb D-ks, seda viga ei mõjuta).

export const test10to12: TestDefinition = {
  code: 'test-10-12',
  title: 'Matemaatilise probleemilahenduse test (valikvastustega) — 10.–12. klass',
  gradeBand: '10-12',
  timeLimitMinutes: 55,
  instructions:
    'Loe iga ülesande juurde kuuluvat kirjeldust tähelepanelikult. Iga alaküsimuse juures märgi ainult üks õige vastusevariant. Mõne alaküsimuse juures palutakse lisaks ka arvutuskäiku või põhjendust kirjutada — sel juhul kirjuta see selleks ettenähtud kohale, isegi kui valisid õige vastuse. Kalkulaatorit võib kasutada. Aega on 55 minutit.',
  gradingIntro:
    'Skoorimine on kahetasandiline: alaküsimused ilma selgituseta annavad 0–1 punkti (1 = õige valik); alaküsimused, mille juures palutakse ka põhjendust/arvutuskäiku, annavad 0–2 punkti — õige valik annab 1 punkti, arusaadav põhjendus teise. Vale valik, aga sisuliselt õige põhjendus, annab endiselt kuni 1 punkti. Gümnaasiumiastme testis on enamik alapunkte selgitust nõudvad, kuna rõhk on tulemuse tõlgendamisel ja mudeli kriitikal — ilma sisulise põhjenduseta antakse nende puhul maksimaalselt 1 punkt ka õige valiku korral.',
  maxScore: 21,
  problems: [
    {
      key: '1',
      title: 'Investeerimisotsus',
      story:
        'Kristjan sai päranduseks 2000 eurot ja kaalub kaht võimalust raha investeerimiseks 5-aastase tähtajaga: Pank A — hoiuintress 3% aastas, intress lisandub igal aastal kapitalile (liitintress). Investeerimisfond B — keskmine bruto tootlus on olnud 6% aastas, kuid fond võtab iga-aastast haldustasu 1% (nii et netotootlus on 5% aastas) ning esimesel aastal lisaks ühekordset sisenemistasu 2% investeeritud summast.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Kui palju oleks Kristjani rahal Pangas A 5 aasta pärast, kui intress lisandub liitintressina?',
          options: [
            { key: 'A', label: '2600 €' },
            { key: 'B', label: '2251 €' },
            { key: 'C', label: '2318,55 €' },
            { key: 'D', label: '2300 €' },
          ],
          correctChoice: 'C',
          maxPoints: 1,
          rationale: 'Õige vastus: 2318,55 € (2000×1,03⁵).',
        },
        {
          key: 'b',
          prompt: 'Kui suur on Fondi B väärtus 5 aasta pärast (arvesta sisenemistasu ja iga-aastast netotootlust 5%)?',
          options: [
            { key: 'A', label: '2450 €' },
            { key: 'B', label: '2622,90 €' },
            { key: 'C', label: '2552,56 €' },
            { key: 'D', label: '2501,50 €' },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Näita arvutuskäiku Fondi B väärtuse leidmiseks:',
          maxPoints: 2,
          rationale: 'Õige vastus: 2501,50 € (2000×0,98=1960; 1960×1,05⁵≈2501,5).',
        },
        {
          key: 'c',
          prompt:
            'Kumb valik on 5 aasta pärast tulusam? Kas sinu vastus muutuks, kui Kristjan hoiaks raha 20 aastat, mitte 5?',
          options: [
            { key: 'A', label: 'Pank A on tulusam ja jääb tulusamaks ka pikas perspektiivis' },
            { key: 'B', label: 'Mõlemad annavad täpselt sama tulemuse igal ajahetkel' },
            { key: 'C', label: 'Fond B on tulusam ja eelis kasvab pikema perioodi jooksul veelgi' },
            { key: 'D', label: 'Fond B on tulusam 5 aasta pärast, aga Pank A tuleks pikas perspektiivis ette' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Põhjenda matemaatiliselt (ei pea 20 aasta kohta täpseid arve arvutama):',
          maxPoints: 2,
          rationale:
            'Õige vastus: Fond B on tulusam ja eelis kasvab pikema perioodi jooksul, kuna liitkasvu vahe (5% vs 3%) kuhjub eksponentsiaalselt, samas kui ühekordse sisenemistasu mõju jääb ajas samaks ja muutub suhteliselt väiksemaks.',
        },
      ],
    },
    {
      key: '2',
      title: 'Pakiveo optimeerimine',
      story:
        'Kulleriteenus veab kaupa kahte tüüpi kastides: väike kast (maht 0,2 m³, kaal kuni 5 kg, veotasu kliendile 3 €) ja suur kast (maht 0,5 m³, kaal kuni 15 kg, veotasu 6 €). Üks veok mahutab kokku kuni 6 m³ kaupa ja kannab kuni 150 kg last korraga.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Kui veokisse pannakse ainult väikeseid kaste, mitu neist mahub, arvestades mõlemat piirangut (maht ja kaal)?',
          options: [
            { key: 'A', label: '25 kasti mõlema piirangu järgi' },
            { key: 'B', label: '30 kasti mahu järgi, kaal lubab kuni 35' },
            { key: 'C', label: '30 kasti mahu järgi, aga kaal lubab ainult 25' },
            { key: 'D', label: '30 kasti, mõlemad piirangud lubavad täpselt sama palju' },
          ],
          correctChoice: 'D',
          maxPoints: 1,
          rationale: 'Õige vastus: 30 kasti, mõlemad piirangud lubavad täpselt sama palju (6÷0,2=30; 30×5=150 kg — täpselt piiril).',
        },
        {
          key: 'b',
          prompt: 'Kui veokisse pannakse ainult suuri kaste, mitu neist saab kaasa võtta, arvestades mõlemat piirangut?',
          options: [
            { key: 'A', label: '15' },
            { key: 'B', label: '8' },
            { key: 'C', label: '10' },
            { key: 'D', label: '12' },
          ],
          correctChoice: 'C',
          maxPoints: 1,
          rationale: 'Õige vastus: 10 (mahu järgi 12, kaalu järgi 150÷15=10 — kaal on rangem piirang).',
        },
        {
          key: 'c',
          prompt:
            'Kulleriteenus soovib ühe veoga teenida võimalikult palju raha. Milline kombinatsioon annab suurima tulu, jäädes mõlema piirangu piiresse?',
          options: [
            { key: 'A', label: 'Segu: 20 väikest + 3 suurt, tulu 78 €' },
            { key: 'B', label: 'Ainult suured kastid (10 tk), tulu 60 €' },
            { key: 'C', label: 'Segu: 15 väikest + 5 suurt, tulu 75 €' },
            { key: 'D', label: 'Ainult väikesed kastid (30 tk), tulu 90 €' },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Näita, kuidas kontrollisid, et sinu lahendus piiranguid ei riku:',
          maxPoints: 2,
          rationale:
            'Õige vastus: Ainult väikesed kastid (30 tk), tulu 90 €. Kaalupiirang (x≤30−3y) on rangem mahupiirangust, mistõttu tulu=90−3y kahaneb y kasvades — vastupidiselt intuitsioonile, et suured kastid on tulusamad.',
        },
      ],
    },
    {
      key: '3',
      title: 'Hinnastrateegia',
      story:
        'Üks õpilasfirma müüb koolilaadal käsitsi valmistatud riidest kotte nelja erineva hinnaga. Eelmistel laatadel on nad märganud, et müüdud koguste ja hinna vahel on selge seos: Hind 8 € → 40 tk; Hind 10 € → 32 tk; Hind 12 € → 24 tk; Hind 14 € → 16 tk.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Milline valem q(p) annab õigesti müüdud kottide arvu hinna p juures?',
          options: [
            { key: 'A', label: 'q(p) = 8p − 24' },
            { key: 'B', label: 'q(p) = 72 − 4p' },
            { key: 'C', label: 'q(p) = 40 − 4p' },
            { key: 'D', label: 'q(p) = 72 − 2p' },
          ],
          correctChoice: 'B',
          requiresExplanation: true,
          explanationPrompt: 'Näita, et seos on lineaarne (arvutuskäik):',
          maxPoints: 2,
          rationale: 'Õige vastus: q(p) = 72 − 4p (iga 2 € hinnatõusu kohta müüakse 8 kotti vähem, konstantne tõus −4 kotti/euro).',
        },
        {
          key: 'b',
          prompt: 'Kasuta valemit T(p) = p · q(p). Millise hinna p juures on müügitulu maksimaalne ja kui suur see tulu on?',
          options: [
            { key: 'A', label: 'Hind 18 €, tulu 0 €' },
            { key: 'B', label: 'Hind 10 €, tulu 320 €' },
            { key: 'C', label: 'Hind 9 €, tulu 324 €' },
            { key: 'D', label: 'Hind 8 €, tulu 320 €' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Kirjuta T(p) lahti ja näita arvutuskäiku:',
          maxPoints: 2,
          rationale: 'Õige vastus: Hind 9 €, tulu 324 € (T(p)=72p−4p², tipp p=9, T(9)=324).',
        },
        {
          key: 'c',
          prompt:
            'Kas mudel q(p) jääb usutavaks ka väga madala või väga kõrge hinna korral? Mis hinnast alates annab mudel mõttetu tulemuse?',
          options: [
            { key: 'A', label: 'Mudel ei kehti mitte kunagi, isegi mitte vaadeldud hinnavahemikus' },
            { key: 'B', label: 'Mudel annab negatiivse koguse alles hinna 72 € juures' },
            { key: 'C', label: 'Mudel kehtib kõikide hindade juures piiranguteta' },
            { key: 'D', label: 'Mudel annab p=18 € juures nullkoguse; kõrgemal hinnal muutub kogus negatiivseks' },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Selgita, mida see ütleb mudeli kehtivuspiirkonna kohta:',
          maxPoints: 2,
          rationale:
            'Õige vastus: Mudel annab p=18 € juures nullkoguse; kõrgemal hinnal muutub kogus negatiivseks, mis on mõttetu — mudel kehtib vahemikus 0≤p≤18, ja ka selles vahemikus on äärmuste lähedal ekstrapolatsioon ebakindel.',
        },
      ],
    },
    {
      key: '4',
      title: 'Eksamitulemuste andmeanalüüs',
      story:
        'Kooli matemaatikaeksami tulemused (punktid skaalal 0–100) kahes paralleelklassis: Klass X (20 õpilast) — keskmine 68, standardhälve 8. Klass Y (20 õpilast) — keskmine 68, standardhälve 18.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Mõlema klassi keskmine tulemus on sama. Kas see tähendab, et klasside tulemused on "sarnased"?',
          options: [
            { key: 'A', label: 'Jah, kuna standardhälve ei mõjuta tulemuste sarnasust' },
            { key: 'B', label: 'Ei — Klassis X on rohkem väga häid ja väga nõrku tulemusi, kuna standardhälve on väiksem' },
            { key: 'C', label: 'Jah — sama keskmine tähendab, et klassid on väga sarnased' },
            {
              key: 'D',
              label:
                'Ei — sama keskmine ei tähenda sarnaseid tulemusi; klassis Y osutab suurem standardhälve keskmisest paremate ja kehvemate tulemuste rohkusele võrreldes teise klassiga',
            },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Selgita standardhälbe abil, mille poolest klassid tegelikult erinevad:',
          maxPoints: 2,
          rationale:
            'Õige vastus: Ei — sama keskmine ei tähenda sarnaseid tulemusi. Klass Y standardhälve (18) on palju suurem kui X-il (8), mis tähendab Y tulemused on hajusamad.',
        },
        {
          key: 'b',
          prompt: 'Millises klassis on tõenäolisemalt rohkem õpilasi, kes said alla 50 punkti?',
          options: [
            { key: 'A', label: 'Ei saa öelda ilma täpseid hindeid nägemata' },
            { key: 'B', label: 'Klass X, kuna väiksem standardhälve tähendab madalamaid tulemusi' },
            { key: 'C', label: 'Klass Y, kuna suurem standardhälve tähendab, et rohkem õpilasi sooritas keskmisest kehvemini' },
            { key: 'D', label: 'Mõlemas klassis on võrdselt palju alla 50 punkti saanud õpilasi' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Põhjenda:',
          maxPoints: 2,
          rationale: 'Õige vastus: Klass Y, kuna suurem standardhälve tähendab rohkem keskmisest erinevaid tulemusi.',
        },
        {
          key: 'c',
          prompt:
            'Õpetaja tahab pakkuda neist kahest klassist ühele täiendavat tuge vajavate õpilaste toetusprogrammi. Milline lisaandmete valik oleks otsuse tegemiseks kõige kasulikum?',
          options: [
            { key: 'A', label: 'Ainult klassi õpilaste jooksvate hinnete keskmine' },
            { key: 'B', label: 'Ainult klassi jooksvate hinnete standardhälve' },
            { key: 'C', label: 'Hindeliste tööde tulemuste histogramm, mediaan ja kvartiilid' },
            { key: 'D', label: 'Ainult eelmise aasta jooksvate hinnete keskmine võrreldes kooli keskmisega' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Nimeta veel üks kasulik lisaandmete liik ja põhjenda:',
          maxPoints: 2,
          rationale:
            'Õige vastus: Tulemuste histogramm, mediaan ja kvartiilid. Muud head vastused avatud lisaväljal: konkreetsete nõrgemate õpilaste nimekiri ja nende hinnete muutustrend, õpilaste endi tagasiside.',
        },
      ],
    },
  ],
};
