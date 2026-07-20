import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MATERIAL_OPTIONS } from '@/lib/lessonplan/types';

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

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId } });
  if (!entry || entry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  const materials: Record<string, string> = {};
  for (const m of MATERIAL_OPTIONS) {
    if (form.get(`material.${m.key}`) === 'on') {
      materials[m.key] = String(form.get(`materialLink.${m.key}`) ?? '').trim();
    }
  }

  await prisma.lessonPlan.upsert({
    where: { researchPlanEntryId: planEntryId },
    update: {
      materialsJson: JSON.stringify(materials),
      homeworkText: String(form.get('homeworkText') ?? '').trim() || null,
      homeworkRelated: form.get('homeworkRelated') === 'on',
    },
    create: {
      researchPlanEntryId: planEntryId,
      materialsJson: JSON.stringify(materials),
      homeworkText: String(form.get('homeworkText') ?? '').trim() || null,
      homeworkRelated: form.get('homeworkRelated') === 'on',
    },
  });

  return NextResponse.redirect(new URL(`/opetaja/tunnikava/${planEntryId}`, process.env.APP_BASE_URL || req.url), 303);
}
