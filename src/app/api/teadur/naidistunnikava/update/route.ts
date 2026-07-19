import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { Method } from '@prisma/client';

const VALID_METHODS: Method[] = ['BOALER', 'LILJEDAHL', 'TOH'];
const VALID_GRADE_BANDS = ['4-6', '7-9', '10-12'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const id = String(form.get('id') ?? '');

  const plan = await prisma.sampleLessonPlan.findUnique({ where: { id } });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }

  const gradeBand = String(form.get('gradeBand') ?? '');
  if (!VALID_GRADE_BANDS.includes(gradeBand)) {
    return NextResponse.json({ error: 'Vanuseaste on kohustuslik' }, { status: 400 });
  }

  const durationMinRaw = String(form.get('durationMin') ?? '').trim();
  const appliedMethods = form.getAll('appliedMethods').map(String).filter((m): m is Method =>
    VALID_METHODS.includes(m as Method),
  );

  await prisma.sampleLessonPlan.update({
    where: { id },
    data: {
      gradeBand,
      durationMin: durationMinRaw ? Number(durationMinRaw) : null,
      appliedMethods,
      topic: String(form.get('topic') ?? '').trim() || null,
    },
  });

  return NextResponse.redirect(new URL(`/teadur/naidistunnikavad/${id}`, req.url), 303);
}
