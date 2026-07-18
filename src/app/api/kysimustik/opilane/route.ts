import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuestionnaireByCode, parseQuestionnaireAnswers } from '@/lib/questionnaires';

const CODE_BY_PURPOSE: Record<string, string> = {
  QUESTIONNAIRE_EEL: 'lisa4-eel',
  QUESTIONNAIRE_JAREL: 'lisa4-jarel',
};

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = String(form.get('token') ?? '');

  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  const questionnaireCode = invite ? CODE_BY_PURPOSE[invite.purpose] : undefined;

  if (!invite || !invite.studentId || !questionnaireCode || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link on aegunud või kehtetu' }, { status: 404 });
  }

  const definition = getQuestionnaireByCode(questionnaireCode);
  if (!definition) {
    return NextResponse.json({ error: 'Küsimustikku ei leitud' }, { status: 404 });
  }

  const latestConsent = await prisma.consentRecord.findFirst({
    where: { studentId: invite.studentId },
    orderBy: { createdAt: 'desc' },
  });
  if (latestConsent?.status !== 'ANTUD') {
    return NextResponse.json({ error: 'Nõusolek uuringus osalemiseks puudub' }, { status: 403 });
  }

  const existing = await prisma.questionnaireResponse.findUnique({
    where: { questionnaireCode_studentId: { questionnaireCode, studentId: invite.studentId } },
  });
  if (existing) {
    return NextResponse.redirect(new URL(`/opilane/kysimustik/${token}`, req.url), 303);
  }

  const answers = parseQuestionnaireAnswers(definition, form);

  await prisma.questionnaireResponse.create({
    data: {
      questionnaireCode,
      studentId: invite.studentId,
      answersJson: JSON.stringify(answers),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: 'QUESTIONNAIRE_SUBMIT',
      entity: 'Student',
      entityId: invite.studentId,
      meta: questionnaireCode,
    },
  });

  return NextResponse.redirect(new URL(`/opilane/kysimustik/${token}`, req.url), 303);
}
