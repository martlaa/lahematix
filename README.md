# LAHEMATIX — Faas 1–3 (autentimine, andmekogumine, tunnikavad ja vaatlusprotokoll)

See on LAHEMATE projekti uuringurakenduse lähtekood. Valmis on **Faas 1–3**:
koolide/kasutajate haldus ja kõik neli nõusolekuvormi (Faas 1); õpilase ja õpetaja
küsimustikud, matemaatilise probleemilahenduse testid koos hindamisega, uurijapäevik
ja õpetaja isiklik uuringukava (Faas 2); struktureeritud tunnikavad, sellest
dünaamiliselt genereeritud tunnivaatlusprotokoll, tunnivaatluste broneerimise turg,
teaduri näidistunnikavad ja instrumentide katsetuskeskkond (Faas 3). Täpne kava ja
järgmised faasid (andmeeksport, avalik tunnikavade galerii, tootmisvalmidus) on
dokumendis `LAHEMATIX_arendusnouded_ja_plaan-4.md`.

**Autentimine (versioon 3):** HarID/MobiilID/SmartID-st loobuti kolleegide soovitusel —
sisselogimine käib e-posti-põhise ühekordse lingiga (magic link, kehtib 15 min, vt
`src/app/api/auth/login/route.ts` ja `src/app/api/auth/verify/route.ts`). See on
rakenduse püsiv, mitte ajutine lahendus.

---

## 1. Kiire start täna (kohalikus arvutis, ilma Dockerita)

