import type { TestDefinition } from './types';

// Transkribeeritud failist LAHEMATE_probleemilahendus_valikvastustega_4-6.docx.
// NB: lähtedokumendis leidus paar sisemist ebakõla, mis on siin parandatud
// (vt PR/vestluse kokkuvõtet, kus need kasutajale eraldi välja toodi):
//  - 2a (Aiapeenar): nii B (4×5) kui C (3×6) rahuldavad 18m ümbermõõdu tingimust —
//    hindamisjuhend tunnistab seda ise ("Lisaväljakutse vastused") ja märgib B-d
//    õigeks; jätsime B-d õigeks vastuseks vastavalt juhendile.
//  - 2b: hindamisjuhendi arvutuskäik (4×5=20 m²) vastab valikule A, mitte
//    dokumendis kirjutatud "D"-le — kasutasime A-d, kuna arvutus on autoriteetsem.
//  - 2c: hindamisjuhendi arvutuskäik ("20 − 5×1 = 15") ei vasta selle ülesande
//    tegelikele arvudele (peenar 6×3=18 m², käigutee 6×1=6 m², tulemus 12 m²,
//    mis vastab valikule C) — parandasime rationale-teksti, valik (C) ise oli õige.

export const test4to6: TestDefinition = {
  code: 'test-4-6',
  title: 'Matemaatilise probleemilahenduse test (valikvastustega) — 4.–6. klass',
  gradeBand: '4-6',
  timeLimitMinutes: 45,
  instructions:
    'Loe iga ülesande juurde kuuluvat lugu tähelepanelikult. Iga alaküsimuse juures märgi ainult üks õige vastusevariant. Mõne alaküsimuse juures palutakse lisaks ka arvutuskäiku või selgitust kirjutada — sel juhul kirjuta see selleks ettenähtud kohale, isegi kui valisid õige vastuse. Kalkulaatorit võib kasutada. Aega on 45 minutit.',
  gradingIntro:
    'Skoorimine on kahetasandiline: alaküsimused, mille juures EI paluta selgitust/arvutuskäiku, annavad 0–1 punkti (1 = õige valik). Alaküsimused, mille juures palutakse ka selgitust/arvutuskäiku, annavad 0–2 punkti — õige valik annab 1 punkti, arusaadav ja korrektne selgitus annab teise punkti. Vale valik, aga õige/mõistlik selgitus, annab endiselt kuni 1 punkti selgituse eest.',
  maxScore: 17,
  problems: [
    {
      key: '1',
      title: 'Klassiekskursioon',
      story:
        '4. klass (24 õpilast) koos kahe õpetajaga plaanib minna ekskursioonile loomaaeda. Bussifirma pakub kahte võimalust: Väike buss — mahutab 15 inimest, hind 60 eurot päevas. Suur buss — mahutab 28 inimest, hind 95 eurot päevas. Loomaaia pilet maksab õpilasele 4 eurot ja täiskasvanule 7 eurot.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Kui palju maksab ekskursioon kokku, kui kasutatakse üht suurt bussi?',
          options: [
            { key: 'A', label: '199 €' },
            { key: 'B', label: '205 €' },
            { key: 'C', label: '191 €' },
            { key: 'D', label: '170 €' },
          ],
          correctChoice: 'B',
          maxPoints: 1,
          rationale:
            'Õige vastus: 205 € (95 + 24×4 + 2×7 = 95+96+14). Vale variandid tulenevad tüüpilistest vigadest: 199 € eeldab, et kõik 26 inimest maksid õpilase hinda; 191 € unustab õpetajate piletid; 170 € kasutab ekslikult väikse bussi hinda.',
        },
        {
          key: 'b',
          prompt: 'Kas oleks odavam kasutada kahte väikest bussi kui üht suurt bussi?',
          options: [
            { key: 'A', label: '120 €; jah, odavam' },
            { key: 'B', label: '90 €; jah, odavam' },
            { key: 'C', label: '120 €; ei, suur buss on endiselt odavam' },
            { key: 'D', label: '95 €; sama hind' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Näita oma arvutuskäiku:',
          maxPoints: 2,
          rationale:
            'Õige vastus: 120 €; ei ole odavam (2×60=120 > 95). Selgituses peab olema näidatud arvutus 2×60=120 ja võrdlus 95-ga.',
        },
        {
          key: 'c',
          prompt:
            'Klass tahab kaasa kutsuda ka 3 lapsevanemat. Mida muudab see ekskursiooni kogumaksumuses rohkem — kas pileti- või bussikulu?',
          options: [
            { key: 'A', label: 'Piletikulu kasvab rohkem kui bussikulu' },
            { key: 'B', label: 'Mõlemad kasvavad võrdselt' },
            { key: 'C', label: 'Bussikulu kasvab rohkem kui piletikulu' },
            { key: 'D', label: 'Lapsevanemate lisandumine ei mõjuta ekskursiooni kogumaksumust' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Selgita oma vastust arvutustega:',
          maxPoints: 2,
          rationale:
            'Õige vastus: Bussivaliku mõju (kuni 25 €, st 120−95) on suurem kui piletite kasvu mõju (21 €, st 3×7). Selgituses peavad olema mõlemad arvud välja toodud.',
        },
      ],
    },
    {
      key: '2',
      title: 'Aiapeenar',
      story:
        'Mardi pere tahab rajada õue ristkülikukujulise köögiviljapeenra. Peenra ümber tuleb panna aiavõrk ning seda võrku on neil kokku 18 meetrit.',
      subQuestions: [
        {
          key: 'a',
          prompt:
            'Milline pikkuse ja laiusega peenra saaks nad ümbritseda olemasoleva aiavõrguga (st peenra ümbermõõt on täpselt 18 m)?',
          options: [
            { key: 'A', label: 'pikkus 5 m, laius 5 m' },
            { key: 'B', label: 'pikkus 4 m, laius 5 m' },
            { key: 'C', label: 'pikkus 3 m, laius 6 m' },
            { key: 'D', label: 'pikkus 6 m, laius 4 m' },
          ],
          correctChoice: 'B',
          bonusPrompt: 'Kirjuta veel kaks sobivat varianti peenra küljepikkustest (hindamata lisaväljakutse):',
          maxPoints: 1,
          rationale:
            'Õige vastus: 4×5 (4+5=9, 2×9=18 ✓). NB: ka variant 3×6 rahuldab 18 m ümbermõõdu tingimust — kui õpilane valis selle variandi ja selgitas seda korrektselt lisaväljal, loe see samuti õigeks. Lisaväljakutse vastused: nt 1×8, 2×7, 3×6.',
        },
        {
          key: 'b',
          prompt: 'Millise neist neljast 18 m ümbermõõduga peenrast oleks kõige suurema pindalaga?',
          options: [
            { key: 'A', label: 'pikkus 5 m, laius 4 m' },
            { key: 'B', label: 'pikkus 3 m, laius 6 m' },
            { key: 'C', label: 'pikkus 9 m, laius 2 m' },
            { key: 'D', label: 'pikkus 6 m, laius 3 m' },
          ],
          correctChoice: 'A',
          requiresExplanation: true,
          explanationPrompt: 'Näita, kuidas sa selle leidsid:',
          maxPoints: 2,
          rationale:
            'Õige vastus: 5×4 (20 m²) — ruudule kõige lähedasem kuju annab fikseeritud ümbermõõdu juures suurima pindala (5×4=20 > 3×6=18 = 6×3=18; 9×2=18 küll pindalalt, aga selle ümbermõõt on tegelikult 22 m, mitte 18 m, seega ei sobi võrdlusesse).',
        },
        {
          key: 'c',
          prompt:
            'Mart tahab 6 x 3 m küljepikkusega peenra keskele panna ka 1 m laiuse käigutee, mis läbib peenart pikuti. Kui suur ala jääks pärast selle käigutee lisamist köögivilja kasvatamiseks?',
          options: [
            { key: 'A', label: '10 m²' },
            { key: 'B', label: '19 m²' },
            { key: 'C', label: '12 m²' },
            { key: 'D', label: '16 m²' },
          ],
          correctChoice: 'C',
          maxPoints: 1,
          rationale: 'Õige vastus: 12 m² (peenra ala 6×3=18 m², käigutee 6×1=6 m², 18−6=12).',
        },
      ],
    },
    {
      key: '3',
      title: 'Sünnipäevapidu',
      story:
        'Liisa kutsub oma sünnipäevale 11 sõpra. Liisa arvestab, et iga laps (ka tema ise) joob sünnipäeval ühe klaasi limonaadi ja sööb 2 tükki pitsat. Pitsad on lõigatud 8 võrdseks tükiks. Limonaadi müüakse 1,5-liitristes pudelites, ühest pudelist jagub 6 klaasitäit.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Mitu pudelit limonaadi peaks Liisa ostma, et kõigile jaguks, aga palju üle ei jääks?',
          options: [
            { key: 'A', label: '1 pudeli' },
            { key: 'B', label: '2 pudelit' },
            { key: 'C', label: '3 pudelit' },
            { key: 'D', label: '6 pudelit' },
          ],
          correctChoice: 'B',
          maxPoints: 1,
          rationale: 'Õige vastus: 2 pudelit (12 lapse jaoks 12 klaasitäit, 12 ÷ 6 = 2).',
        },
        {
          key: 'b',
          prompt: 'Mitu pitsat tuleb tellida?',
          options: [
            { key: 'A', label: '2 pitsat' },
            { key: 'B', label: '4 pitsat' },
            { key: 'C', label: '6 pitsat' },
            { key: 'D', label: '3 pitsat' },
          ],
          correctChoice: 'D',
          maxPoints: 1,
          rationale: 'Õige vastus: 3 pitsat (12 last × 2 tükki = 24 tükki, 24 ÷ 8 = 3).',
        },
        {
          key: 'c',
          prompt:
            'Üks pitsa maksab 9 eurot ja üks limonaadipudel 2,5 eurot. Liisa emal on peo jaoks 40 eurot. Kas raha jätkub?',
          options: [
            { key: 'A', label: 'Kulub 40 €, jääb üle 0 €' },
            { key: 'B', label: 'Kulub 27 €, jääb üle 13 €' },
            { key: 'C', label: 'Raha jääb puudu' },
            { key: 'D', label: 'Kulub 32 €, jääb üle 8 €' },
          ],
          correctChoice: 'D',
          maxPoints: 1,
          rationale: 'Õige vastus: Kulub 32 € (3×9 + 2×2,5 = 27+5=32), jääb üle 8 € (40−32=8).',
        },
      ],
    },
    {
      key: '4',
      title: 'Klotsitrepp',
      story:
        'Keiu ehitab klotsidest trepi. Trepi tipus on 1 klots, järgmises astmes on 2 klotsi. Kolmandas astmes on 3 klotsi. Iga järgmine aste lisab trepile ühe rea, mis on ühe klotsi võrra pikem kui eelmine.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Mitu klotsi kulub kokku 6-astmelise trepi jaoks?',
          options: [
            { key: 'A', label: '36' },
            { key: 'B', label: '15' },
            { key: 'C', label: '21' },
            { key: 'D', label: '18' },
          ],
          correctChoice: 'C',
          maxPoints: 1,
          rationale: 'Õige vastus: 21 (1+2+3+4+5+6).',
        },
        {
          key: 'b',
          prompt: 'Mitu klotsi kulub kokku, kui püramiidis on 10 astet?',
          options: [
            { key: 'A', label: '45' },
            { key: 'B', label: '55' },
            { key: 'C', label: '66' },
            { key: 'D', label: '50' },
          ],
          correctChoice: 'B',
          requiresExplanation: true,
          explanationPrompt: 'Kirjelda, kuidas sa arvutasid (ei pea kõiki vaheastmeid ükshaaval liitma):',
          maxPoints: 2,
          rationale:
            'Õige vastus: 55 (kolmnurkarvude valem n(n+1)/2 = 10×11/2 = 55). Tunnusta ka käsitsi liitmist, kui viidatakse mustrile/lühivõttele.',
        },
        {
          key: 'c',
          prompt: 'Keiu ehitas püramiidi, kuhu kulus kokku täpselt 45 klotsi. Mitu astet tal trepis oli?',
          options: [
            { key: 'A', label: '45 astet' },
            { key: 'B', label: '10 astet' },
            { key: 'C', label: '8 astet' },
            { key: 'D', label: '9 astet' },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Näita, kuidas sa selle leidsid:',
          maxPoints: 2,
          rationale: 'Õige vastus: 9 astet (n(n+1)/2=45 ⟹ n(n+1)=90 ⟹ n=9).',
        },
      ],
    },
  ],
};
