import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const roleRedirect: Record<string, string> = {
  ADMIN: '/admin',
  TEADUR: '/teadur',
  OPETAJA: '/opetaja',
  KOOLIJUHT: '/koolijuht/nousolek',
  LAPSEVANEM: '/lapsevanem',
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  const loginToken = await prisma.loginToken.findUnique({ where: { token }, include: { user: true } });

  if (
    !loginToken ||
    loginToken.usedAt ||
    loginToken.expiresAt < new Date() ||
    loginToken.user.status === 'DISABLED'
  ) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  await prisma.loginToken.update({ where: { id: loginToken.id }, data: { usedAt: new Date() } });

  const user = loginToken.user;
  if (user.status === 'INVITED') {
    await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.email = user.email;
  session.name = user.name;
  await session.save();

  return NextResponse.redirect(new URL(roleRedirect[user.role] ?? '/', req.url));
}
