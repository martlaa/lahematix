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
  const id = String(form.get('id') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id }, include: { lessonPlan: true } });
  if (!entry || entry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  const date = String(form.get(`date.${id}`) ?? '');
  if (!date) {
    return NextResponse.json({ error: 'Kuupäev on kohustuslik' }, { status: 400 });
  }

  const durationMinRaw = String(form.get(`durationMin.${id}`) ?? '').trim();
  const appliedMethods = form.getAll(`appliedMethods.${id}`).map(String).filter((m): m is Method =>
    VALID_METHODS.includes(m as Method),
  );

  const expectingObserver = form.get(`expectingObserver.${id}`) === 'on';

  await prisma.researchPlanEntry.update({
    where: { id },
    data: {
      date: new Date(date),
      startTime: String(form.get(`startTime.${id}`) ?? '').trim() || null,
      durationMin: durationMinRaw ? Number(durationMinRaw) : null,
      studentGroup: String(form.get(`studentGroup.${id}`) ?? '').trim() || null,
      appliedMethods,
      topic: String(form.get(`topic.${id}`) ?? '').trim() || null,
      expectingObserver,
      // kui õpetaja lülitab "ootan vaatlejat" välja, kaotab olemasolev broneering mõtte
      observerUserId: expectingObserver ? undefined : null,
    },
  });

  if (entry.lessonPlan) {
    const publishToGallery = form.get(`publishToGallery.${id}`) === 'on';
    const alreadyPublished = entry.lessonPlan.publishedToGalleryAt !== null;
    if (publishToGallery !== alreadyPublished) {
      await prisma.lessonPlan.update({
        where: { id: entry.lessonPlan.id },
        data: { publishedToGalleryAt: publishToGallery ? new Date() : null },
      });
    }
  }

  return NextResponse.redirect(new URL('/opetaja/uuringukava', req.url), 303);
}
