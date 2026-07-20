import { defineConfig } from '@playwright/test';

// Smoke-testide seadistus (Faas 7, punkt 8.2). Rakendusel pole klient-JS-i,
// seega ei ole vaja brauserit — kõik testid kasutavad Playwrighti `request`
// (APIRequestContext) fixture't, mis teeb samu HTTP päringuid, mida teeks
// brauser tavalise <form> POST-i saates. See väldib Chromiumi paigaldamise
// vajadust DDEV konteineris.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // jagatud arendusandmebaas — testid ei tohi teineteist segada
  workers: 1,
  retries: 0,
  reporter: 'list',
  globalSetup: './tests/e2e/support/global-setup.ts',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
  },
});
