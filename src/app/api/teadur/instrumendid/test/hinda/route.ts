import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getTestByCode } from '@/lib/tests';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const testCode = String(form.get('testCode') ?? '');
  const comment = String(form.get('comment') ?? '').trim();

  const definition = getTestByCode(testCode);
  if (!definition) {
    return NextResponse.json({ error: 'Testi ei leitud' }, { status: 404 });
  }

  const trial = await prisma.instrumentTrial.findUnique({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode: definition.code } },
  });
  if (!trial || !trial.answersJson) {
    return NextResponse.json({ error: 'Katsetust ei leitud' }, { status: 404 });
  }

  const scores: Record<string, Record<string, number>> = {};
  let totalScore = 0;

  for (const problem of definition.problems) {
    const problemScores: Record<string, number> = {};
    for (const sub of problem.subQuestions) {
      const raw = form.get(`${problem.key}.${sub.key}`);
      const value = Math.max(0, Math.min(sub.maxPoints, Math.round(Number(raw ?? 0))));
      problemScores[sub.key] = value;
      totalScore += value;
    }
    scores[problem.key] = problemScores;
  }

  await prisma.instrumentTrial.update({
    where: { id: trial.id },
    data: {
      gradingJson: JSON.stringify(scores),
      totalScore,
      gradingComment: comment || null,
      gradedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL(`/teadur/instrumendid/test/${definition.code}/hinda`, process.env.APP_BASE_URL || req.url), 303);
}
