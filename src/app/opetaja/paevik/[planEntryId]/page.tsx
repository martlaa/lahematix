import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { JournalForm } from '@/components/JournalForm';
import { getJournalDefinition } from '@/lib/journal';
import type { JournalAnswers } from '@/lib/journal';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

export default async function OpetajaPaevikPage({ params }: { params: { planEntryId: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.userId },
    include: { school: true },
  });
  if (!teacher) redirect('/opetaja');

  const planEntry = await prisma.researchPlanEntry.findUnique({
    where: { id: params.planEntryId },
    include: { journalEntry: true, lessonPlan: true },
  });
  if (!planEntry || planEntry.teacherId !== teacher!.id) notFound();

  const allEntries = await prisma.researchPlanEntry.findMany({
    where: { teacherId: teacher!.id },
    orderBy: { date: 'asc' },
    select: { id: true },
  });
  const lessonNumber = allEntries.findIndex((e) => e.id === planEntry!.id) + 1;

  const definition = getJournalDefinition();
  const existingAnswers: JournalAnswers | undefined = planEntry!.journalEntry
    ? JSON.parse(planEntry!.journalEntry.answersJson)
    : undefined;

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/opetaja/uuringukava" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi uuringukavva
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">Uurijapäeviku sissekanne</h1>
          <p className="text-sm text-slate-600 mt-2">
            Kool: {teacher!.school.name} <br />
            Klass: {planEntry!.studentGroup ?? '—'} <br />
            Kuupäev: {planEntry!.date.toLocaleDateString('et-EE')} <br />
            Meetod: {teacher!.method ? METHOD_LABEL[teacher!.method] : '—'} <br />
            Mitmes katsetund: {lessonNumber}. (praegu kokku {allEntries.length} kavandatud tundi) <br />
            Tunni teema: {planEntry!.topic ?? '—'}
            {planEntry!.lessonPlan && (
              <>
                <br />
                Tunnikava:{' '}
                <a href={`/opetaja/tunnikava/${planEntry!.id}`} className="text-brand-600 underline">
                  ava
                </a>
              </>
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {planEntry!.journalEntry && (
            <Alert kind="info">
              Täitsid selle sissekande esmakordselt{' '}
              {planEntry!.journalEntry.submittedAt.toLocaleDateString('et-EE')}
              {planEntry!.journalEntry.updatedAt.getTime() !== planEntry!.journalEntry.submittedAt.getTime() &&
                `, viimati muudetud ${planEntry!.journalEntry.updatedAt.toLocaleDateString('et-EE')}`}
              . Allolev vorm on eeltäidetud senise sisuga — saad seda täiendada ja uuesti salvestada.
            </Alert>
          )}
          <JournalForm
            definition={definition}
            action="/api/opetaja/paevik"
            hiddenFields={{ planEntryId: planEntry!.id }}
            existingAnswers={existingAnswers}
          />
        </div>
      </main>
    </>
  );
}
