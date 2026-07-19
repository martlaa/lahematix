import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { Method } from '@prisma/client';

const VALID_METHODS: Method[] = ['BOALER', 'LILJEDAHL', 'TOH'];

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
  const date = String(form.get('date') ?? '');
  if (!date) {
    return NextResponse.json({ error: 'Kuupäev on kohustuslik' }, { status: 400 });
  }

  const durationMinRaw = String(form.get('durationMin') ?? '').trim();
  const appliedMethods = form.getAll('appliedMethods').map(String).filter((m): m is Method =>
    VALID_METHODS.includes(m as Method),
  );

  await prisma.researchPlanEntry.create({
    data: {
      teacherId: teacher.id,
      date: new Date(date),
      startTime: String(form.get('startTime') ?? '').trim() || null,
      durationMin: durationMinRaw ? Number(durationMinRaw) : null,
      studentGroup: String(form.get('studentGroup') ?? '').trim() || null,
      appliedMethods,
      topic: String(form.get('topic') ?? '').trim() || null,
      lessonPlanUrl: String(form.get('lessonPlanUrl') ?? '').trim() || null,
      expectingObserver: form.get('expectingObserver') === 'on',
      observerName: String(form.get('observerName') ?? '').trim() || null,
    },
  });

  return NextResponse.redirect(new URL('/opetaja/uuringukava', req.url), 303);
}
