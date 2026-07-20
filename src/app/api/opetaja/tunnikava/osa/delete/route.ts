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

  const remaining = part.lessonPlan.parts.filter((p) => p.id !== id);

  await prisma.$transaction([
    prisma.lessonPlanPart.delete({ where: { id } }),
    ...remaining.map((p, idx) =>
      prisma.lessonPlanPart.update({ where: { id: p.id }, data: { order: idx + 1 } }),
    ),
  ]);

  return NextResponse.redirect(
    new URL(`/opetaja/tunnikava/${part.lessonPlan.researchPlanEntryId}`, process.env.APP_BASE_URL || req.url),
    303,
  );
}
