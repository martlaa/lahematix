import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const id = String(form.get('id') ?? '');

  const part = await prisma.sampleLessonPlanPart.findUnique({
    where: { id },
    include: { sampleLessonPlan: { include: { parts: { orderBy: { order: 'asc' } } } } },
  });
  if (!part || part.sampleLessonPlan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Tunniosa ei leitud' }, { status: 404 });
  }

  const above = part.sampleLessonPlan.parts.find((p) => p.order === part.order - 1);
  if (above) {
    await prisma.$transaction([
      prisma.sampleLessonPlanPart.update({ where: { id: part.id }, data: { order: above.order } }),
      prisma.sampleLessonPlanPart.update({ where: { id: above.id }, data: { order: part.order } }),
    ]);
  }

  return NextResponse.redirect(
    new URL(`/teadur/naidistunnikavad/${part.sampleLessonPlanId}`, process.env.APP_BASE_URL || req.url),
    303,
  );
}
