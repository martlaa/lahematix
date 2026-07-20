import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { CommentTiming } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const planEntryId = String(form.get('planEntryId') ?? '');
  const timing = String(form.get('timing') ?? '') as CommentTiming;
  const text = String(form.get('text') ?? '').trim();

  if (!['ENNE', 'JAREL'].includes(timing) || !text) {
    return NextResponse.json({ error: 'Kommentaar ei saa olla tühi' }, { status: 400 });
  }

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId } });
  if (!entry || entry.observerUserId !== session.userId) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  const lessonPlan = await prisma.lessonPlan.upsert({
    where: { researchPlanEntryId: planEntryId },
    update: {},
    create: { researchPlanEntryId: planEntryId },
  });

  await prisma.lessonPlanComment.create({
    data: {
      lessonPlanId: lessonPlan.id,
      authorUserId: session.userId,
      timing,
      text,
    },
  });

  return NextResponse.redirect(new URL(`/vaatlused/${planEntryId}`, process.env.APP_BASE_URL || req.url), 303);
}
