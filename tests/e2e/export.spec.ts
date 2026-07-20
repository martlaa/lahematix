import { test, expect } from '@playwright/test';
import {
  prisma,
  createTeadurFixture,
  getAdminUser,
  cleanupFixtures,
} from './support/db';
import { postForm, redirectPath, loginAs } from './support/http';

// Kriitiline teekond 4: andmeeksport (vt arendusplaan Faas 7, p 8.2).
// Katab Faas 4 kõige omapärasema osa: kolm tundlikku andmestikku nõuavad
// admini kinnitust enne allalaadimist, teised on teadurile vabalt saadaval.
test.describe('Andmeeksport', () => {
  let teadur: { userId: string; email: string };

  test.beforeAll(async () => {
    teadur = await createTeadurFixture();
  });

  test.afterAll(async () => {
    await cleanupFixtures({ userIds: [teadur.userId] });
    await prisma.$disconnect();
  });

  test('gate-imata andmestiku (nõusolekud) saab teadur kohe alla laadida', async ({ request }) => {
    await loginAs(request, teadur.email, teadur.userId);

    const res = await request.get('/api/teadur/eksport/nousolekud');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/csv');
    const body = await res.text();
    expect(body.length).toBeGreaterThan(0);
  });

  test('tundlik andmestik (küsimustikud) nõuab admini kinnitust enne allalaadimist', async ({ request }) => {
    await loginAs(request, teadur.email, teadur.userId);

    // Ilma kinnituseta allalaadimine on keelatud.
    const blockedRes = await request.get('/api/teadur/eksport/kysimustikud');
    expect(blockedRes.status()).toBe(403);

    // Teadur esitab ekspordiloa taotluse.
    const requestRes = await postForm(request, '/api/teadur/eksport/taotle', { datasetKey: 'kysimustikud' });
    expect(requestRes.status()).toBe(303);
    expect(redirectPath(requestRes)).toBe('/teadur/eksport');

    const exportRequest = await prisma.exportRequest.findFirstOrThrow({
      where: { requestedByUserId: teadur.userId, datasetKey: 'kysimustikud' },
      orderBy: { requestedAt: 'desc' },
    });
    expect(exportRequest.status).toBe('PENDING');

    // Admin kinnitab taotluse.
    const admin = await getAdminUser();
    await loginAs(request, admin.email, admin.id);

    const decisionRes = await postForm(request, '/api/admin/eksporditaotlused/otsus', {
      requestId: exportRequest.id,
      decision: 'approve',
      note: 'E2E smoke test',
    });
    expect(decisionRes.status()).toBe(303);

    const approved = await prisma.exportRequest.findUniqueOrThrow({ where: { id: exportRequest.id } });
    expect(approved.status).toBe('APPROVED');
    expect(approved.decidedByUserId).toBe(admin.id);

    // Teadur saab nüüd alla laadida — ja taotlus läheb "täidetud" olekusse.
    await loginAs(request, teadur.email, teadur.userId);
    const downloadRes = await request.get('/api/teadur/eksport/kysimustikud');
    expect(downloadRes.status()).toBe(200);
    expect(downloadRes.headers()['content-type']).toContain('text/csv');

    const fulfilled = await prisma.exportRequest.findUniqueOrThrow({ where: { id: exportRequest.id } });
    expect(fulfilled.status).toBe('FULFILLED');
    expect(fulfilled.fulfilledAt).not.toBeNull();

    // Ja teistkordne allalaadimine ilma uue taotluseta on jälle keelatud.
    const secondAttemptRes = await request.get('/api/teadur/eksport/kysimustikud');
    expect(secondAttemptRes.status()).toBe(403);
  });
});
