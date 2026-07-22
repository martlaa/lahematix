import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Kontrollib, et valitud "eelmine tund" ei tekitaks tsüklit (nt A -> B -> A) —
// kõnnib kandidaadi enda "eelmine" ahelat tagasi ja veendub, et see ei jõua
// kunagi tagasi praeguse näidistunnikavani.
async function wouldCreateCycle(currentSampleLessonPlanId: string, candidateId: string): Promise<boolean> {
  let cursor: string | null = candidateId;
  for (let i = 0; i < 200 && cursor; i++) {
    if (cursor === currentSampleLessonPlanId) return true;
    const plan: { previousSampleLessonPlanId: string | null } | null = await prisma.sampleLessonPlan.findUnique({
      where: { id: cursor },
      select: { previousSampleLessonPlanId: true },
    });
    cursor = plan?.previousSampleLessonPlanId ?? null;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const sampleLessonPlanId = String(form.get('sampleLessonPlanId') ?? '');
  const previousSampleLessonPlanId = String(form.get('previousSampleLessonPlanId') ?? '').trim() || null;

  const plan = await prisma.sampleLessonPlan.findUnique({ where: { id: sampleLessonPlanId } });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }

  if (previousSampleLessonPlanId) {
    if (previousSampleLessonPlanId === plan.id) {
      return NextResponse.json({ error: 'Tund ei saa olla iseenda eelmine tund' }, { status: 400 });
    }
    const candidate = await prisma.sampleLessonPlan.findUnique({ where: { id: previousSampleLessonPlanId } });
    if (!candidate || candidate.authorUserId !== session.userId) {
      return NextResponse.json({ error: 'Valitud näidistundi ei leitud' }, { status: 400 });
    }
    if (await wouldCreateCycle(plan.id, candidate.id)) {
      return NextResponse.json({ error: 'See valik tekitaks näidistundide jadas tsükli' }, { status: 400 });
    }
  }

  await prisma.sampleLessonPlan.update({
    where: { id: plan.id },
    data: { previousSampleLessonPlanId },
  });

  return NextResponse.redirect(
    new URL(`/teadur/naidistunnikavad/${plan.id}`, process.env.APP_BASE_URL || req.url),
    303,
  );
}
