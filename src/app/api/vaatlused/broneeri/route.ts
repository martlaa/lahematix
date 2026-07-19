import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const planEntryId = String(form.get('planEntryId') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({
    where: { id: planEntryId },
    include: { teacher: true },
  });
  if (!entry || entry.hidden || !entry.expectingObserver) {
    return NextResponse.json({ error: 'Vaatluse pakkumist ei leitud' }, { status: 404 });
  }
  if (entry.teacher.userId === session.userId) {
    return NextResponse.json({ error: 'Ei saa end broneerida enda tunni vaatlejaks' }, { status: 400 });
  }
  if (entry.observerUserId) {
    return NextResponse.json({ error: 'Sellele tunnile on vaatleja juba broneeritud' }, { status: 409 });
  }

  await prisma.researchPlanEntry.update({
    where: { id: planEntryId },
    data: { observerUserId: session.userId },
  });

  return NextResponse.redirect(new URL('/vaatlused', req.url), 303);
}
