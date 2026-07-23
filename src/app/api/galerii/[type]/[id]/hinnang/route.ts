import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, props: { params: Promise<{ type: string; id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const value = Number(form.get('value') ?? '');
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return NextResponse.json({ error: 'Hinnang peab olema 1-5' }, { status: 400 });
  }

  if (params.type === 'naidistund') {
    const plan = await prisma.sampleLessonPlan.findUnique({ where: { id: params.id } });
    if (!plan || plan.hidden || !plan.publishedToGalleryAt) {
      return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
    }
    await prisma.sampleLessonPlanRating.upsert({
      where: { sampleLessonPlanId_userId: { sampleLessonPlanId: plan.id, userId: session.userId } },
      update: { value },
      create: { sampleLessonPlanId: plan.id, userId: session.userId, value },
    });
  } else if (params.type === 'katsetund') {
    const plan = await prisma.lessonPlan.findUnique({ where: { id: params.id }, include: { researchPlanEntry: true } });
    if (!plan || !plan.publishedToGalleryAt || plan.researchPlanEntry.hidden) {
      return NextResponse.json({ error: 'Tunnikava ei leitud' }, { status: 404 });
    }
    await prisma.lessonPlanRating.upsert({
      where: { lessonPlanId_userId: { lessonPlanId: plan.id, userId: session.userId } },
      update: { value },
      create: { lessonPlanId: plan.id, userId: session.userId, value },
    });
  } else {
    return NextResponse.json({ error: 'Tundmatu tüüp' }, { status: 400 });
  }

  return NextResponse.redirect(new URL(`/galerii/${params.type}/${params.id}`, process.env.APP_BASE_URL || req.url), 303);
}
