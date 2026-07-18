import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';

// Sessioonihaldus (iron-session, signeeritud küpsis) — versioon 3: HarID-st
// loobuti, e-posti-põhine autentimine (magic link, vt api/auth/login ja
// api/auth/verify) on nüüd püsiv lahendus, mitte ajutine vahevariant.

// Koolijuht (versioon 5) ja lapsevanem (versioon 4) ei kasuta enam sessiooni —
// mõlemad pääsevad ligi ainult token-URL kaudu, vt InviteToken.
export interface SessionData {
  userId?: string;
  role?: 'ADMIN' | 'TEADUR' | 'OPETAJA';
  email?: string;
  name?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'lahematix_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 tundi
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Viska viga, kui kasutaja pole sisse loginud või tal pole õiget rolli. */
export async function requireRole(...allowedRoles: SessionData['role'][]) {
  const session = await getSession();
  if (!session.userId || !session.role) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }
  return session;
}
