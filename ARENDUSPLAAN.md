# LAHEMATIX — arendusnõuded ja arendusplaan

*Koostatud LAHEMATE projekti uuringurakenduse kontseptsiooni ja andmekogumisinstrumentide (Lisa 1–11) põhjal. Versioon 6 — kajastab 2026-07-22 kuni 2026-07-24 vahemikus tehtud ad-hoc arendustööd: tunnivaatlusprotokolli (Lisa 6) ja uurijapäeviku (Lisa 7) teoreetiline raamistik vahetati mõlemad CLASS/Danielson-põhiselt TRU (Teaching for Robust Understanding) raamistikule; lisandus täiesti uus moodul — avalik ülesannete pank; avalik galerii sai mitu täiendust (ülesannete lingid, hindamine, ametlik CC-BY märgis); tunnikavade koostamisel sai võimalikuks tundide järjestikuseks sidumine, tunniosade ümberjärjestamine ja mitme õppematerjali/ülesande lisamine. Dokument vastab ka küsimusele, kas ja millises faasis peaks tegema jõudlustestid ja korraliku dokumentatsiooni (vt uus Faas 8, punkt 11).*

---

## 1. Kokkuvõte ja mis muutus versioonis 6

Versioon 5 (2026-07-20) kirjeldas Faas 1–6 kui valminud ja Faas 7 (tootmise stabiliseerimine) kui pooleli. Sellest ajast on toimunud kaks tüüpi muutust:

**A. Tagasiside-põhine funktsionaalsuse laiendamine (peamiselt Faas 3 ja Faas 5 sees, vt täpsemalt punktid 9–10).** Katsetavate õpetajate ja teadurite tagasiside põhjal lisandus rida täiendusi olemasolevatele moodulitele:

1. **Tunnivaatlusprotokoll (Lisa 6) ja uurijapäevik (Lisa 7) said mõlemad TRU raamistiku.** Tunnivaatlusprotokoll oli juba varem CLASS/Danielson raamistikult TRU-le üle viidud (vt versioon 5, punkt 8.3 taustaks); nüüd sai sama muudatuse ka õpetaja enda uurijapäevik — mõlemad kasutavad nüüd täpselt samu 11 väidet 6 dimensioonis (matemaatiline sisukus, kognitiivne nõudlikkus, võrdne juurdepääs, agentsus/omanikutunne, kujundav tagasiside, meetodi truudus), mis võimaldab õpetaja enda ja vaatleja hinnanguid väite tasemel otse võrrelda. Lisaks jagati tunnivaatlusprotokoll kaheks: ajatempliga intsidentide logi iga tunniosa kohta (varem tuli 11 tunnust hinnata iga tunniosa kohta eraldi, mis oli vaatlejale liiga koormav) ja üks struktureeritud TRU hinnang kogu tunnile, täidetav tunni lõpus.
2. **Uus moodul: ülesannete pank** (`/ulesanded`) — avalik, tunnikavade galeriiga sarnane jagatud ülesannete/töölehtede kogu. Nii õpetajad kui teadurid saavad lisada ülesandeid kas välislingina või üleslaetud failina (docx/jpg/pdf, kuni 50 MB), millel on populaarsuse näitajad (allalaadimiste arv, taaskasutus tunnikavades, kasutajate 1–5 hinnang) ja mis integreerub otse tunnikava koostamise õppematerjalide sektsiooniga.
3. **Avalik galerii sai mitu täiendust:** lisatud ülesanded kuvatakse nüüd ka galerii detailvaates; tunniosade arvu veerg asendati tunni kestusega; lisandus tunnikavade/näidistunnikavade 1–5 hindamine sisseloginud kasutajatele; käsitsi joonistatud CC-BY märk asendati Creative Commonsi ametliku SVG-badge'iga.
4. **Tunnikavade koostamisel:** õpetaja (ja teadur näidistunni puhul) saab nüüd tunnikavu järjestikku siduda (eelmine/järgmine tund, koos vaataja-poolse navigatsiooniga), tunniosi ümber järjestada (▲/▼ nupud — teadlikult mitte lohistamisega, kuna rakendusel pole klient-JS-i), näidistunnikava sisu oma tunnikavasse kopeerida, ja igat tüüpi õppematerjali/ülesannet lisada mitu (varem ainult üks link tüübi kohta).

**B. Üks tootmisintsident, mis avastati ja parandati sama päeva jooksul** — vt punkt 8.9. Õppetund on dokumenteeritud, kuna see kordab sama mustrit, mis 8.1/8.2 all: sisu kuju muutmine ilma olemasoleva andmestiku ühilduvust arvestamata.

**Faaside numeratsioon ei muutu** — kõik ülalkirjeldatu mahub olemasolevate Faas 3 (tunnikavad/vaatlusprotokoll/uurijapäevik) ja Faas 5 (avalik galerii, nüüd + ülesannete pank) raamesse, vt täpsustatud kirjeldused punktides 9–10. Lisandub uus **Faas 8**, mis vastab otse küsimusele jõudlustestide ja dokumentatsiooni kohta (punkt 11).

