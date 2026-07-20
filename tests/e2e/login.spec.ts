import { test, expect } from '@playwright/test';
import { getAdminUser, latestLoginToken } from './support/db';
import { postJson, postForm, followRedirect, redirectPath } from './support/http';

// Kriitiline teekond 1: magic-link sisselogimine (vt arendusplaan Faas 7, p 8.2).
// Voog on teadlikult kaheastmeline (link → kinnituslehele → "Kinnita
// sisselogimine" nupp), et e-posti turvasüsteemide (nt "Safe Links") automaatne
// lingiavamine ei tarbiks tokenit enne päris kasutaja klõpsu.
test.describe('Sisselogimine (magic link)', () => {
  test('kinnitusleht ei tarbi tokenit — ainult "Kinnita sisselogimine" POST teeb seda', async ({ request }) => {
    const admin = await getAdminUser();

    const loginRes = await postJson(request, '/api/auth/login', { email: admin.email });
    expect(loginRes.status(), await loginRes.text()).toBe(200);

    const token = await latestLoginToken(admin.id);

    // Simuleerime e-posti turvasüsteemi, mis linki automaatselt avab (GET,
    // korduvalt) — see EI TOHI tokenit ära tarbida.
    for (let i = 0; i < 3; i++) {
      const prefetchRes = await request.get(`/login/kinnita?token=${token.token}`);
      expect(prefetchRes.status()).toBe(200);
      const body = await prefetchRes.text();
      expect(body).toContain('Kinnita sisselogimine');
    }

    // Alles nüüd "klõpsab" päris kasutaja kinnitusnupul (POST) — see peab
    // endiselt õnnestuma, kuna eelnevad GET-id ei tarbinud tokenit.
    const verifyRes = await postForm(request, '/api/auth/verify', { token: token.token });
    expect(verifyRes.status()).toBe(303);
    expect(redirectPath(verifyRes)).toBe('/admin');

    const dashboardRes = await followRedirect(request, verifyRes);
    expect(dashboardRes.status()).toBe(200);
    const dashboardBody = await dashboardRes.text();
    expect(dashboardBody).toContain('Koolide ja kasutajate haldus');

    // Ja korduskinnitamine (nt teine klõps samal lingil) ebaõnnestub nüüd,
    // kuna token on juba tarbitud.
    const secondAttemptRes = await postForm(request, '/api/auth/verify', { token: token.token });
    expect(redirectPath(secondAttemptRes)).toBe('/login?error=invalid_token');
  });

  test('tundmatu e-posti aadressiga sisselogimine ebaõnnestub selge veaga', async ({ request }) => {
    const res = await postJson(request, '/api/auth/login', {
      email: 'ei-ole-olemas@test.lahematix.local',
    });
    expect(res.status()).toBe(401);
  });

  test('aegunud/vale tokeniga kinnitamine suunab tagasi login-lehele veaga', async ({ request }) => {
    const invalidPageRes = await request.get('/login/kinnita?token=see-ei-ole-kehtiv-token');
    expect(invalidPageRes.status()).toBe(200);
    expect(await invalidPageRes.text()).toContain('Link on aegunud, juba kasutatud või vale');

    const verifyRes = await postForm(request, '/api/auth/verify', { token: 'see-ei-ole-kehtiv-token' });
    expect(verifyRes.status()).toBe(303);
    expect(redirectPath(verifyRes)).toBe('/login?error=invalid_token');
  });
});
