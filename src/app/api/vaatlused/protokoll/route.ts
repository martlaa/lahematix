import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { OBSERVATION_DOMAINS, type ObservationRatings, type IncidentLogRow, type ObservationSummary } from '@/lib/observation/lisa6';

const ALL_ITEM_KEYS = OBSERVATION_DOMAINS.flatMap((d) => d.items.map((i) => i.key));

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const planEntryId = String(form.get('planEntryId') ?? '');

  const entry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId } });
  if (!entry || entry.observerUserId !== session.userId) {
    return NextResponse.json({ error: 'Rida ei leitud' }, { status: 404 });
  }

  const lessonPlan = await prisma.lessonPlan.findUnique({
    where: { researchPlanEntryId: planEntryId },
    include: { parts: true },
  });
  if (!lessonPlan || lessonPlan.parts.length === 0) {
    return NextResponse.json({ error: 'Tunnikaval pole tunniosi' }, { status: 400 });
  }

  const ratings: ObservationRatings = {};
  for (const part of lessonPlan.parts) {
    ratings[part.id] = {};
    for (const itemKey of ALL_ITEM_KEYS) {
      const valueRaw = String(form.get(`rating.${part.id}.${itemKey}`) ?? '').trim();
      ratings[part.id][itemKey] = {
        value: valueRaw ? Number(valueRaw) : null,
        note: String(form.get(`note.${part.id}.${itemKey}`) ?? '').trim(),
      };
    }
  }

  const incidents: IncidentLogRow[] = [];
  for (let i = 0; i < 20; i++) {
    const description = String(form.get(`incident.${i}.description`) ?? '').trim();
    if (!description) continue;
    incidents.push({
      timeMin: String(form.get(`incident.${i}.timeMin`) ?? '').trim(),
      description,
      construct: String(form.get(`incident.${i}.construct`) ?? '').trim(),
      whoWith: String(form.get(`incident.${i}.whoWith`) ?? '').trim(),
    });
  }

  const summary: ObservationSummary = {
    shortSummary: String(form.get('shortSummary') ?? '').trim(),
    methodFidelity: String(form.get('methodFidelity') ?? '').trim(),
    surprises: String(form.get('surprises') ?? '').trim(),
    recommendations: String(form.get('recommendations') ?? '').trim(),
  };

  const existing = await prisma.observationProtocol.findUnique({
    where: { lessonPlanId_observerUserId: { lessonPlanId: lessonPlan.id, observerUserId: session.userId } },
  });

  const shouldPublish = form.get('publish') === '1';
  // avalikustamine on ühesuunaline — kord õpetajale nähtavaks tehtud, ei lähe tagasi mustandiks
  const publishedAt = existing?.publishedAt ?? (shouldPublish ? new Date() : null);

  await prisma.observationProtocol.upsert({
    where: { lessonPlanId_observerUserId: { lessonPlanId: lessonPlan.id, observerUserId: session.userId } },
    update: {
      ratingsJson: JSON.stringify(ratings),
      incidentsJson: JSON.stringify(incidents),
      summaryJson: JSON.stringify(summary),
      submittedAt: existing?.submittedAt ?? new Date(),
      publishedAt,
    },
    create: {
      lessonPlanId: lessonPlan.id,
      observerUserId: session.userId,
      ratingsJson: JSON.stringify(ratings),
      incidentsJson: JSON.stringify(incidents),
      summaryJson: JSON.stringify(summary),
      submittedAt: new Date(),
      publishedAt,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: !existing
        ? 'OBSERVATION_PROTOCOL_SUBMIT'
        : shouldPublish && !existing?.publishedAt
          ? 'OBSERVATION_PROTOCOL_PUBLISH'
          : 'OBSERVATION_PROTOCOL_UPDATE',
      entity: 'ResearchPlanEntry',
      entityId: planEntryId,
    },
  });

  return NextResponse.redirect(new URL(`/vaatlused/${planEntryId}`, process.env.APP_BASE_URL || req.url), 303);
}
