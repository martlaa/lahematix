import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

const VALID_BANDS = ['4-6', '7-9', '10-12'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const gradeBand = String(form.get('gradeBand') ?? '').trim();

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: 'Õpetaja profiili ei leitud' }, { status: 404 });
  }

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { gradeBand: VALID_BANDS.includes(gradeBand) ? gradeBand : null },
  });

  return NextResponse.redirect(new URL('/opetaja', process.env.APP_BASE_URL || req.url), 303);
}
