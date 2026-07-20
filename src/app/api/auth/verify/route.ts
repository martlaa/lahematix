import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isAppClosed } from '@/lib/appSettings';

// Lapsevanem (versioon 4) ja koolijuht (versioon 5) ei kasuta seda voogu — vt
// /lapsevanem/nousolek/[token] ja /koolijuht/nousolek/[token].
const ACCOUNT_ROLES = ['ADMIN', 'TEADUR', 'OPETAJA'] as const;
type AccountRole = (typeof ACCOUNT_ROLES)[number];

const roleRedirect: Record<AccountRole, string> = {
  ADMIN: '/admin',
  TEADUR: '/teadur',
  OPETAJA: '/opetaja',
};

function isAccountRole(role: string): role is AccountRole {
  return (ACCOUNT_ROLES as readonly string[]).includes(role);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', process.env.APP_BASE_URL || req.url));
  }

  const loginToken = await prisma.loginToken.findUnique({ where: { token }, include: { user: true } });

  if (
    !loginToken ||
    loginToken.usedAt ||
    loginToken.expiresAt < new Date() ||
    loginToken.user.status === 'DISABLED'
  ) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', process.env.APP_BASE_URL || req.url));
  }

  await prisma.loginToken.update({ where: { id: loginToken.id }, data: { usedAt: new Date() } });

  const user = loginToken.user;
  if (!isAccountRole(user.role)) {
    // Vanad KOOLIJUHT/LAPSEVANEM kasutajad (enne versiooni 4/5) ei tohi enam sisse logida.
    return NextResponse.redirect(new URL('/login?error=invalid_token', process.env.APP_BASE_URL || req.url));
  }
  if (user.role !== 'ADMIN' && (await isAppClosed())) {
    return NextResponse.redirect(new URL('/login?error=app_closed', process.env.APP_BASE_URL || req.url));
  }

  if (user.status === 'INVITED') {
    await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.email = user.email;
  session.name = user.name;
  await session.save();

  return NextResponse.redirect(new URL(roleRedirect[user.role] ?? '/', process.env.APP_BASE_URL || req.url));
}
