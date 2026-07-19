import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { LessonPartType } from '@prisma/client';
import { MAX_PARTS, LESSON_PART_TYPE_OPTIONS } from '@/lib/lessonplan/types';

const VALID_TYPES = LESSON_PART_TYPE_OPTIONS.map((o) => o.value) as LessonPartType[];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const sampleLessonPlanId = String(form.get('sampleLessonPlanId') ?? '');

  const plan = await prisma.sampleLessonPlan.findUnique({
    where: { id: sampleLessonPlanId },
    include: { parts: true },
  });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }

  const title = String(form.get('title') ?? '').trim();
  const type = String(form.get('type') ?? '') as LessonPartType;
  const durationMinRaw = String(form.get('durationMin') ?? '').trim();
  if (!title || !VALID_TYPES.includes(type) || !durationMinRaw) {
    return NextResponse.json({ error: 'Tunniosa nimetus, tüüp ja kestus on kohustuslikud' }, { status: 400 });
  }

  if (plan.parts.length >= MAX_PARTS) {
    return NextResponse.redirect(
      new URL(`/teadur/naidistunnikavad/${sampleLessonPlanId}?error=max_parts`, req.url),
      303,
    );
  }

  await prisma.sampleLessonPlanPart.create({
    data: {
      sampleLessonPlanId,
      order: plan.parts.length + 1,
      title,
      type,
      durationMin: Number(durationMinRaw),
      description: String(form.get('description') ?? '').trim() || null,
    },
  });

  return NextResponse.redirect(new URL(`/teadur/naidistunnikavad/${sampleLessonPlanId}`, req.url), 303);
}
