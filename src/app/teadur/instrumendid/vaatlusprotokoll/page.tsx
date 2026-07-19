import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { MIN_PARTS } from '@/lib/lessonplan/types';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

export default async function TeadurVaatlusprotokollValikPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const plans = await prisma.sampleLessonPlan.findMany({
    where: { authorUserId: session.userId, hidden: false },
    include: { parts: true },
    orderBy: { createdAt: 'desc' },
  });

  const eligible = plans.filter((p) => p.parts.length >= MIN_PARTS);

  const trials = await prisma.instrumentTrial.findMany({
    where: { authorUserId: session.userId, instrumentCode: { startsWith: 'lisa6:' } },
  });
  const trialByCode = new Map(trials.map((t) => [t.instrumentCode, t]));

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/teadur/instrumendid" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi instrumentide juurde
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Tunnivaatlusprotokoll (katsetus)</h1>
          <p className="text-sm text-slate-600">
            Vaatlusprotokolli checkpointid tulevad dünaamiliselt tunnikava osadest. Vali üks oma
            näidistunnikavadest (vähemalt {MIN_PARTS} tunniosaga), et protokolli täitmist katsetada.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          {eligible.length === 0 ? (
            <p className="text-sm text-slate-400">
              Sul pole veel ühtegi näidistundi vähemalt {MIN_PARTS} tunniosaga.{' '}
              <a href="/teadur/naidistunnikavad" className="text-brand-600 underline hover:no-underline">
                Loo esmalt näidistund
              </a>
              .
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Vanuseaste</th>
                  <th className="py-1 pr-2">Meetod</th>
                  <th className="py-1 pr-2">Teema</th>
                  <th className="py-1 pr-2">Tunniosi</th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {eligible.map((p) => {
                  const trial = trialByCode.get(`lisa6:${p.id}`);
                  return (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">{p.gradeBand ?? '—'}</td>
                      <td className="py-2 pr-2">{p.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'}</td>
                      <td className="py-2 pr-2">{p.topic ?? '—'}</td>
                      <td className="py-2 pr-2">{p.parts.length}</td>
                      <td className="py-2 pr-2">
                        <a
                          href={`/teadur/instrumendid/vaatlusprotokoll/${p.id}`}
                          className={
                            'inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ' +
                            (trial?.submittedAt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                          }
                        >
                          {trial?.submittedAt ? 'Muuda' : 'Täida'}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
