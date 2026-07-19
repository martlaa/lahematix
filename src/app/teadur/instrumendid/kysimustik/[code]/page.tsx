import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert } from '@/components/ui';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { getQuestionnaireByCode } from '@/lib/questionnaires';

export default async function TeadurKysimustikKatsetusPage({ params }: { params: { code: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const definition = getQuestionnaireByCode(params.code);
  if (!definition) notFound();

  const existing = await prisma.instrumentTrial.findUnique({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode: definition.code } },
  });

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <FormShell title={`${definition.title} (katsetus)`} subtitle="See on sinu isiklik katsetus, mitte päris uuringuandmestik.">
        <a href="/teadur/instrumendid" className="block text-sm text-brand-600 underline hover:no-underline mb-4">
          ← Tagasi instrumentide juurde
        </a>
        {existing?.submittedAt ? (
          <>
            <Alert kind="success">
              Katsetasid selle vormi täitmist {existing.submittedAt.toLocaleDateString('et-EE')}.
            </Alert>
            <form action="/api/teadur/instrumendid/reset" method="post">
              <input type="hidden" name="instrumentCode" value={definition.code} />
              <input type="hidden" name="redirectTo" value={`/teadur/instrumendid/kysimustik/${definition.code}`} />
              <button className="text-sm text-red-600 underline hover:no-underline">Lähtesta ja proovi uuesti</button>
            </form>
          </>
        ) : (
          <QuestionnaireForm
            definition={definition}
            action="/api/teadur/instrumendid/kysimustik"
            hiddenFields={{ code: definition.code }}
          />
        )}
      </FormShell>
    </>
  );
}
