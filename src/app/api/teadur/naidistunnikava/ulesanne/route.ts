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

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.hidden) {
    return NextResponse.json({ error: 'Ülesannet ei leitud' }, { status: 404 });
  }

  await prisma.sampleTaskUsage.upsert({
    where: { taskId_sampleLessonPlanId: { taskId: task.id, sampleLessonPlanId: plan.id } },
    update: {},
    create: { taskId: task.id, sampleLessonPlanId: plan.id },
  });

  return NextResponse.redirect(new URL(`/teadur/naidistunnikavad/${plan.id}`, process.env.APP_BASE_URL || req.url), 303);
}
