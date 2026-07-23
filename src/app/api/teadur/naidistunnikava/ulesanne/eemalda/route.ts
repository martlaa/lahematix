import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const sampleLessonPlanId = String(form.get('sampleLessonPlanId') ?? '');
  const taskId = String(form.get('taskId') ?? '');

  const plan = await prisma.sampleLessonPlan.findUnique({ where: { id: sampleLessonPlanId } });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }

  await prisma.sampleTaskUsage.deleteMany({ where: { taskId, sampleLessonPlanId: plan.id } });

  return NextResponse.redirect(new URL(`/teadur/naidistunnikavad/${plan.id}`, process.env.APP_BASE_URL || req.url), 303);
}
