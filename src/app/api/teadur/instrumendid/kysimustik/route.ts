import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQuestionnaireByCode, parseQuestionnaireAnswers } from '@/lib/questionnaires';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const code = String(form.get('code') ?? '');
  const definition = getQuestionnaireByCode(code);
  if (!definition) {
    return NextResponse.json({ error: 'Küsimustikku ei leitud' }, { status: 404 });
  }

  const answers = parseQuestionnaireAnswers(definition, form);

  await prisma.instrumentTrial.upsert({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode: definition.code } },
    update: { answersJson: JSON.stringify(answers), submittedAt: new Date() },
    create: {
      authorUserId: session.userId,
      instrumentCode: definition.code,
      answersJson: JSON.stringify(answers),
      submittedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL(`/teadur/instrumendid/kysimustik/${definition.code}`, req.url), 303);
}
