import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';

// AJUTINE AUTENTIMISKIHT (Faas 1) — asendatakse Faasis 5 HarID SAML-liidesega.
// Sessioon ise (iron-session, signeeritud küpsis) jääb samaks ka pärast
// HarID lisamist; muutub ainult see, KUIDAS kasutaja identiteet enne
// sessiooni loomist kinnitatakse.

export interface SessionData {
  userId?: string;
  role?: 'ADMIN' | 'TEADUR' | 'OPETAJA' | 'KOOLIJUHT' | 'LAPSEVANEM';
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
