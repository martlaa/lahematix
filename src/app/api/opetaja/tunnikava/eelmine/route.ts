import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Kontrollib, et valitud "eelmine tund" ei tekitaks tsüklit (nt A -> B -> A) —
// kõnnib kandidaadi enda "eelmine" ahelat tagasi ja veendub, et see ei jõua
// kunagi tagasi praeguse tunnikavani.
async function wouldCreateCycle(currentLessonPlanId: string, candidateId: string): Promise<boolean> {
  let cursor: string | null = candidateId;
  for (let i = 0; i < 200 && cursor; i++) {
    if (cursor === currentLessonPlanId) return true;
    const plan: { previousLessonPlanId: string | null } | null = await prisma.lessonPlan.findUnique({
      where: { id: cursor },
      select: { previousLessonPlanId: true },
    });
    cursor = plan?.previousLessonPlanId ?? null;
  }
  return false;
}

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
  const previousLessonPlanId = String(form.get('previousLessonPlanId') ?? '').trim() || null;

  const entry = await prisma.researchPlanEntry.findUnique({
    where: { id: planEntryId },
    include: { lessonPlan: true },
  });
  if (!entry || entry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  if (previousLessonPlanId) {
    const candidate = await prisma.lessonPlan.findUnique({
      where: { id: previousLessonPlanId },
      include: { researchPlanEntry: true },
    });
    if (!candidate || candidate.researchPlanEntry.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Valitud tunnikava ei leitud' }, { status: 400 });
    }
    if (entry.lessonPlan && candidate.id === entry.lessonPlan.id) {
      return NextResponse.json({ error: 'Tund ei saa olla iseenda eelmine tund' }, { status: 400 });
    }
    if (entry.lessonPlan && (await wouldCreateCycle(entry.lessonPlan.id, candidate.id))) {
      return NextResponse.json({ error: 'See valik tekitaks tunnikavade jadas tsükli' }, { status: 400 });
    }
  }

  await prisma.lessonPlan.upsert({
    where: { researchPlanEntryId: planEntryId },
    update: { previousLessonPlanId },
    create: { researchPlanEntryId: planEntryId, previousLessonPlanId },
  });

  return NextResponse.redirect(new URL(`/opetaja/tunnikava/${planEntryId}`, process.env.APP_BASE_URL || req.url), 303);
}
