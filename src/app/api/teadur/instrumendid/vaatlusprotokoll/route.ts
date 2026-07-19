import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { OBSERVATION_DOMAINS, type ObservationRatings, type IncidentLogRow, type ObservationSummary } from '@/lib/observation/lisa6';

const ALL_ITEM_KEYS = OBSERVATION_DOMAINS.flatMap((d) => d.items.map((i) => i.key));

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const sampleLessonPlanId = String(form.get('sampleLessonPlanId') ?? '');

  const plan = await prisma.sampleLessonPlan.findUnique({
    where: { id: sampleLessonPlanId },
    include: { parts: true },
  });
  if (!plan || plan.authorUserId !== session.userId) {
    return NextResponse.json({ error: 'Näidistundi ei leitud' }, { status: 404 });
  }
  if (plan.parts.length === 0) {
    return NextResponse.json({ error: 'Näidistunnil pole tunniosi' }, { status: 400 });
  }

  const ratings: ObservationRatings = {};
  for (const part of plan.parts) {
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

  const instrumentCode = `lisa6:${plan.id}`;
  const answersJson = JSON.stringify({ ratings, incidents, summary });

  await prisma.instrumentTrial.upsert({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode } },
    update: { answersJson, submittedAt: new Date() },
    create: { authorUserId: session.userId, instrumentCode, answersJson, submittedAt: new Date() },
  });

  return NextResponse.redirect(new URL(`/teadur/instrumendid/vaatlusprotokoll/${plan.id}`, req.url), 303);
}