---

## 2. Otsused — täiendus versioonile 5

Versioonide 3–5 otsuste tabelid kehtivad muutumatult. Selle nädala arenduste käigus lisandusid järgmised otsused:

| # | Teema | Otsus |
|---|---|---|
| 24 | Tunnivaatlusprotokolli struktuur | Lahutatud kaheks: (1) ajatempliga intsidentide/sündmuste logi *iga tunniosa kohta*, kus seotud konstrukt valitakse fikseeritud menüüst (mitte vaba tekst); (2) üks struktureeritud TRU 1–4 hinnang *kogu tunnile*, täidetav tunni lõpus. Varasem "hinda kõiki 11 tunnust iga tunniosa kohta" mudel osutus vaatlejale liiga koormavaks. |
| 25 | Uurijapäeviku raamistik | Sama TRU struktuur mis tunnivaatlusprotokollil (6 dimensiooni, 11 väidet), aga esimeses isikus (õpetaja enesehinnang) ja 1–5 skaalal (vaatlusprotokoll kasutab 1–4). Vana CLASS-põhine 4-domeeniline struktuur (9 väidet, 1 pööratud) on täielikult asendatud — olemasolevad vanad sissekanded jäävad andmebaasi, aga pole enam uue definitsiooni all nähtavad/muudetavad, kuna tegu on sisulise instrumendivahetusega, mitte ümbersõnastusega. |
| 26 | Ülesannete panga autorlus | Nii õpetajad kui teadurid saavad ülesandeid lisada — ühine ressurss, analoogselt sellele, kuidas galeriis on koos nii õpetajate katsetunnid kui teadurite näidistunnid. |
| 27 | Ülesannete panga failipiirang | Üleslaetavad failid (docx/jpg/pdf) kuni 50 MB. Ülesannete panga sisu on kas fail VÕI väline link (GDocs/OneDrive) VÕI mõlemad — vähemalt üks kohustuslik. |
| 28 | Näidistunnikavade avalikustamine (opt-in laiendus) | Teaduri näidistunnikavad said sama eksplitsiitse "Avalikusta galeriis" opt-in-i, mis õpetaja tunnikavadel juba oli (otsus #20) — varem olid näidistunnikavad automaatselt galeriis nähtavad, kui polnud peidetud. **Tähelepanek edaspidiseks:** selline muudatus mõjutab tagasiulatuvalt olemasolevat, juba avaldatud sisu (see läks korraks galeriist "kaduma", kuni autor selle uuesti eksplitsiitselt avalikustas) — järgmise sarnase muudatuse puhul tuleks kasutajaid ette hoiatada, mitte lasta neil ise probleemi avastada. |
| 29 | Õppematerjalide paljusus | Iga õppevara tüübi (slaidid, töölehed, ülesanded, õpik, Kahoot, muu) kohta saab lisada kuni 4 kirjet ühe asemel; tühjaks jäetud kirje + salvestamine eemaldab selle (zero-JS arhitektuuris lihtsaim toimiv muster, analoogne intsidentide logi fikseeritud-ridade mustriga). |
| 30 | CC-BY märgis | Käsitsi joonistatud platsholder asendati Creative Commonsi enda ametliku SVG-failiga (`mirrors.creativecommons.org`), salvestatuna kohapeal (`public/cc-by.svg`), mitte välise teenuse otselingina — hoiab lehe iseseisvana välisest kättesaadavusest. |
| 31 | Tunnikavade/näidistunnikavade hindamine | Lisaks ülesannete panga hindamisele said ka tunnikavad/näidistunnikavad ise galeriis 1–5 hinnangu (uus, algselt küsimata funktsionaalsus, lisati kasutaja selgel soovil pärast ülesannete panga hindamise nägemist). |

---

## 3. Kasutajarollid ja autentimine

Muutumatu versioonidest 3–5. Kõik kuus rolli (Admin, Teadur, Õpetaja-uurija, Õpilane, Lapsevanem, Koolijuht) kasutavad kirjeldatud autentimisviise ja see töötab tootmises täpselt nii, nagu kavandatud:

- **Admin, Teadur, Õpetaja-uurija:** kontoga kasutajad, sisse magic-link e-kirjaga (`LoginToken`, 15 min kehtivusaeg, ühekordne).
- **Õpilane, Lapsevanem, Koolijuht:** kontovaba ligipääs ühekordse token-URL-i kaudu (`InviteToken`) — koolijuhil ja lapsevanemal pole eraldi `User` kirjet, ainult vastavalt `School` ja `Student` mudeli väljad (nimi/e-post).

---

## 4. Faaside plaan — praegune seis

| Faas | Sisu | Staatus |
|---|---|---|
| 1 | Autentimine + nõusolekud | **Valmis** |
| 2 | Andmekogumismoodul (küsimustikud, test, uurijapäevik, uuringukava) | **Valmis** — uurijapäevik sai 2026-07-24 uue TRU raamistiku, vt punkt 9 |
| 3 | Tunnikavad, vaatlusprotokoll, teaduri tööriistad | **Valmis, oluliselt laiendatud** 2026-07-21 kuni 2026-07-24 — tunnikavade jada, ümberjärjestamine, näidise kopeerimine, mitme õppematerjali tugi, vaatlusprotokolli TRU-restruktuur, vt punkt 9 |
| 4 | Andmeeksport ja elutsükli haldus | **Valmis** |
| 5 | Tunnikavade avalik galerii | **Valmis, oluliselt laiendatud** 2026-07-22 kuni 2026-07-24 — ülesannete pank, näidistundide avalikustamise workflow, galerii hindamine, ametlik CC-BY märgis, vt punkt 10 |
| 6 | Tootmisvalmidus ja lihv | **Valmis** (2026-07-20) |
| 7 | Tootmise stabiliseerimine, testimine, turvalisuse tõstmine | **Osaliselt valmis** — vt punkt 8; 8.9 lisandus uue tootmisintsidendina |
| 8 (uus) | Ettevalmistus 2027 põhipiloodiks: jõudlustestid ja dokumentatsioon | **Kavandamisel** — vt punkt 11 |

Faas 1–3 sisu kirjeldus (autentimine, nõusolekud, küsimustikud, test, uurijapäevik, tunnikavad, vaatlusprotokoll, tunnivaatluste broneerimise turg, teaduri näidistunnikavad ja instrumentide katsetuskeskkond) jääb muutumatuks versioonidest 3–5 — vt vajadusel varasemat versiooni täpsete algkirjelduste jaoks; käesolevas versioonis on Faas 3 ja Faas 5 laiendused kirjeldatud eraldi punktides 9–10.

---

## 5. Faas 4 — andmeeksport ja elutsükli haldus (VALMIS)

Muutumatu versioonist 5. Ehitatud tervikuna, sh:

- **Pseudonümiseeritud CSV/XLSX eksport** kümne andmestiku kaupa (nõusolekud, mõlemad küsimustikud, testitulemused + hindamised, uurijapäevik, uuringukava/tunnikavad, vaatlusprotokollid) — teaduri töölaualt, `exceljs` põhjal.
- **Ekspordilubade kinnitusvoog:** kolm tundlikumat andmestikku nõuavad admini eraldi kinnitust iga ekspordikorra kohta (`ExportRequest`, otsus #17).
- **Andmete kustutamise voog:** admin saab identifitseerivad väljad (nimi, e-post) jäädavalt kustutada nõusoleku tagasi võtnud kasutajatelt/õpilastelt (`identityDeletedAt`, otsus #18).
- **Rakenduse sulgemise voog:** pööratav sulgemine/taasavamine (`AppSettings`, otsus #19), blokeerib mitte-admin sisselogimise selge veateatega.
- Kõik toimingud logitakse `AuditLog`-i.

---

## 6. Faas 5 — tunnikavade avalik galerii (VALMIS, oluliselt laiendatud — vt ka punkt 10)

Baasosa (muutumatu versioonist 5):

- Õpetaja märgib uuringukava tabelis opt-in linnukesega, kas tema tunnikava tohib galeriisse jõuda (`publishedToGalleryAt`).
- Avalik galerii (`/galerii`) filtri/sorteerimisega, ilma sisselogimiseta nähtav.
- Iga tunnikava detailvaates (`/galerii/[type]/[id]`) selge **CC BY 4.0** litsentsimärge.
- DOCX-eksport (`docx` npm-teek) iga tunnikava allalaadimiseks.

2026-07-22 kuni 2026-07-24 lisandunud täienduste (ülesannete pank, näidistundide avalikustamise workflow, galerii hindamine, ametlik CC-BY märgis) täpne kirjeldus on koondatud punkti 10, et mitte segi ajada algset "valmis" kirjeldust hilisemate laiendustega.

---

## 7. Faas 6 — tootmisvalmidus ja lihv (VALMIS)

Muutumatu versioonist 5.

### Juba tehtud

- **VPS-ile üleminek** — Hetzner Cloud VPS, Docker Compose (`docker-compose.prod.yml`: db/migrate/app/caddy), Caddy automaatse Let's Encrypt HTTPS-iga (`deploy/Caddyfile`, domeen `uuring.lahemate.ee`), automaatne deploy GitHub Actionsi kaudu push'il `production` harru (`.github/workflows/deploy.yml`, SSH + `deploy/deploy.sh`). Serveri esmaseadistus dokumenteeritud (`deploy/bootstrap.sh`, `deploy/README.md`).
- **DDEV kohalik arenduskeskkond** — Postgres 16 + Node 22 konteinerites, dokumenteeritud README-s.
- **SMTP tootmises** — kasutaja ja kolleegide katsetuste põhjal (2026-07-20) töötab SMTP tootmises (uuring.lahemate.ee) korrektselt, sisselogimis- ja kutse-e-kirjad jõuavad kohale.
- **Turva-enesekontroll, koondav läbivaatus** (2026-07-20) — käidi läbi kõik API-marsruudid (`src/app/api/**/route.ts`) ja kontrolliti kahte asja igas: (1) kas rolli/sessiooni kontroll on olemas, (2) kas ressursi omandiõigust kontrollitakse (nt kas `studentId`/`planEntryId`/`schoolId` kuulub tõesti sisseloginud kasutajale, mitte lihtsalt "on OPETAJA/TEADUR roll"). Tulemus: kõik marsruudid olid korrektselt piiritletud. Ainsad leitud puudused (kasutajate loendamise võimalus `/api/auth/login`-is, rate limiting puudumine) olid juba dokumenteeritud Faas 7-s.
- **WCAG 2.1 AA kiirülevaatus** (2026-07-20) — läbi vaadatud jagatud komponendid ja tüüpilised lehed; parandatud `StatusDot` juurdepääsetavus (`aria-label`) ja ebapiisav tekstikontrast (`text-slate-400` → `text-slate-500`, 19 failis).

Faas 6 on täies mahus valmis.

---

## 8. Faas 7 — tootmise stabiliseerimine, testimine ja turvalisuse tõstmine (osaliselt VALMIS)

### 8.1 Node'i versioonilahknevus — LAHENDATUD (kolleegi poolt, 2026-07-20)

Tootmise `Dockerfile` kasutas alusimagena `node:20-alpine`, aga `nanoid@6` (sisselogimis- ja kutselinkides) nõuab Node `^22 || ^24 || >=26`. Kolleeg (Priit Tammets) parandas selle iseseisvalt commit'iga `c4aac00`, enne kui jõudsime seda ise ette võtta. Samas ajas parandati ka eraldi bugi: server jooksis UTC ajavööndis, mistõttu kuupäevad/kellaajad kuvati 2–3h Eesti ajast maas — lisatud `TZ=Europe/Tallinn` ja `tzdata` (commit `4907623`).

### 8.2 Magic-link sisselogimine sai kaheastmeliseks — LAHENDATUD (2026-07-20, päris tootmisintsident)

Reaalne kasutaja (ülikooli e-posti aadressiga teadur) ei saanud tootmises sisse logida — iga sisselogimislink näitas kohe "aegunud" viga. Juurpõhjus: `/api/auth/verify` tarbis tokeni juba pelga GET-päringu peale, ja ülikooli e-posti turvasüsteem ("Safe Links") külastas linki automaatselt enne kasutaja klõpsu, tarbides tokeni ära tema eest. Parandus: sisselogimislink viib nüüd kinnituslehele (`/login/kinnita`), mis ainult loeb tokeni olekut; tegelik tarbimine toimub alles "Kinnita sisselogimine" nupu POST-päringuga.

### 8.3 Automatiseeritud testid — ESIMENE SUITSUTESTIDE KOMPLEKT VALMIS (2026-07-20)

Playwright, API-testimise režiimis (`request` fixture, ilma brauserita — rakendusel pole klient-JS-i). Testid asuvad `tests/e2e/`-is, jooksevad `ddev exec npm run test:e2e` käsuga. Kaetud: sisselogimine, nõusoleku andmine/tagasivõtmine, küsimustiku ja testi täitmine, andmeekspordi kinnitusvoog tervikuna. Turvapiirang: testid keelduvad käivitumast, kui `DATABASE_URL`/`APP_BASE_URL` ei näe välja nagu kohalik DDEV keskkond.

**Jäänud edaspidiseks:** täielik katvus (tunnikavad, vaatlusprotokoll, näidistunnikavad, instrumentide katsetuskeskkond, ülesannete pank, admini voog) ja CI-integratsioon.

### 8.4 Turvalisus — konkreetsed leiud

- **Rate limiting puudub täielikult** — nii `/api/auth/login` kui kutse-/nõusolekulingi saatvad marsruudid. `/api/auth/login` reedab ka, kas e-post on süsteemis olemas — korraga kasutajate loendamise ja SMTP-ülekoormamise risk. Soovitus: lihtne IP-/e-posti-põhine piirmäär (nt 5 katset / 15 min).
- **`zod` on `package.json`-is kirjas, aga kasutamata** — kogu sisendvalideerimine on käsitsi tehtud. Kaaluda kas `zod` päriselt kasutusele võtta või sõltuvusest loobuda.
- **CSRF-kaitse tugineb ainult `sameSite: 'lax'` küpsisele** — praktikas piisav (pole klient-JS-i, kõik vormid on tavalised POST-id), aga väärib teadlikku dokumenteerimist otsusena.

### 8.5 Varundus — hetkel ainult käsitsi, dokumenteeritud, aga automatiseerimata

`deploy/README.md` kirjeldab varundamist ühe näidiskäsuna, aga see pole cron'i kaudu automaatne, katab ainult andmebaasi (mitte `uploads` Docker-mahtu — nt ülesannete panga failid, testifotod), ja pole kirjeldatud, kuhu varukoopiad serverist väljapoole kopeeritakse. Soovitus: automatiseeritud öine cron-töö, mis varundab nii andmebaasi kui `uploads`-mahu väljapoole serverit.

### 8.6 Monitooring ja intsidentide tuvastamine — puudub

Pole viiteid veajälgimis- ega monitooringulahendusele. Soovitus: lihtne `/api/health` marsruut (DB-ühenduse kontroll) välise uptime-teenuse jaoks, ja e-kirja saatmise vigade reaalajas märkamise viis.

### 8.7 Migratsioonide turvalisus tootmises

`prisma migrate deploy` käivitub automaatselt iga `production`-harru merge'i peale, ilma eraldi staging-keskkonna või kinnitussammuta. Suuremate andmemudeli muudatuste korral tasuks kaaluda staging-testimist või migratsiooni SQL-i käsitsi ülevaatust enne push'i.

### 8.8 Mahuhinnang (Faas 7)

| Alampunkt | Staatus | Orienteeruv maht |
|---|---|---|
| Node 22 Dockerfile'i parandus | ✅ Valmis (kolleeg, 2026-07-20) | (tehtud) |
| Magic-link kaheastmeliseks (Safe Links kaitse) | ✅ Valmis (2026-07-20) | (tehtud) |
| Suitsutestide komplekt (kriitilised teekonnad) | ✅ Valmis (2026-07-20) | (tehtud) |
| WCAG 2.1 AA kiirülevaatus | ✅ Valmis | (tehtud) |
| Turva koondläbivaatus | ✅ Valmis | (tehtud) |
| Galerii 500-vea hotfix (vt 8.9) | ✅ Valmis (2026-07-24) | (tehtud) |
| Rate limiting (login + kutsed) | Kavandamisel | ~3–4 h |
| Automatiseeritud varundus (DB + uploads, väljapoole serverit) | Kavandamisel | ~3–5 h |
| Tervisekontrolli marsruut + väline uptime-jälgimine | Kavandamisel | ~2–3 h |
| **Kokku jäänud** | | **~8–12 h** |

### 8.9 Tootmisintsident: galerii 500-viga vana kujuga andmetel — LAHENDATUD (2026-07-24, päris tootmisintsident)

Pärast õppematerjalide mitme-kirje toe (otsus #29) tootmisesse viimist hakkas ainus tol hetkel avalikustatud tunnikava anonüümsele külastajale 500 viga andma. Juurpõhjus: enne seda muudatust salvestati `materialsJson` väli kujul `{ [tüüp]: string }` (üks väärtus tüübi kohta); uus renderdusloogika eeldas kuju `{ [tüüp]: string[] }` ja kutsus vanadel string-väärtustel `.join()`, mis viskas runtime vea. Parandus: tagasiühilduv `parseMaterials()` parser, mis loeb korrektselt nii vana kui uut kuju, rakendatud kõigis kuues kohas, kus seda välja loetakse. Parandus jõudis tootmisesse sama päeva jooksul, kui viga avastati.

**Õppetund (kordub 8.1/8.2 mustriga):** sisu *kuju* muutmine (mitte ainult uue funktsionaalsuse lisamine) on riskantsem kui esmapilgul tundub, kuna olemasolev andmestik tootmises ei uuene automaatselt uue koodiga kaasa. Enne sarnaseid muudatusi tuleks kaaluda: (a) kas tootmises on juba päris andmeid selles kujus, ja kui on, (b) kas lugemiskood peab olema tagasiühilduv, mitte eeldama ainult uut kuju. See kehtib ka otsuse #28 (näidistundide avalikustamise opt-in) kohta — seal oli tegu käitumusliku, mitte krahhiga lõppeva ühildumatusega, aga sama põhimõttega.

---

## 9. Faas 3 laiendused (2026-07-21 kuni 2026-07-24): tunnikavade jada, ümberjärjestamine, näidise kopeerimine, TRU raamistiku ülekandmine

Katsetavate õpetajate ja teadurite tagasiside põhjal lisandus olemasolevale tunnikava/vaatlusprotokolli/uurijapäeviku moodulile:

- **Tunnikavade jada** — õpetaja (ja teadur näidistunni puhul) saab märkida, et üks tunnikava jätkab otseselt tema enda varasemat tundi (`previousLessonPlanId`/`previousSampleLessonPlanId`, ühesuunaline lingitud nimekiri koos tsükli-kaitsega). Tunnikava vaatajad (õpetaja, vaatleja, galerii külastaja) näevad eelmise/järgmise tunni navigatsioonilinke.
- **Tunniosade ümberjärjestamine** — ▲/▼ nupud tunnikava koostamise tabelis (teadlikult mitte lohistamisega, kuna rakendus on teadlikult ehitatud ilma klient-JS-ita).
- **Näidistunnikava kopeerimine** — kui õpetaja on sisestanud klassi/teema/kestuse/meetodi, pakub rakendus sobivaid näidistunnikavu (sama vanuseaste + kattuv meetod või teema); õpetaja saab ühe klõpsuga kopeerida näidistunni tunniosad ja õppevara oma tunnikavasse ning seejärel koopiat kohandada.
- **Mitme õppematerjali/ülesande tugi** — igat tüüpi õppevara (slaidid, töölehed, ülesanded, õpik, Kahoot, muu) saab lisada kuni 4 kirjet ühe asemel (vt otsus #29).
- **Tunnivaatlusprotokolli restruktuur** (vt otsus #24) — ajatempliga intsidentide logi tunniosa kohta (konstrukti valik fikseeritud menüüst, mitte vaba tekst) + üks TRU 1–4 hinnang kogu tunnile tunni lõpus. Kasutaja tagasisidel suurendati ka "Mis juhtus" (3 rida) ja "Märkus/tõendus" (2× laiem/kõrgem) tekstiväljasid, et pikema teksti kirjutamine oleks mugavam.
- **Uurijapäevik TRU-le** (vt otsus #25) — sama 6 dimensiooni/11 väidet mis vaatlusprotokollil, esimeses isikus, 1–5 skaalal; Rolfe (What/So what/Now what) refleksiooni struktuur säilis, abiküsimuste sõnastus täpsustus.
- **"Checkpoint" → "Tunniosa"** — eestikeelse termini järjepidevuse parandus tunnivaatlusprotokollis.

Kõik ülaltoodu on testitud DDEV-is päriselt (loomine, salvestamine, taasavamine, galerii kuvamine) ja production'is deploy'itud ilma regressioonideta, v.a punktis 8.9 kirjeldatud tootmisintsident.

---

## 10. Faas 5 laiendused (2026-07-22 kuni 2026-07-24): ülesannete pank, näidistundide avalikustamine, galerii täiendused

### Uus moodul: ülesannete pank (`/ulesanded`)

Katsetavate õpetajate soovil lisandus tunnikavade galeriiga paralleelne, struktuurilt sarnane avalik moodul:

- **Andmemudel:** `Task` (pealkiri, kooliaste, teema, meetod, krediteeritav autor, kas link või fail), `TaskUsage`/`SampleTaskUsage` (taaskasutus vastavalt õpetaja tunnikavas ja teaduri näidistunnikavas — eraldi mudelid, kuna tegu on kahe erineva Prisma mudeliga, aga populaarsuse näitaja loeb mõlemad kokku), `TaskRating` (1–5 hinnang, üks kasutaja kohta).
- **Lisamine:** nii õpetajad kui teadurid (otsus #26); sisu kas väline link (GDocs/OneDrive) või üleslaetud fail (docx/jpg/pdf, kuni 50 MB, otsus #27) — salvestatakse privaatsesse `uploads/task-bank/` kausta ja serveeritakse vahendatud, loendava route'i kaudu (mitte otse `public/` alt).
- **Avalik nimekiri ja detailvaade:** filter/sort, populaarsuse näitajad (allalaadimiste arv, taaskasutus tunnikavades, keskmine hinnang), hindamisvõimalus sisseloginud õpetaja-uurija/teaduri kontoga.
- **Integratsioon tunnikava koostamisega:** mõlemal tunnikava koostamise lehel (õpetaja ja teadur) kuvatakse sobivad ülesanded (vanuseaste/meetod/teema järgi) koos lisamise/eemaldamise võimalusega; lisatud ülesanded kuvatakse ka galerii detailvaate "Ülesanded/probleemid" real (see integratsioon jäi esialgu esimeses versioonis kogemata puudu ja parandati eraldi tähelepanekuna).
- **Navigatsioon:** "Ülesannete pank" lisati ülamenüüsse ja galerii lehele nupuna; mõlemal rollil on töölaual "Minu ülesanded" kaart.

### Näidistundide avalikustamise workflow

Teaduri näidistunnikavad said sama eksplitsiitse "Avalikusta galeriis" opt-in-i, mis õpetaja tunnikavadel juba oli (otsus #28), koos ühe-klõpsulise "Võta tagasi" nupuga "Minu näidistunnikavad" nimekirjas. **See mõjutas tagasiulatuvalt olemasolevat sisu** — juba avaldatud näidistunnikavad kadusid korraks galeriist, kuni autor need uuesti eksplitsiitselt avalikustas; kasutajale selgitati see põhjus ja lahendus otse.

### Galerii täiendused

- Galerii navigatsioon (eelmine/järgmine tund) laienes ka näidistundide jadale (varem töötas ainult katsetundidel).
- Tunniosade arvu veerg nimekirjas asendati tunni kestusega (kasutaja tagasisidel — tunniosade arv oli kasutajale ebaoluline info).
- Lisandus tunnikavade/näidistunnikavade 1–5 hindamine (`LessonPlanRating`/`SampleLessonPlanRating`) — sisseloginud õpetaja-uurija/teaduri kontoga, nii nimekirjas ("Hinnang" veerg, sorteeritav) kui detailvaates (hindamisvorm + keskmine).
- Käsitsi joonistatud CC-BY märk (ring + "cc"/"BY" tekst) asendati Creative Commonsi enda ametliku SVG-badge'iga (allalaaditud `mirrors.creativecommons.org`-ist, salvestatud kohapeal `public/cc-by.svg`, mitte välise teenuse otselingina).

Kõik ülaltoodu testitud DDEV-is ja deploy'itud production'isse; punktis 8.9 kirjeldatud tootmisintsident tekkis just õppematerjalide mitme-kirje toe (mis mõjutab ka galerii kuvamist) tootmisesse viimisel ja on nüüd lahendatud.

---

## 11. Faas 8 (uus): ettevalmistus 2027 põhipiloodiks — jõudlustestid ja dokumentatsioon

Otsene vastus küsimusele, kas ja millises faasis peaks tegema jõudlustestid ja korraliku dokumentatsiooni.

### 11.1 Jõudlustestid — soovitus: jah, aga alles vahetult enne 2027 põhipiloodi mahu kasvu, mitte praegu

Praegu on rakendust kasutamas üksikud katsetavad õpetajad/teadurid — jõudlusprobleeme pole ilmnenud ega ole ka oodata sellises mahus. Küll aga kasvab 2027 põhipiloodiga osalejate arv tõenäoliselt kümnetest õpetajatest ja sadadest õpilastest — ja mitu osa rakendusest on sellisel skaalal reaalne jõudlusrisk, mida praeguse üksiku Hetzner VPS-i (Faas 6) juures pole kunagi testitud:

- **Samaaegne testi/küsimustiku täitmine** — kui terve klass (25–30 õpilast) täidab testi/küsimustikku samal tunnil samal ajal token-lingi kaudu, on see kõige tõenäolisem "burst"-koormuse stsenaarium (matemaatikatundides, mis toimuvad samal koolipäeval eri koolides paralleelselt).
- **Andmeekspordi päringud** — CSV/XLSX genereerimine liidab mitut tabelit (Student/Teacher/ConsentRecord/QuestionnaireResponse/TestSubmission jne); praegusel väikesel andmemahul on see kiire, aga päringu aeg kasvab piloodi andmemahuga.
- **Failide üleslaadimine** — ülesannete panga (kuni 50 MB) ja testifotode üleslaadimised koormavad nii kettaruumi kui võrku ühel väikesel VPS-il, kui neid tehakse samaaegselt paljude kasutajate poolt.

**Soovitus:** lisada Faas 8-sse lihtne, sihitud koormustest (nt `k6` või `autocannon`) täpselt nende kolme stsenaariumi jaoks, tehtuna paar nädalat enne 2027 põhipiloodi käivitumist (mitte praegu — praegune mahtusk oleks põhjendamatu, kuna reaalset koormust pole veel oodata). Tulemuste põhjal otsustada, kas praegune VPS-suurus on piisav või vajab piloodi ajaks ajutist vertikaalset skaleerimist.

*Orienteeruv maht: ~4–6 h (testistsenaariumide kirjutamine + käivitamine + tulemuste analüüs).*

### 11.2 Dokumentatsioon — soovitus: jah, kahes osas

Praegu on tehniline dokumentatsioon (README.md, `deploy/README.md`) heas seisus arendaja jaoks, aga puudub:

1. **Arhitektuuri/andmemudeli lühikokkuvõte** — kasulik uue kaastöölise (nt kolleeg Priit Tammets, kes juba iseseisvalt commit'e teeb) sisseelamiseks ja projekti järjepidevuseks pärast praegust arendusperioodi. Suurem osa sellest saab tuletada juba olemasolevatest Prisma skeemi kommentaaridest — vaja on ainult lühike, käsitsi kirjutatud ülevaatedokument, mis seob need kokku.
2. **Rollipõhised kiirjuhendid** (õpetaja-uurija, teadur) — rakenduse enda vormidel on head kontekstuaalsed vihjed, aga puudub "kogu minu teekond algusest lõpuni" ülevaade ühel lehel, mis aitaks mitte-tehnilisi osalevaid õpetajaid kiiremini sisse elada 2027 piloodi käivitudes. Sobib PDF-ina või lihtsa abilehena rakenduse sees.

Projekti laiem "käsiraamat" (uurimismetoodika, mitte rakenduse kasutusjuhend) on juba eraldi kavandatud projekti deliverable'ina väljaspool LAHEMATIX-i enda arendustsüklit — need kaks ei kattu ja mõlemat on vaja.

*Orienteeruv maht: ~6–10 h (arhitektuuriülevaade ~2–3 h, kaks rollipõhist kiirjuhendit ~4–7 h).*

### 11.3 Mahuhinnang

| Alampunkt | Staatus | Orienteeruv maht |
|---|---|---|
| Koormustestid (test/küsimustiku burst, eksport, failiüleslaadimine) | Kavandamisel — teha paar nädalat enne 2027 põhipiloodi | ~4–6 h |
| Arhitektuuri/andmemudeli ülevaatedokument | Kavandamisel | ~2–3 h |
| Rollipõhised kiirjuhendid (õpetaja-uurija, teadur) | Kavandamisel | ~4–7 h |
| **Kokku** | | **~10–16 h** |

---

## 12. Tootmiskeskkonna audit — kontrollitud faktid

Muutumatu versioonist 5 baasfaktide osas:

- `https://uuring.lahemate.ee/` vastab HTTP 200-ga (kontrollitud `curl`-iga, korduvalt, ka pärast iga selle nädala deploy'i).
- `docker-compose.prod.yml`, `deploy/Caddyfile`, `deploy/bootstrap.sh`, `deploy/deploy.sh`, `.github/workflows/deploy.yml` ja `origin/production` haru on kõik repos olemas ja sisult kooskõlas.
- `zod` on sõltuvusena kirjas, aga kasutuseta (endiselt).
- Ühtegi rate-limiting- ega monitooringulahendust ei leitud (endiselt).
- Varundus on dokumenteeritud ainult käsitsi käivitatava näidiskäsuna, mitte automatiseeritult (endiselt).

Täiendus käesolevas versioonis:

- Kõik selles versioonis kirjeldatud uued funktsioonid (ülesannete pank, TRU-restruktuurid, galerii täiendused, tunnikavade jada/kopeerimine/ümberjärjestamine) on kontrollitud otse production'is (`https://uuring.lahemate.ee`) pärast iga deploy'i — vastavad marsruudid/staatilised failid annavad oodatud vastuseid.
- Üks tootmisintsident (punkt 8.9) tekkis ja lahendati sama päeva jooksul; production'i andmebaas ei kaotanud andmeid, ainult renderdus oli ajutiselt katki ühel lehel.

---

## 13. Mahuhinnang — kokkuvõte

| Faas | Staatus | Orienteeruv töömaht |
|---|---|---|
| 1 — autentimine + nõusolekud | Valmis | (tehtud) |
| 2 — andmekogumismoodul | Valmis (uurijapäevik TRU-le 2026-07-24) | (tehtud) |
| 3 — tunnikavad, vaatlusprotokoll, teaduri tööriistad | Valmis, oluliselt laiendatud | (tehtud) |
| 4 — andmeeksport ja elutsükli haldus | Valmis | (tehtud) |
| 5 — tunnikavade avalik galerii + ülesannete pank | Valmis, oluliselt laiendatud | (tehtud) |
| 6 — tootmisvalmidus ja lihv | Valmis | (tehtud) |
| 7 — tootmise stabiliseerimine, testimine, turvalisus | Osaliselt valmis | ~8–12 h jäänud (vt punkt 8.8) |
| 8 (uus) — ettevalmistus 2027 põhipiloodiks: jõudlustestid ja dokumentatsioon | Kavandamisel | ~10–16 h (vt punkt 11.3) |

---

## 14. Turvamärkused — täiendus versioonile 5

Versiooni 4/5 punktis kirjeldatud `InstrumentTrial`-i eraldatus päris uuringuandmestikust kehtib muutumatult. Samuti kehtivad muutumatult varasemad leiud: rate limiting puudub, kasutajate loendamise risk `/api/auth/login`-is, kasutamata `zod`, CSRF-kaitse tugineb ainult `sameSite`-küpsisele (vt punkt 8.4). Need on dokumenteeritud teadlike, kaalutud riskidena praeguses etapis, aga vajavad otsust enne uuringu suuremahulisemat kasutuselevõttu.

Lisandus käesolevas versioonis:

- **Sisu kuju muutmise risk (vt punkt 8.9):** kui olemasoleva JSON-välja (nt `materialsJson`, `ratingsJson`, `answersJson`) sisemist kuju muudetakse, tuleb enne production'isse viimist alati kontrollida, kas seal on juba päris andmeid vanas kujus, ja kui on, kirjutada lugemiskood tagasiühilduvaks. Sama kehtib nähtavuse/opt-in loogika muutmisel (vt otsus #28) — kasutajaid tuleks ette hoiatada, kui muudatus mõjutab juba avaldatud/nähtavat sisu tagasiulatuvalt.