Vajad: [Node.js](https://nodejs.org) (versioon 20+) ja kas [Docker](https://www.docker.com/products/docker-desktop/)
**või** kohalikult paigaldatud PostgreSQL.

```bash
# 1. Paki lahti ja mine kausta
cd lahematix

# 2. Paigalda sõltuvused
npm install

# 3. Loo .env fail näidise põhjal
cp .env.example .env
# Ava .env ja muuda vähemalt SESSION_SECRET (vt fail, seal on juhis).
# SMTP väljad võid esialgu tühjaks/valeks jätta — kutsete saatmine
# lihtsalt ebaõnnestub vaikselt (logisse tuleb viga), aga rakendus töötab.

# 4a. KUI Sul on Docker: käivita ainult andmebaas
docker compose up -d db

# 4b. KUI Sul EI OLE Dockerit: paigalda PostgreSQL kohapeal ja
#     muuda .env failis DATABASE_URL vastavaks.

# 5. Loo andmebaasi tabelid
npx prisma migrate dev --name init

# 6. Loo esimene admin-kasutaja
npm run seed

# 7. Käivita rakendus
npm run dev
```

Ava brauseris **http://localhost:3000** — see suunab sind `/login` lehele.
Logi sisse e-postiga `admin@lahemate.ee` (see luuakse seed-skriptiga).

### Mida saad täna kohe katsetada
1. Admin-kontoga (`admin@lahemate.ee`): loo kool, kutsu õpetaja ja koolijuht (kasuta
   oma pärisemaile, kui tahad ka e-kirja saatmist katsetada — vajab .env SMTP seadeid).
2. Logi kutsutud õpetaja e-postiga sisse → täida "Minu nõusolek" → lisa õpilasi
   (proovi nii alla-15 kui 15+ õpilast).
3. Alla-15 õpilase lisamisel saadetakse lapsevanemale kutse — logi selle e-postiga
   sisse ja täida lapsevanema nõusolek.
4. 15+ õpilase jaoks kuvatakse õpilaste nimekirjas otse link — ava see link uues
   privaatses aknas (ilma sisselogimiseta) ja täida õpilase enda nõusolek.
5. Koolijuhi e-postiga sisse logides näed kooli nõusolekuvormi.
6. Kutsu ka teadur ja vaata `/teadur` alt jälgimisvaadet.

---

## 2. Esmaspäeval/teisipäeval — üleminek VPS-ile

### 2.1. VPS-ile (lahemate.ee) paigaldamine
```bash
# VPS-is (SSH kaudu):
git clone <sinu-repo-url> lahematix   # või laadi failid muul moel üles
cd lahematix
cp .env.example .env
# Täida .env päris SMTP ja SESSION_SECRET väärtustega

docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed
```
Selle järel jookseb rakendus pordil 3000 — vajad veel Nginx reverse proxy't ja
Let's Encrypt SSL-sertifikaati domeeni jaoks (nt `lahematix.lahemate.ee`). Sellega
saan Sind aidata järgmises Claude Code sessioonis, kui VPS ligipääs on olemas.

Autentimine (e-posti-põhine magic link) on juba püsiv lahendus — HarID-integratsiooni
enam ei plaanita (vt `LAHEMATIX_arendusnouded_ja_plaan-4.md`).

---

## 3. Projekti struktuur

```
prisma/schema.prisma       — andmemudel: Faas 1 (User, School, Teacher, Student,
                              ConsentRecord, InviteToken, AuditLog) + Faas 2
                              (QuestionnaireResponse, TestSubmission/Photo/Grading,
                              JournalEntry, ResearchPlanEntry) + Faas 3 (LessonPlan/
                              Part, LessonPlanComment, ObservationProtocol,
                              SampleLessonPlan/Part, InstrumentTrial)
prisma/seed.ts              — loob esimese admin-kasutaja
src/lib/session.ts          — sessioonihaldus (iron-session)
src/app/api/auth/login/     — magic-link väljastamine (e-posti saatmine)
src/app/api/auth/verify/    — magic-link kontroll ja sessiooni loomine
src/lib/prisma.ts           — andmebaasiühenduse singleton
src/lib/mail.ts             — e-kirjade saatmine (zone.ee SMTP)
src/lib/pseudonym.ts        — õpilaste pseudonüümikoodide genereerimine
src/lib/questionnaires/     — Lisa 4 (eel/järel) ja Lisa 8 sisu (hardcoded)
src/lib/tests/              — matemaatilise probleemilahenduse testid (3 vanuseastet)
src/lib/journal/            — Lisa 7 (uurijapäeviku) sisu
src/lib/lessonplan/         — tunniosa tüübid, õppevara valikud (Lisa 11)
src/lib/observation/        — Lisa 6 (vaatlusprotokolli) tunnused/domeenid
src/components/             — jagatud UI komponendid (sh QuestionnaireForm, TestForm,
                              JournalForm — taaskasutatavad ka teaduri instrumentide
                              katsetuskeskkonnas)
src/app/
  admin/                    — koolide/kasutajate haldus
  teadur/                   — jälgimisvaade, näidistunnikavad, instrumentide
                              katsetuskeskkond
  koolijuht/nousolek/       — Lisa 1
  opetaja/                  — töölaud, nousolek/ (Lisa 2), opilased/ (nimekiri, CSV
                              import), uuringukava/ (Lisa 10), tunnikava/ (Lisa 11),
                              paevik/ (Lisa 7), kysimustik/ (Lisa 8), vaatlusprotokoll/
  lapsevanem/                — töölaud, nousolek/[studentId]/ (Lisa 3)
  opilane/nousolek/[token]/  — Lisa 3b, kysimustik/[token]/, test/[token]/ — kõik
                              ilma sisselogimiseta (token-URL)
  vaatlused/                 — tunnivaatluste broneerimise turg + protokolli täitmine
  api/                       — kõik vastavad API route'id
```

## 4. Mis on veel PUUDU (Faas 4+, ei ole selles versioonis)
- Andmeeksport (pseudonümiseeritud CSV/Excel iga instrumendi kohta) ja andmete
  elutsükli haldus (tegelik kustutamine pärast nõusoleku tagasivõtmist)
- Näidistunnikavade avalik galerii/repositoorium (praegu nähtavad ainult sobiva
  vanuseastme/teema/meetodiga õpetajatele)
- Tootmisvalmidus: VPS-ile üleminek, päris SMTP seadistus, WCAG kiirülevaatus

Need on kirjeldatud dokumendis `LAHEMATIX_arendusnouded_ja_plaan-4.md` (Faasid 4–6).
Faasid 1–3 (autentimine, andmekogumine, tunnikavad/vaatlusprotokoll/teaduri
tööriistad) on valmis.

## 5. Kui midagi ei tööta
Kõige tõenäolisemad probleemid:
- **"Can't reach database"** — kontrolli, et `docker compose up -d db` jookseb ja
  `.env` failis DATABASE_URL klapib docker-compose.yml seadetega.
- **E-kirjad ei saadeta** — kontrolli SMTP andmeid `.env` failis; rakendus töötab
  ka ilma (viga läheb ainult serveri logisse).
- **"SESSION_SECRET is not defined"** — kontrolli, et `.env` fail on olemas
  (mitte ainult `.env.example`) ja SESSION_SECRET on täidetud.
