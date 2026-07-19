import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default async function OpetajaUuringuandmestikPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const ownQuestionnaire = await prisma.questionnaireResponse.findUnique({
    where: { questionnaireCode_teacherUserId: { questionnaireCode: 'lisa8', teacherUserId: session.userId } },
  });

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        <a href="/opetaja" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <Link
          href="/opetaja/kysimustik"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">
            Minu küsimustik {ownQuestionnaire ? '✅' : '— tuleb täita'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {ownQuestionnaire
              ? 'Küsimustik on täidetud. Vaata staatust.'
              : 'Täidetakse projekti lõpus (Lisa 8) — vajab enne oma nõusolekut.'}
          </p>
        </Link>

        <Link
          href="/opetaja/uuringukava"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu uuringukava</h2>
          <p className="text-sm text-slate-600 mt-1">
            Kavanda oma katsetunnid ja ava sealt iga tunni järgne uurijapäeviku sissekanne.
          </p>
        </Link>
      </main>
    </>
  );
}
