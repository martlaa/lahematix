import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getJournalDefinition, parseJournalAnswers } from '@/lib/journal';

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
  const planEntryId = String(form.get('planEntryId') ?? '');

  const planEntry = await prisma.researchPlanEntry.findUnique({ where: { id: planEntryId } });
  if (!planEntry || planEntry.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Uuringukava rida ei leitud' }, { status: 404 });
  }

  const existing = await prisma.journalEntry.findUnique({ where: { researchPlanEntryId: planEntryId } });

  const definition = getJournalDefinition();
  const answers = parseJournalAnswers(definition, form);

  await prisma.journalEntry.upsert({
    where: { researchPlanEntryId: planEntryId },
    update: { answersJson: JSON.stringify(answers) },
    create: {
      researchPlanEntryId: planEntryId,
      teacherId: teacher.id,
      answersJson: JSON.stringify(answers),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: existing ? 'JOURNAL_ENTRY_UPDATE' : 'JOURNAL_ENTRY_SUBMIT',
      entity: 'ResearchPlanEntry',
      entityId: planEntryId,
      meta: definition.code,
    },
  });

  return NextResponse.redirect(new URL(`/opetaja/paevik/${planEntryId}`, req.url), 303);
}
