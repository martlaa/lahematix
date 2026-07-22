import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task || task.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Ülesannet ei leitud' }, { status: 404 });
  }

  await prisma.task.update({ where: { id: task.id }, data: { hidden: true } });

  const redirectTo = session.role === 'TEADUR' ? '/teadur/ulesanded' : '/opetaja/ulesanded';
  return NextResponse.redirect(new URL(redirectTo, process.env.APP_BASE_URL || req.url), 303);
}
