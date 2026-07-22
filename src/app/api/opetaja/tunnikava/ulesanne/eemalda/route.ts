import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

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
  const taskId = String(form.get('taskId') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId }, include: { lessonPlan: true } });
  if (!entry || entry.teacherId !== teacher.id || !entry.lessonPlan) {
    return NextResponse.json({ error: 'Tunnikava ei leitud' }, { status: 404 });
  }

  await prisma.taskUsage.deleteMany({ where: { taskId, lessonPlanId: entry.lessonPlan.id } });

  return NextResponse.redirect(new URL(`/opetaja/tunnikava/${planEntryId}`, process.env.APP_BASE_URL || req.url), 303);
}
