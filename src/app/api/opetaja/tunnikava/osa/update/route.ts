import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { LessonPartType } from '@prisma/client';
import { LESSON_PART_TYPE_OPTIONS } from '@/lib/lessonplan/types';

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
  const id = String(form.get('id') ?? '');

  const part = await prisma.lessonPlanPart.findUnique({
    where: { id },
    include: { lessonPlan: { include: { researchPlanEntry: true } } },
  });
  if (!part || part.lessonPlan.researchPlanEntry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Tunniosa ei leitud' }, { status: 404 });
  }

  const title = String(form.get(`title.${id}`) ?? '').trim();
  const type = String(form.get(`type.${id}`) ?? '') as LessonPartType;
  const durationMinRaw = String(form.get(`durationMin.${id}`) ?? '').trim();
  if (!title || !VALID_TYPES.includes(type) || !durationMinRaw) {
    return NextResponse.json({ error: 'Tunniosa nimetus, tüüp ja kestus on kohustuslikud' }, { status: 400 });
  }

  await prisma.lessonPlanPart.update({
    where: { id },
    data: {
      title,
      type,
      durationMin: Number(durationMinRaw),
      description: String(form.get(`description.${id}`) ?? '').trim() || null,
      observerNote: String(form.get(`observerNote.${id}`) ?? '').trim() || null,
    },
  });

  return NextResponse.redirect(
    new URL(`/opetaja/tunnikava/${part.lessonPlan.researchPlanEntryId}`, req.url),
    303,
  );
}
