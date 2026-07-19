import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MATERIAL_OPTIONS } from '@/lib/lessonplan/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const sampleLessonPlanId = String(form.get('sampleLessonPlanId') ?? '');

  const plan = await prisma.sampleLessonPlan.findUnique({ where: { id: sampleLessonPlanId } });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }

  const materials: Record<string, string> = {};
  for (const m of MATERIAL_OPTIONS) {
    if (form.get(`material.${m.key}`) === 'on') {
      materials[m.key] = String(form.get(`materialLink.${m.key}`) ?? '').trim();
    }
  }

  await prisma.sampleLessonPlan.update({
    where: { id: sampleLessonPlanId },
    data: {
      materialsJson: JSON.stringify(materials),
      homeworkText: String(form.get('homeworkText') ?? '').trim() || null,
      homeworkRelated: form.get('homeworkRelated') === 'on',
    },
  });

  return NextResponse.redirect(new URL(`/teadur/naidistunnikavad/${sampleLessonPlanId}`, req.url), 303);
}
