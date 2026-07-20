import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { LessonPartType } from '@prisma/client';
import { MAX_PARTS, LESSON_PART_TYPE_OPTIONS } from '@/lib/lessonplan/types';

const VALID_TYPES = LESSON_PART_TYPE_OPTIONS.map((o) => o.value) as LessonPartType[];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: 'Õpetaja profiili ei leitud' }, { status: 404 });
  }

  const form = await req.formData();
  const planEntryId = String(form.get('planEntryId') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId } });
  if (!entry || entry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  const title = String(form.get('title') ?? '').trim();
  const type = String(form.get('type') ?? '') as LessonPartType;
  const durationMinRaw = String(form.get('durationMin') ?? '').trim();
  if (!title || !VALID_TYPES.includes(type) || !durationMinRaw) {
    return NextResponse.json({ error: 'Tunniosa nimetus, tüüp ja kestus on kohustuslikud' }, { status: 400 });
  }

  const lessonPlan = await prisma.lessonPlan.upsert({
    where: { researchPlanEntryId: planEntryId },
    update: {},
    create: { researchPlanEntryId: planEntryId },
    include: { parts: true },
  });

  if (lessonPlan.parts.length >= MAX_PARTS) {
    return NextResponse.redirect(
      new URL(`/opetaja/tunnikava/${planEntryId}?error=max_parts`, process.env.APP_BASE_URL || req.url),
      303,
    );
  }

  await prisma.lessonPlanPart.create({
    data: {
      lessonPlanId: lessonPlan.id,
      order: lessonPlan.parts.length + 1,
      title,
      type,
      durationMin: Number(durationMinRaw),
      description: String(form.get('description') ?? '').trim() || null,
      observerNote: String(form.get('observerNote') ?? '').trim() || null,
    },
  });

  return NextResponse.redirect(new URL(`/opetaja/tunnikava/${planEntryId}`, process.env.APP_BASE_URL || req.url), 303);
}
