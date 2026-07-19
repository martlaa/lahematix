import type { TestDefinition } from './types';

// Transkribeeritud failist LAHEMATE_probleemilahendus_valikvastustega_7-9.docx.
// NB: lähtedokumendi hindamisjuhendis olid ülesande 3 (Klassiruumi
// ümberkorraldamine) alaküsimustes b ja c õige vastuse tähed valesti (mõlemal
// kirjutati "D", kuigi arvutuskäik vastab valikule "C") — parandasime need
// siin C-le (vt kasutajale saadetud kokkuvõte lähtefailide ebakõladest).

export const test7to9: TestDefinition = {
  code: 'test-7-9',
  title: 'Matemaatilise probleemilahenduse test (valikvastustega) — 7.–9. klass',
  gradeBand: '7-9',
  timeLimitMinutes: 50,
  instructions:
    'Loe iga ülesande juurde kuuluvat kirjeldust tähelepanelikult. Iga alaküsimuse juures märgi ainult üks õige vastusevariant. Mõne alaküsimuse juures palutakse lisaks ka arvutuskäiku või selgitust kirjutada — sel juhul kirjuta see selleks ettenähtud kohale, isegi kui valisid õige vastuse. Kalkulaatorit võib kasutada. Aega on 50 minutit.',
  gradingIntro:
    'Skoorimine on kahetasandiline: alaküsimused ilma selgituseta annavad 0–1 punkti (1 = õige valik); alaküsimused, mille juures palutakse ka selgitust/arvutuskäiku, annavad 0–2 punkti — õige valik annab 1 punkti, arusaadav selgitus teise. Vale valik, aga õige/mõistlik selgitus, annab endiselt kuni 1 punkti selgituse eest.',
  maxScore: 17,
  problems: [
    {
      key: '1',
      title: 'Mobiiliplaan',
      story:
        'Kaks mobiilioperaatorit pakuvad Ragnarile järgmisi kuutasusid: Operaator A — kuutasu 5 eurot + 0,02 eurot iga kasutatud andmemegabaidi (MB) eest. Operaator B — kuutasu 12 eurot, andmemaht piiramatu ja tasuta.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Kui palju maksab Operaator A kasutamine kuus, kui õpilane kasutab 250 MB andmesidet?',
          options: [
            { key: 'A', label: '15 €' },
            { key: 'B', label: '5,5 €' },
            { key: 'C', label: '5 €' },
            { key: 'D', label: '10 €' },
          ],
          correctChoice: 'D',
          maxPoints: 1,
          rationale: 'Õige vastus: 10 € (5 + 250×0,02 = 10).',
        },
        {
          key: 'b',
          prompt: 'Mitme megabaidi kasutamise juures lähevad kahe operaatori kuutasud täpselt võrdseks?',
          options: [
            { key: 'A', label: '250 MB' },
            { key: 'B', label: '350 MB' },
            { key: 'C', label: '700 MB' },
            { key: 'D', label: '140 MB' },
          ],
          correctChoice: 'B',
          requiresExplanation: true,
          explanationPrompt: 'Näita arvutuskäiku:',
          maxPoints: 2,
          rationale: 'Õige vastus: 350 MB (5+0,02x=12 ⟹ x=350).',
        },
        {
          key: 'c',
          prompt:
            'Õpilase andmekasutus viimasel kolmel kuul oli 310 MB, 410 MB ja 380 MB. Kumb operaator oleks tema jaoks keskmiselt soodsam?',
          options: [
            { key: 'A', label: 'A on soodsam, kuna A keskmine kasutus jääb alla 350 MB' },
            { key: 'B', label: 'Mõlemad on võrdselt soodsad' },
            { key: 'C', label: 'B on soodsam (A keskmine kulu on pisut suurem kui B)' },
            { key: 'D', label: 'A on soodsam (A keskmine kulu on pisut väiksem kui B)' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Põhjenda arvutustega:',
          maxPoints: 2,
          rationale:
            'Õige vastus: B on soodsam. Keskmine kasutus (310+410+380)/3≈366,7 MB ületab 350 MB piiri; A maksaks keskmiselt ≈12,33 €, mis on rohkem kui B fikseeritud 12 €.',
        },
      ],
    },
    {
      key: '2',
      title: 'Basseini täitmine',
      story:
        'Ujula bassein täitub 8 tunniga, kui avatud on üksnes toru A. Üksnes toru B kasutades täituks sama basseini 12 tunniga. Ühel hommikul avati mõlemad torud korraga.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Kui suure osa basseinist täidavad torud koos ühe tunniga?',
          options: [
            { key: 'A', label: '1/10' },
            { key: 'B', label: '1/6' },
            { key: 'C', label: '1/20' },
            { key: 'D', label: '5/24' },
          ],
          correctChoice: 'D',
          maxPoints: 1,
          rationale: 'Õige vastus: 5/24 (1/8+1/12=3/24+2/24).',
        },
        {
          key: 'b',
          prompt: 'Mitme tunni pärast saab bassein täis, kui mõlemad torud on avatud?',
          options: [
            { key: 'A', label: '4 tundi' },
            { key: 'B', label: '6 tundi' },
            { key: 'C', label: '4,8 tundi' },
            { key: 'D', label: '5 tundi' },
          ],
          correctChoice: 'C',
          maxPoints: 1,
          rationale: 'Õige vastus: 4,8 tundi (1÷5/24=24/5).',
        },
        {
          key: 'c',
          prompt:
            'Pärast 3 tundi kahest torust korraga basseini täites tuli toru B parandustöödeks sulgeda. Mitu tundi kulub nüüd sellest hetkest edasi, et bassein üksnes toru A abil lõpuni täita?',
          options: [
            { key: 'A', label: '5 tundi' },
            { key: 'B', label: '2,4 tundi' },
            { key: 'C', label: '1,8 tundi' },
            { key: 'D', label: '3 tundi' },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Näita oma arvutuskäiku:',
          maxPoints: 2,
          rationale:
            'Õige vastus: 3 tundi (3h koos täidab 5/8; puudu 3/8; toru A üksi 1/8/h ⟹ 3h).',
        },
      ],
    },
    {
      key: '3',
      title: 'Klassiruumi ümberkorraldamine',
      story:
        '8. klassis asendatakse senised kahekohalised koolipingid ühekohaliste õpilaslaudadega. Klassiruum on 8 m pikk ja 6 m lai, vasakus seinas on aknad, eesseinas tahvel ja õpetaja laud, parempoolse seina eesnurgas uks. Iga õpilase laud koos tooliga ja liikumisruumiga vajab vähemalt 1,5 m² vaba pinda, mis on ruudukujuline. Tahvli ja esimese pingirea vahele peab jääma vähemalt 2 m sügavune vaba ala (kogu ruumi laiuses). Ukse eest tagumise seinani peab jääma vaba evakuatsiooniriba laiusega 1 m (kogu ruumi pikkuses).',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Milline on klassiruumi kogupindala?',
          options: [
            { key: 'A', label: '56 m²' },
            { key: 'B', label: '14 m²' },
            { key: 'C', label: '48 m²' },
            { key: 'D', label: '28 m²' },
          ],
          correctChoice: 'C',
          maxPoints: 1,
          rationale: 'Õige vastus: 48 m² (8×6).',
        },
        {
          key: 'b',
          prompt:
            'Arvesta pindalast maha tahvlialune vaba ala ja evakuatsiooniriba. Mitu ruutmeetrit jääb laudade jaoks kasutada?',
          options: [
            { key: 'A', label: '40 m²' },
            { key: 'B', label: '36 m²' },
            { key: 'C', label: '30 m²' },
            { key: 'D', label: '28 m²' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Näita arvutuskäiku:',
          maxPoints: 2,
          rationale:
            'Õige vastus: 30 m² (48 − tahvlialune ala 2×6=12 − evakuatsiooniriba 1×6=6 = 30).',
        },
        {
          key: 'c',
          prompt:
            'Mitu õpilaslauda mahub maksimaalselt sellesse ruumi, kui igaüks vajab 1,5 m² ruudukujulist pindala? Kas see arv annaks ka tegelikkuses toimiva klassiruumi paigutuse?',
          options: [
            { key: 'A', label: '28 lauda' },
            { key: 'B', label: '14 lauda' },
            { key: 'C', label: '20 lauda' },
            { key: 'D', label: '18 lauda' },
          ],
          correctChoice: 'C',
          requiresExplanation: true,
          explanationPrompt: 'Selgita oma arvutuskäiku:',
          maxPoints: 2,
          rationale:
            'Õige vastus: 20 lauda (30÷1,5=20). Selgituses peab õpilane märkima, et tegelik paigutus sõltub ka rea/veeru kujust, käiguteedest laudade vahel, uksele/aknale ligipääsust jms — arvutus annab ülemise piiri, mitte garanteeritud paigutuse.',
        },
      ],
    },
    {
      key: '4',
      title: 'Kooli söökla statistika',
      story:
        'Kooli sööklas küsitleti 30 õpilast selle kohta, mitu eurot nad keskmiselt kulutavad koolinädalas lisaks tasuta lõunale. Vastused eurodes, suurusjärjekorras: 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 8, 8, 10, 12, 15.',
      subQuestions: [
        {
          key: 'a',
          prompt: 'Leia andmestiku aritmeetiline keskmine ja mediaan.',
          options: [
            { key: 'A', label: 'Keskmine 3,5 €, mediaan 4,3 €' },
            { key: 'B', label: 'Keskmine 4,3 €, mediaan 3,5 €' },
            { key: 'C', label: 'Keskmine 5,0 €, mediaan 3,0 €' },
            { key: 'D', label: 'Keskmine 4,3 €, mediaan 4,3 €' },
          ],
          correctChoice: 'B',
          maxPoints: 1,
          rationale: 'Õige vastus: Keskmine 4,3 €, mediaan 3,5 € (129/30=4,3; 15. ja 16. väärtuse keskmine (3+4)/2=3,5).',
        },
        {
          key: 'b',
          prompt:
            'Kumb näitaja — aritmeetiline keskmine või mediaan — kirjeldab sinu meelest õpilaste "tüüpilist" kulutust paremini?',
          options: [
            { key: 'A', label: 'Keskmine, sest see arvestab kõiki väärtusi' },
            { key: 'B', label: 'Kumbki ei sobi, kõige paremini sobiks hoopis mood' },
            { key: 'C', label: 'Mõlemad kirjeldavad võrdselt hästi' },
            { key: 'D', label: 'Mediaan, sest andmed jaotuvad ebaühtlaselt üksikute õpilaste oluliselt suuremate kulutuste tõttu' },
          ],
          correctChoice: 'D',
          requiresExplanation: true,
          explanationPrompt: 'Põhjenda:',
          maxPoints: 2,
          rationale:
            'Õige vastus: Mediaan, sest andmestik on kaldu — ei vasta normaaljaotusele (erandväärtused 10, 12, 15 nihutavad keskmist üles).',
        },
        {
          key: 'c',
          prompt: 'Sööklajuhataja väidab: "Enamik õpilasi kulutab nädalas lõunasöögile üle 4 euro." Kas see väide on andmete põhjal õige?',
          options: [
            { key: 'A', label: 'Õige — enamus õpilastest kulutab üle 4 euro' },
            { key: 'B', label: 'Vale — enamus õpilastest kulutab 4 eurot või vähem' },
            { key: 'C', label: 'Peaaegu õige — umbes pooled kulutavad üle 4 euro' },
            { key: 'D', label: 'Vale — mitte keegi ei kuluta üle 4 euro' },
          ],
          correctChoice: 'B',
          requiresExplanation: true,
          explanationPrompt: 'Selgita, kuidas jõudsid oma vastuseni:',
          maxPoints: 2,
          rationale: 'Õige vastus: Vale — üle 4 euro kulutab vaid 11 õpilast 30st, mis on vähemus.',
        },
      ],
    },
  ],
};
