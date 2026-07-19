import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getTestByCode, parseTestAnswers } from '@/lib/tests';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const testCode = String(form.get('testCode') ?? '');
  const definition = getTestByCode(testCode);
  if (!definition) {
    return NextResponse.json({ error: 'Testi ei leitud' }, { status: 404 });
  }

  const answers = parseTestAnswers(definition, form);

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

  return NextResponse.redirect(new URL(`/teadur/instrumendid/test/${definition.code}`, req.url), 303);
}
