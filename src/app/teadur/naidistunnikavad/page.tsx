import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';

const METHOD_OPTIONS = [
  { value: 'BOALER', letter: 'B', label: 'Boaler' },
  { value: 'LILJEDAHL', letter: 'L', label: 'Liljedahl' },
  { value: 'TOH', letter: 'T', label: 'Toh' },
] as const;

export default async function TeadurNaidistunnikavadPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const plans = await prisma.sampleLessonPlan.findMany({
    where: { authorUserId: session.userId },
    include: { parts: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/teadur" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Minu näidistunnid</h1>
          <p className="text-sm text-slate-600">
            Koosta näidistunnikavu, mida õpetajad-uurijad näevad eeskujuna oma tunnikava koostamise
            lehel, kui vanuseaste ja teema või meetod kattuvad.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Lisa näidistund</h2>
          <form action="/api/teadur/naidistunnikava" method="post" className="grid grid-cols-2 gap-3">
            <select name="gradeBand" required className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              <option value="">— vali vanuseaste —</option>
              <option value="4-6">4.–6. klass</option>
              <option value="7-9">7.–9. klass</option>
              <option value="10-12">10.–12. klass</option>
            </select>
            <input
              type="number"
              name="durationMin"
              placeholder="Kestus (min)"
              min="1"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="col-span-2 flex items-center gap-4 text-sm text-slate-700">
              <span className="text-slate-500">Meetod:</span>
              {METHOD_OPTIONS.map((m) => (
                <label key={m.value} className="flex items-center gap-1.5">
                  <input type="checkbox" name="appliedMethods" value={m.value} className="h-4 w-4 rounded border-slate-300" />
                  {m.label}
                </label>
              ))}
            </div>
            <input
              type="text"
              name="topic"
              placeholder="Tunni teema"
              className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button className="col-span-2 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lisa näidistund
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Minu näidistunnikavad</h2>
          {plans.length === 0 ? (
            <p className="text-sm text-slate-500">Näidistunde pole veel lisatud.</p>
          ) : (
            <form method="post">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">Vanuseaste</th>
                    <th className="py-1 pr-2">Meetod</th>
                    <th className="py-1 pr-2">Teema</th>
                    <th className="py-1 pr-2">Kestus</th>
                    <th className="py-1 pr-2">Tunniosi</th>
                    <th className="py-1 pr-2"></th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => {
                    const methodLetters = METHOD_OPTIONS.filter((m) => p.appliedMethods.includes(m.value))
                      .map((m) => m.letter)
                      .join('/');
                    return (
                      <tr
                        key={p.id}
                        className={'border-b border-slate-100 ' + (p.hidden ? 'text-slate-500' : '')}
                      >
                        <td className="py-2 pr-2">{p.gradeBand ?? '—'}</td>
                        <td className="py-2 pr-2">{methodLetters || '—'}</td>
                        <td className="py-2 pr-2">{p.topic ?? '—'}</td>
                        <td className="py-2 pr-2">{p.durationMin ? `${p.durationMin} min` : '—'}</td>
                        <td className="py-2 pr-2">{p.parts.length}</td>
                        <td className="py-2 pr-2">
                          {!p.hidden && (
                            <a
                              href={`/teadur/naidistunnikavad/${p.id}`}
                              className="text-brand-600 underline hover:no-underline"
                            >
                              Ava
                            </a>
                          )}
                        </td>
                        <td className="py-2">
                          <button
                            type="submit"
                            name="id"
                            value={p.id}
                            formAction={p.hidden ? '/api/teadur/naidistunnikava/restore' : '/api/teadur/naidistunnikava/hide'}
                            className={p.hidden ? 'text-brand-600 underline hover:no-underline' : 'text-red-600 underline hover:no-underline'}
                          >
                            {p.hidden ? 'Taasta' : 'Peida'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
