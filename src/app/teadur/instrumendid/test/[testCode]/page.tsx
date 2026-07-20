import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert } from '@/components/ui';
import { TestForm } from '@/components/TestForm';
import { getTestByCode } from '@/lib/tests';

export default async function TeadurTestKatsetusPage(props: { params: Promise<{ testCode: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const definition = getTestByCode(params.testCode);
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
              Sooritasid selle testi {existing.submittedAt.toLocaleDateString('et-EE')}.{' '}
              <a href={`/teadur/instrumendid/test/${definition.code}/hinda`} className="underline hover:no-underline">
                Ava hindamisleht
              </a>
              .
            </Alert>
            <form action="/api/teadur/instrumendid/reset" method="post">
              <input type="hidden" name="instrumentCode" value={definition.code} />
              <input type="hidden" name="redirectTo" value={`/teadur/instrumendid/test/${definition.code}`} />
              <button className="text-sm text-red-600 underline hover:no-underline">Lähtesta ja proovi uuesti</button>
            </form>
          </>
        ) : (
          <TestForm
            definition={definition}
            action="/api/teadur/instrumendid/test"
            hiddenFields={{ testCode: definition.code }}
            seed={`${session.userId}:${definition.code}`}
          />
        )}
      </FormShell>
    </>
  );
}
