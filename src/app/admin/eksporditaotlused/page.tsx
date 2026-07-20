import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { getDatasetDefinition } from '@/lib/export/datasets';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Ootab otsust',
  APPROVED: 'Kinnitatud',
  DENIED: 'Tagasi lükatud',
  FULFILLED: 'Alla laaditud',
};

export default async function AdminEksporditaotlusedPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const requests = await prisma.exportRequest.findMany({
    include: { requestedByUser: true, decidedByUser: true },
    orderBy: { requestedAt: 'desc' },
    take: 100,
  });

  const pending = requests.filter((r) => r.status === 'PENDING');
  const decided = requests.filter((r) => r.status !== 'PENDING');

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/admin" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Andmeekspordi taotlused</h1>
          <p className="text-sm text-slate-600">
            Küsimustike, testitulemuste ja uurijapäeviku andmete eksport vajab iga kord admini kinnitust
            (eetikataotlus p 4.2). Kinnitus kehtib ühekordseks allalaadimiseks.
          </p>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Ootel taotlused ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-400">Ootel taotlusi pole.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Teadur</th>
                  <th className="py-1 pr-2">Andmestik</th>
                  <th className="py-1 pr-2">Taotletud</th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2">{r.requestedByUser.name}</td>
                    <td className="py-2 pr-2">{getDatasetDefinition(r.datasetKey)?.label ?? r.datasetKey}</td>
                    <td className="py-2 pr-2">{r.requestedAt.toLocaleString('et-EE')}</td>
                    <td className="py-2 pr-2">
                      <form action="/api/admin/eksporditaotlused/otsus" method="post" className="flex items-start gap-2">
                        <input type="hidden" name="requestId" value={r.id} />
                        <input
                          type="text"
                          name="note"
                          placeholder="Põhjendus (valikuline)"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button
                          type="submit"
                          name="decision"
                          value="approve"
                          className="text-xs text-green-700 bg-green-100 rounded-full px-3 py-1 hover:opacity-80"
                        >
                          Kinnita
                        </button>
                        <button
                          type="submit"
                          name="decision"
                          value="deny"
                          className="text-xs text-red-700 bg-red-100 rounded-full px-3 py-1 hover:opacity-80"
                        >
                          Lükka tagasi
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-4">Varasemad otsused</h2>
          {decided.length === 0 ? (
            <p className="text-sm text-slate-400">Otsuseid pole veel tehtud.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Teadur</th>
                  <th className="py-1 pr-2">Andmestik</th>
                  <th className="py-1 pr-2">Staatus</th>
                  <th className="py-1 pr-2">Otsustaja</th>
                  <th className="py-1 pr-2">Otsustatud</th>
                  <th className="py-1 pr-2">Märkus</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-1 pr-2">{r.requestedByUser.name}</td>
                    <td className="py-1 pr-2">{getDatasetDefinition(r.datasetKey)?.label ?? r.datasetKey}</td>
                    <td className="py-1 pr-2">{STATUS_LABEL[r.status]}</td>
                    <td className="py-1 pr-2">{r.decidedByUser?.name ?? '—'}</td>
                    <td className="py-1 pr-2">{r.decidedAt?.toLocaleString('et-EE') ?? '—'}</td>
                    <td className="py-1 pr-2">{r.decisionNote ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
