import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const id = String(form.get('id') ?? '');

  const plan = await prisma.sampleLessonPlan.findUnique({ where: { id } });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }

  await prisma.sampleLessonPlan.update({ where: { id }, data: { hidden: true } });

  return NextResponse.redirect(new URL('/teadur/naidistunnikavad', req.url), 303);
}
