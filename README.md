# LAHEMATIX

LAHEMATIX on LAHEMATE uurimisprojekti veebirakendus matemaatilise probleemilahenduse
õpetamise sekkumisuuringu andmete kogumiseks: nõusolekud, küsimustikud, testid,
tunnikavad, tunnivaatlused ja uurijapäevikud ühes kohas — õpilastele, õpetajatele-
uurijatele, koolijuhtidele, lapsevanematele, teaduritele ja projekti adminile.

Rakendus on ehitatud [Next.js](https://nextjs.org) (App Router), [PostgreSQL](https://www.postgresql.org)
ja [Prisma](https://www.prisma.io) peale ning töötab ilma kliendipoolse JavaScriptita —
kõik vormid ja tegevused käivad tavaliste HTML-vormide ja serveripoolsete
marsruutidena.

## Praegune seis

Valmis on Faasid 1–5:

| Faas | Sisu |
|---|---|
| 1 | Autentimine (e-posti-põhine ühekordne link) ning koolide/kasutajate/nõusolekute haldus |
| 2 | Õpilase ja õpetaja küsimustikud, matemaatilise probleemilahenduse testid (koos hindamisega), uurijapäevik, õpetaja isiklik uuringukava |
| 3 | Struktureeritud tunnikavad, sellest dünaamiliselt genereeritud tunnivaatlusprotokoll, tunnivaatluste broneerimise turg, teaduri näidistunnikavad ja instrumentide katsetuskeskkond |
| 4 | Pseudonümiseeritud andmete eksport (CSV/XLSX), ekspordilubade kinnitamine, andmete kustutamisvoog ja rakenduse sulgemisvoog |
| 5 | Avalik tunnikavade galerii (CC BY 4.0), filtreeritav/sorteeritav, koos DOCX-eksportiga |

Pooleli on Faas 6 — tootmisvalmidus (VPS-ile paigaldamine, päris SMTP, WCAG
kiirülevaatus). Vt allpool jaotist ["Tootmisse viimine"](#tootmisse-viimine).

## Kasutajarollid

| Roll | Autentimine | Peamised tegevused |
|---|---|---|
| Admin | E-post (ühekordne link) | Koolide/kasutajate haldus, ekspordilubade kinnitamine, andmete kustutamine, rakenduse sulgemine |
| Teadur | E-post (ühekordne link) | Nõusolekute jälgimine, näidistunnikavad, instrumentide katsetamine, andmete eksport, tunnivaatlused |
| Õpetaja-uurija | E-post (ühekordne link) | Nõusolek, õpilaste nimekiri, uuringukava, tunnikavad, uurijapäevik, küsimustik |
| Õpilane | Ühekordne token-link, ilma kontota | Nõusolek (15+), test, küsimustik |
| Lapsevanem | E-post (ühekordne link) | Nõusoleku andmine/tagasivõtmine lapse eest |
| Koolijuht | Ühekordne token-link, ilma kontota | Kooli nõusolek |
| Külaline (ilma kontota) | — | Avalik tunnikavade galerii (`/galerii`) |

## Kiire start (kohalik arendus)

Vajad: [Node.js](https://nodejs.org) 20+ ja kas [Docker](https://www.docker.com/products/docker-desktop/)
või kohalikult paigaldatud PostgreSQL 16.

```bash
git clone git@github.com:martlaa/lahematix.git
cd lahematix

npm install

cp .env.example .env
# Ava .env ja täida vähemalt SESSION_SECRET (vt fail — genereeri nt
# `openssl rand -base64 32`). SMTP väljad võib esialgu tühjaks jätta:
# kutsete saatmine ebaõnnestub vaikimisi ainult logisse kirjutades ja
# sisselogimislingid ilmuvad arenduses konsooli (vt allpool).

docker compose up -d db        # KUI kasutad Dockerit
# muidu: paigalda PostgreSQL ise ja muuda .env failis DATABASE_URL

npx prisma migrate deploy
npm run seed                   # loob admin@lahemate.ee kasutaja

npm run dev
```

Ava brauseris **http://localhost:3000** — sisselogimata külastajale kuvatakse
avalik tunnikavade galerii; sisseloginud kasutaja suunatakse oma rolli töölauale.

Logi esimesena sisse admin-kontoga (`admin@lahemate.ee`). Kuna SMTP pole veel
seadistatud, ei jõua sisselogimislink e-posti — see ilmub `npm run dev`
terminaliaknasse reana `[DEV] Sisselogimislink kasutajale ...`. Kopeeri link
brauserisse.

Admin-kontolt saab luua kooli, kutsuda õpetajaid/teadureid ning jälgida kogu
uuringu seisu.

## Keskkonnamuutujad

Vt `.env.example` täieliku loeteluga koos selgitustega. Kokkuvõtvalt:

| Muutuja | Kirjeldus |
|---|---|
| `DATABASE_URL` | PostgreSQL ühendusstring |
| `SESSION_SECRET` | Sessiooni krüpteerimisvõti (iron-session) — vähemalt 32 tähemärki |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | E-posti saatmise seaded (kutsed, sisselogimislingid) |
| `APP_BASE_URL` | Rakenduse avalik aadress — kasutatakse linkide genereerimisel |

## Projekti struktuur

```
prisma/schema.prisma        andmemudel (kõik Faas 1–5 mudelid)
prisma/migrations/          migratsioonid (rakenda: npx prisma migrate deploy)
prisma/seed.ts              loob esimese admin-kasutaja

src/lib/
  session.ts                 sessioonihaldus (iron-session)
  prisma.ts                  andmebaasiühenduse singleton
  mail.ts                    e-kirjade saatmine (SMTP)
  pseudonym.ts                õpilaste/õpetajate pseudonüümikoodide genereerimine
  appSettings.ts               rakenduse sulgemise/avamise olek
  gallery.ts, galleryDocx.ts    avaliku galerii andmed ja DOCX-genereerimine
  export/                      teaduri andmeekspordi CSV/XLSX loogika
  questionnaires/, tests/, journal/, lessonplan/, observation/
                                — küsimustike/testide/päeviku/tunnikavade/
                                  vaatlusprotokolli sisu (hardcoded, Lisa 4–11)

src/components/               jagatud UI-komponendid (vormirenderdajad jm)

src/app/
  admin/                      koolide/kasutajate haldus, ekspordilubade
                              kinnitamine, andmete kustutamine, sulgemisvoog
  teadur/                     jälgimisvaade, näidistunnikavad, instrumentide
                              katsetuskeskkond, andmete eksport
  opetaja/                    töölaud, nõusolek, õpilaste nimekiri (Lisa 2/CSV),
                              uuringukava (Lisa 10), tunnikava (Lisa 11),
                              päevik (Lisa 7), küsimustik (Lisa 8)
  koolijuht/, lapsevanem/, opilane/
                              token-põhised (enamik ilma kontota) vaated
  vaatlused/                  tunnivaatluste broneerimise turg + protokoll
  galerii/                    avalik tunnikavade galerii (ilma kontota)
  api/                        kõik vastavad API-marsruudid
```

## Tootmisse viimine

Rakendus on konteineritud (`Dockerfile`, `docker-compose.yml`):

```bash
# Serveris:
git clone git@github.com:martlaa/lahematix.git
cd lahematix
cp .env.example .env
# täida .env päris SESSION_SECRET, SMTP ja APP_BASE_URL väärtustega

docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed
```

Rakendus jookseb seejärel pordil 3000. Tootmises on lisaks vaja:

- **Reverse proxy + SSL** — nt Nginx koos Let's Encrypt sertifikaadiga domeeni jaoks.
- **Päris SMTP seaded** — ilma nendeta ei jõua sisselogimislingid ega kutsed kasutajateni.
- **Andmebaasi varundus** — `db_data` Docker-köite regulaarne backup.

## Tõrkeotsing

- **"Can't reach database"** — kontrolli, et `docker compose up -d db` jookseb ja
  `.env` failis `DATABASE_URL` klapib `docker-compose.yml` seadetega.
- **E-kirju ei saadeta** — kontrolli SMTP andmeid `.env` failis. Kohalikus
  arenduses töötab rakendus ka ilma — sisselogimislingid/kutsed ilmuvad
  serveri logisse (`[DEV] ...`), viga ise ei takista kasutamist.
- **"SESSION_SECRET is not defined"** — kontrolli, et `.env` fail on olemas
  (mitte ainult `.env.example`) ja `SESSION_SECRET` on täidetud.

## Litsents

Lähtekood on avaldatud MIT litsentsi all (vt `LICENSE`). Avalikus tunnikavade
galeriis (`/galerii`) avaldatud tunnikavade sisu käib eraldi CC BY 4.0
litsentsi all — vt iga tunnikava detailvaadet.
