import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert } from '@/components/ui';
import { JournalForm } from '@/components/JournalForm';
import { getJournalDefinition } from '@/lib/journal';
import type { JournalAnswers } from '@/lib/journal';

const INSTRUMENT_CODE = 'lisa7';

export default async function TeadurPaevikKatsetusPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const definition = getJournalDefinition();

  const existing = await prisma.instrumentTrial.findUnique({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode: INSTRUMENT_CODE } },
  });

  const existingAnswers: JournalAnswers | undefined = existing?.answersJson
    ? JSON.parse(existing.answersJson)
    : undefined;

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <FormShell title={`${definition.title} (katsetus)`} subtitle="See on sinu isiklik katsetus, mitte päris uuringuandmestik.">
        <a href="/teadur/instrumendid" className="block text-sm text-brand-600 underline hover:no-underline mb-4">
          ← Tagasi instrumentide juurde
        </a>
        {existing && (
          <Alert kind="info">
            Katsetasid seda sissekannet esmakordselt {existing.submittedAt?.toLocaleDateString('et-EE')}. Vorm
            on eeltäidetud senise sisuga — saad seda täiendada ja uuesti salvestada.
          </Alert>
        )}
        <JournalForm
          definition={definition}
          action="/api/teadur/instrumendid/paevik"
          existingAnswers={existingAnswers}
        />
      </FormShell>
    </>
  );
}
