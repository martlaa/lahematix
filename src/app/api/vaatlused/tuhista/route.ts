import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const planEntryId = String(form.get('planEntryId') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId } });
  if (!entry || entry.observerUserId !== session.userId) {
    return NextResponse.json({ error: 'Broneeringut ei leitud' }, { status: 404 });
  }

  await prisma.researchPlanEntry.update({
    where: { id: planEntryId },
    data: { observerUserId: null },
  });

  return NextResponse.redirect(new URL('/vaatlused', req.url), 303);
}
