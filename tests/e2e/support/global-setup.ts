// Turvakontroll: need testid loovad ja kustutavad päris andmebaasi kirjeid
// (koolid, kasutajad, õpilased). Enne ühegi testi käivitamist kontrollime,
// et DATABASE_URL/APP_BASE_URL viitavad kindlalt kohalikule DDEV keskkonnale,
// mitte kogemata tootmisele — vt arendusplaani Faas 7 punkt 8.6.
export default function globalSetup() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  const appBaseUrl = process.env.APP_BASE_URL ?? '';

  const looksLikeDdevDb = dbUrl.includes('@db:5432/db');
  const looksLikeDdevApp = appBaseUrl.includes('ddev.site');

  if (!looksLikeDdevDb || !looksLikeDdevApp) {
    throw new Error(
      'E2E testid keelduvad käivitumast: DATABASE_URL/APP_BASE_URL ei näe välja nagu kohalik DDEV keskkond.\n' +
        `  DATABASE_URL=${dbUrl.replace(/:[^:@]*@/, ':***@')}\n` +
        `  APP_BASE_URL=${appBaseUrl}\n` +
        'Need testid loovad ja kustutavad päris andmebaasi kirjeid — käivita need AINULT ' +
        'kohaliku DDEV keskkonna vastu ("ddev exec npm run test:e2e"), mitte kunagi tootmise vastu.',
    );
  }
}
