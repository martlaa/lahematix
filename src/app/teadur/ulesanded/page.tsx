import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { GRADE_BAND_OPTIONS, METHOD_OPTIONS } from '@/lib/tasks/types';

export default async function TeadurUlesandedPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const tasks = await prisma.task.findMany({
    where: { authorUserId: session.userId },
    include: { ratings: true, _count: { select: { usages: true } } },
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
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Minu ülesanded</h1>
          <p className="text-sm text-slate-600">
            Lisa avalikku ülesannete panka töölehti ja ülesandeid, mida õpetajad-uurijad saavad oma tunnikavades
            kasutada.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Lisa ülesanne</h2>
          <form action="/api/ulesanded" method="post" encType="multipart/form-data" className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="title"
              placeholder="Pealkiri"
              required
              className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select name="gradeBand" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              <option value="">— vali vanuseaste —</option>
              {GRADE_BAND_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="topic"
              placeholder="Teema"
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
              name="creditedAuthor"
              defaultValue={session.name ?? ''}
              placeholder="Autor"
              className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="col-span-2 space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700">
                Tööleht lingina (GDocs, OneDrive)
              </label>
              <input
                type="url"
                name="worksheetUrl"
                placeholder="https://..."
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <label className="block text-sm font-medium text-slate-700">
                ...või laadi üles fail (docx, jpg, PDF — kuni 50 MB)
              </label>
              <input
                type="file"
                name="file"
                accept=".docx,.jpg,.jpeg,.pdf"
                className="w-full text-sm"
              />
            </div>
            <button className="col-span-2 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lisa ülesanne
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Minu ülesanded</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-500">Ülesandeid pole veel lisatud.</p>
          ) : (
            <form method="post">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">Pealkiri</th>
                    <th className="py-1 pr-2">Vanuseaste</th>
                    <th className="py-1 pr-2">Teema</th>
                    <th className="py-1 pr-2 text-right">Allalaadimisi</th>
                    <th className="py-1 pr-2 text-right">Tunnikavades</th>
                    <th className="py-1 pr-2 text-right">Hinnang</th>
                    <th className="py-1 pr-2"></th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const avg = t.ratings.length
                      ? t.ratings.reduce((sum, r) => sum + r.value, 0) / t.ratings.length
                      : null;
                    return (
                      <tr key={t.id} className={'border-b border-slate-100 ' + (t.hidden ? 'text-slate-500' : '')}>
                        <td className="py-2 pr-2">{t.title}</td>
                        <td className="py-2 pr-2">{t.gradeBand ?? '—'}</td>
                        <td className="py-2 pr-2">{t.topic ?? '—'}</td>
                        <td className="py-2 pr-2 text-right">{t.downloadCount}</td>
                        <td className="py-2 pr-2 text-right">{t._count.usages}</td>
                        <td className="py-2 pr-2 text-right">{avg !== null ? `${avg.toFixed(1)} (${t.ratings.length})` : '—'}</td>
                        <td className="py-2 pr-2">
                          {!t.hidden && (
                            <a href={`/ulesanded/${t.id}`} className="text-brand-600 underline hover:no-underline">
                              Vaata
                            </a>
                          )}
                        </td>
                        <td className="py-2">
                          <button
                            type="submit"
                            formAction={`/api/ulesanded/${t.id}/${t.hidden ? 'taasta' : 'peida'}`}
                            className={t.hidden ? 'text-brand-600 underline hover:no-underline' : 'text-red-600 underline hover:no-underline'}
                          >
                            {t.hidden ? 'Taasta' : 'Peida'}
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
