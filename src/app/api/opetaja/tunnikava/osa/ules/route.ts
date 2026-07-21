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
  const id = String(form.get('id') ?? '');

  const part = await prisma.lessonPlanPart.findUnique({
    where: { id },
    include: { lessonPlan: { include: { researchPlanEntry: true, parts: { orderBy: { order: 'asc' } } } } },
  });
  if (!part || part.lessonPlan.researchPlanEntry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Tunniosa ei leitud' }, { status: 404 });
  }

  const above = part.lessonPlan.parts.find((p) => p.order === part.order - 1);
  if (above) {
    await prisma.$transaction([
      prisma.lessonPlanPart.update({ where: { id: part.id }, data: { order: above.order } }),
      prisma.lessonPlanPart.update({ where: { id: above.id }, data: { order: part.order } }),
    ]);
  }

  return NextResponse.redirect(
    new URL(`/opetaja/tunnikava/${part.lessonPlan.researchPlanEntryId}`, process.env.APP_BASE_URL || req.url),
    303,
  );
}
