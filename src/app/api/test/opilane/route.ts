import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestByGradeBand, parseTestAnswers } from '@/lib/tests';

const PHASE_BY_PURPOSE: Record<string, 'EEL' | 'JAREL'> = {
  TEST_EEL: 'EEL',
  TEST_JAREL: 'JAREL',
};

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = String(form.get('token') ?? '');

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { student: { include: { teacher: true } } },
  });
  const phase = invite ? PHASE_BY_PURPOSE[invite.purpose] : undefined;

  if (!invite || !invite.student || !phase || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link on aegunud või kehtetu' }, { status: 404 });
  }

  const student = invite.student;
  const definition = student.teacher.gradeBand ? getTestByGradeBand(student.teacher.gradeBand) : undefined;
  if (!definition) {
    return NextResponse.json({ error: 'Testi ei leitud' }, { status: 404 });
  }

  const latestConsent = await prisma.consentRecord.findFirst({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });
  if (latestConsent?.status !== 'ANTUD') {
    return NextResponse.json({ error: 'Nõusolek uuringus osalemiseks puudub' }, { status: 403 });
  }

  const existing = await prisma.testSubmission.findUnique({
    where: { testCode_phase_studentId: { testCode: definition.code, phase, studentId: student.id } },
  });
  if (existing) {
    return NextResponse.redirect(new URL(`/opilane/test/${token}`, process.env.APP_BASE_URL || req.url), 303);
  }

  const answers = parseTestAnswers(definition, form);

  await prisma.testSubmission.create({
    data: {
      testCode: definition.code,
      phase,
      studentId: student.id,
      answersJson: JSON.stringify(answers),
      submittedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: 'TEST_SUBMIT',
      entity: 'Student',
      entityId: student.id,
      meta: `${definition.code}:${phase}`,
    },
  });

  return NextResponse.redirect(new URL(`/opilane/test/${token}`, process.env.APP_BASE_URL || req.url), 303);
}
