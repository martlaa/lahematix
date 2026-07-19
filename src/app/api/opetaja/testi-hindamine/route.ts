import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getTestByCode } from '@/lib/tests';

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
  const studentId = String(form.get('studentId') ?? '');
  const testCode = String(form.get('testCode') ?? '');
  const phaseRaw = String(form.get('phase') ?? '');
  const phase = phaseRaw === 'EEL' || phaseRaw === 'JAREL' ? phaseRaw : undefined;
  const comment = String(form.get('comment') ?? '').trim();

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Õpilast ei leitud' }, { status: 404 });
  }

  const definition = phase ? getTestByCode(testCode) : undefined;
  if (!definition || !phase) {
    return NextResponse.json({ error: 'Testi ei leitud' }, { status: 404 });
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

  const submission = await prisma.testSubmission.upsert({
    where: { testCode_phase_studentId: { testCode: definition.code, phase, studentId: student.id } },
    update: {},
    create: { testCode: definition.code, phase, studentId: student.id, answersJson: null, submittedAt: null },
  });

  await prisma.testGrading.upsert({
    where: { testSubmissionId: submission.id },
    update: {
      scoresJson: JSON.stringify(scores),
      totalScore,
      comment: comment || null,
      gradedByUserId: session.userId,
      gradedAt: new Date(),
    },
    create: {
      testSubmissionId: submission.id,
      scoresJson: JSON.stringify(scores),
      totalScore,
      comment: comment || null,
      gradedByUserId: session.userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'TEST_GRADE',
      entity: 'Student',
      entityId: student.id,
      meta: `${definition.code}:${phase}:${totalScore}/${definition.maxScore}`,
    },
  });

  return NextResponse.redirect(new URL('/opetaja/opilased', req.url), 303);
}
