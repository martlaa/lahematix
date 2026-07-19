import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getJournalDefinition, parseJournalAnswers } from '@/lib/journal';

const INSTRUMENT_CODE = 'lisa7';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const definition = getJournalDefinition();
  const answers = parseJournalAnswers(definition, form);

  await prisma.instrumentTrial.upsert({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode: INSTRUMENT_CODE } },
    update: { answersJson: JSON.stringify(answers) },
    create: {
      authorUserId: session.userId,
      instrumentCode: INSTRUMENT_CODE,
      answersJson: JSON.stringify(answers),
      submittedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL('/teadur/instrumendid/paevik', req.url), 303);
}
