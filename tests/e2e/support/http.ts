import type { APIRequestContext, APIResponse } from '@playwright/test';
import { latestLoginToken } from './db';

// Rakendusel pole klient-JS-i — iga vorm on tavaline HTML <form method="post">,
// mis vastab 303-ga täisurl'ile (process.env.APP_BASE_URL, nt
// https://lahematix.ddev.site:3000/...). Testid jooksevad konteineri sees
// http://localhost:3000 vastu, seega ei jälgi me Playwrighti automaatset
// suunamist (host erineb) — loeme Location-päisest ise tee välja ja
// jätkame oma baseURL-i suhtes.
export function redirectPath(res: APIResponse): string {
  const location = res.headers()['location'];
  if (!location) {
    throw new Error(`Vastuses puudub Location-päis (staatus ${res.status()})`);
  }
  const url = new URL(location, 'http://localhost:3000');
  return url.pathname + url.search;
}

export async function postForm(
  request: APIRequestContext,
  path: string,
  fields: Record<string, string>,
): Promise<APIResponse> {
  const form: Record<string, string> = { ...fields };
  return request.post(path, { form, maxRedirects: 0 });
}

export async function postJson(
  request: APIRequestContext,
  path: string,
  body: unknown,
): Promise<APIResponse> {
  return request.post(path, { data: body, maxRedirects: 0 });
}

export async function followRedirect(request: APIRequestContext, res: APIResponse): Promise<APIResponse> {
  return request.get(redirectPath(res), { maxRedirects: 0 });
}

// Magic-link sisselogimine on kaheastmeline (vt /login/kinnita ja
// /api/auth/verify): esimene GET (kinnituslehele) ei tarbi tokenit, ainult
// selgesõnaline POST teeb seda — nii ei saa e-posti turvasüsteemide
// automaatne lingiavamine tokenit ise ära tarbida.
export async function loginAs(request: APIRequestContext, email: string, userId: string): Promise<void> {
  const loginRes = await postJson(request, '/api/auth/login', { email });
  if (loginRes.status() !== 200) {
    throw new Error(`Sisselogimise algatamine ebaõnnestus (${loginRes.status()}): ${await loginRes.text()}`);
  }
  const token = await latestLoginToken(userId);
  const verifyRes = await postForm(request, '/api/auth/verify', { token: token.token });
  if (verifyRes.status() !== 303) {
    throw new Error(`Sisselogimise kinnitamine ebaõnnestus (${verifyRes.status()})`);
  }
}
