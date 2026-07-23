import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MATERIAL_OPTIONS, MATERIAL_ITEMS_PER_TYPE, type MaterialsAnswers } from '@/lib/lessonplan/types';

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

  const materials: MaterialsAnswers = {};
  for (const m of MATERIAL_OPTIONS) {
    if (form.get(`material.${m.key}`) === 'on') {
      const items: string[] = [];
      for (let i = 0; i < MATERIAL_ITEMS_PER_TYPE; i++) {
        const value = String(form.get(`materialLink.${m.key}.${i}`) ?? '').trim();
        if (value) items.push(value);
      }
      materials[m.key] = items;
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

  return NextResponse.redirect(new URL(`/teadur/naidistunnikavad/${sampleLessonPlanId}`, process.env.APP_BASE_URL || req.url), 303);
}
