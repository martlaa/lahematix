import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Kopeerib teaduri näidistunnikava tunniosad + õppevara/kodutöö õpetaja enda
// tunnikavasse. Kaitseb olemasoleva sisu üle kirjutamise eest — kui õpetaja on
// juba mõne tunniosa ise lisanud, tuleb kopeerimine enne blokeerida, mitte
// vaikimisi asendada.
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
  const sampleLessonPlanId = String(form.get('sampleLessonPlanId') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({
    where: { id: planEntryId },
    include: { lessonPlan: { include: { parts: true } } },
  });
  if (!entry || entry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  if (entry.lessonPlan && entry.lessonPlan.parts.length > 0) {
    return NextResponse.redirect(
      new URL(`/opetaja/tunnikava/${planEntryId}?error=copy_has_parts`, process.env.APP_BASE_URL || req.url),
      303,
    );
  }

  const sample = await prisma.sampleLessonPlan.findUnique({
    where: { id: sampleLessonPlanId },
    include: { parts: { orderBy: { order: 'asc' } } },
  });
  if (!sample || sample.hidden) {
    return NextResponse.json({ error: 'Näidistunnikava ei leitud' }, { status: 404 });
  }

  const lessonPlan = await prisma.lessonPlan.upsert({
    where: { researchPlanEntryId: planEntryId },
    update: {
      materialsJson: sample.materialsJson,
      homeworkText: sample.homeworkText,
      homeworkRelated: sample.homeworkRelated,
    },
    create: {
      researchPlanEntryId: planEntryId,
      materialsJson: sample.materialsJson,
      homeworkText: sample.homeworkText,
      homeworkRelated: sample.homeworkRelated,
    },
  });

  await prisma.lessonPlanPart.createMany({
    data: sample.parts.map((p) => ({
      lessonPlanId: lessonPlan.id,
      order: p.order,
      title: p.title,
      type: p.type,
      durationMin: p.durationMin,
      description: p.description,
    })),
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'COPY_SAMPLE_LESSON_PLAN',
      entity: 'LessonPlan',
      entityId: lessonPlan.id,
      meta: sampleLessonPlanId,
    },
  });

  return NextResponse.redirect(
    new URL(`/opetaja/tunnikava/${planEntryId}?copied=1`, process.env.APP_BASE_URL || req.url),
    303,
  );
}
