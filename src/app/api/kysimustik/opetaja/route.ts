import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { lisa8, parseQuestionnaireAnswers } from '@/lib/questionnaires';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const ownConsent = await prisma.consentRecord.findFirst({
    where: { subjectType: 'OPETAJA', subjectId: session.userId },
    orderBy: { createdAt: 'desc' },
  });
  if (ownConsent?.status !== 'ANTUD') {
    return NextResponse.json({ error: 'Nõusolek uuringus osalemiseks puudub' }, { status: 403 });
  }

  const existing = await prisma.questionnaireResponse.findUnique({
    where: { questionnaireCode_teacherUserId: { questionnaireCode: 'lisa8', teacherUserId: session.userId } },
  });
  if (existing) {
    return NextResponse.redirect(new URL('/opetaja/kysimustik', process.env.APP_BASE_URL || req.url), 303);
  }

  const form = await req.formData();
  const answers = parseQuestionnaireAnswers(lisa8, form);

  await prisma.questionnaireResponse.create({
    data: {
      questionnaireCode: 'lisa8',
      teacherUserId: session.userId,
      answersJson: JSON.stringify(answers),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'QUESTIONNAIRE_SUBMIT',
      entity: 'User',
      entityId: session.userId,
      meta: 'lisa8',
    },
  });

  return NextResponse.redirect(new URL('/opetaja/kysimustik', process.env.APP_BASE_URL || req.url), 303);
}
