import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';

const METHOD_OPTIONS = [
  { value: 'BOALER', letter: 'B', label: 'Boaler' },
  { value: 'LILJEDAHL', letter: 'L', label: 'Liljedahl' },
  { value: 'TOH', letter: 'T', label: 'Toh' },
] as const;

export default async function OpetajaUuringukavaPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) redirect('/opetaja');

  const entries = await prisma.researchPlanEntry.findMany({
    where: { teacherId: teacher!.id },
    include: {
      journalEntry: true,
      observerUser: true,
      lessonPlan: { include: { observationProtocols: { where: { publishedAt: { not: null } } } } },
    },
    orderBy: { date: 'asc' },
  });

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        <a
          href="/opetaja/uuringuandmestik"
          className="inline-block text-sm text-brand-600 underline hover:no-underline"
        >
          ← Tagasi uuringuandmestiku juurde
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Minu uuringukava</h1>
          <p className="text-sm text-slate-600">
            Kohe pärast oma nõusoleku andmist koosta siia tabel kõigist plaanitud katsetundidest, kus
            rakendad oma õppemeetodit. Tabel ei pea korraga täielik olema — täida ja täienda seda
            jooksvalt, nagu tunnid selguvad, kuupäevad muutuvad või vaatleja leitakse. Iga rea juures
            saad hiljem avada ka vastava tunni uurijapäeviku sissekande.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Lisa katsetund</h2>
          <form action="/api/opetaja/uuringukava" method="post" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="date"
              name="date"
              required
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="time"
              name="startTime"
              placeholder="Kellaaeg"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              name="durationMin"
              placeholder="Kestus (min)"
              min="1"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              name="studentGroup"
              placeholder="Õpilaste grupp (nt 5A)"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="col-span-2 md:col-span-4 flex items-center gap-4 text-sm text-slate-700">
              <span className="text-slate-500">Rakendatud metoodika:</span>
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
            <label className="flex items-center gap-2 text-sm text-slate-700 col-span-2 md:col-span-4">
              <input type="checkbox" name="expectingObserver" className="h-4 w-4 rounded border-slate-300" />
              Ootan vaatlejat — rida ilmub tunnivaatluste broneerimise tabelisse, kus kolleegid saavad end
              vaatlejaks märkida
            </label>
            <button className="col-span-2 md:col-span-4 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lisa rida
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Katsetunnid</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-slate-400">Ridu pole veel lisatud.</p>
          ) : (
            <form>
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">Kuupäev</th>
                    <th className="py-1 pr-2">Kellaaeg</th>
                    <th className="py-1 pr-2">Kestus</th>
                    <th className="py-1 pr-2">Grupp</th>
                    <th className="py-1 pr-2" title="Rakendatud metoodika (B = Boaler, L = Liljedahl, T = Toh)">
                      Metoodika
                    </th>
                    <th className="py-1 pr-2">Teema</th>
                    <th className="py-1 pr-2">Tunnikava</th>
                    <th className="py-1 pr-2 text-center">Vaatlus</th>
                    <th className="py-1 pr-2">Vaatleja</th>
                    <th className="py-1 pr-2"></th>
                    <th className="py-1 pr-2 text-center">Uurijapäevik</th>
                    <th className="py-1 pr-2 text-center">Vaatlusprotokoll</th>
                    <th className="py-1 pr-2 text-center" title="Avalda tunnikava avalikus galeriis (CC-BY)">
                      Galerii
                    </th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const methodLetters = METHOD_OPTIONS.filter((m) => e.appliedMethods.includes(m.value))
                      .map((m) => m.letter)
                      .join('/');

                    if (e.hidden) {
                      return (
                        <tr key={e.id} className="border-b border-slate-100 align-top text-slate-400">
                          <td className="py-2 pr-2 w-16">{e.date.toLocaleDateString('et-EE')}</td>
                          <td className="py-2 pr-2 w-10">{e.startTime ?? '—'}</td>
                          <td className="py-2 pr-2 w-8">{e.durationMin ?? '—'}</td>
                          <td className="py-2 pr-2 w-8">{e.studentGroup ?? '—'}</td>
                          <td className="py-2 pr-2">{methodLetters || '—'}</td>
                          <td className="py-2 pr-2">{e.topic ?? '—'}</td>
                          <td className="py-2 pr-2 text-center">
                            <a
                              href={`/opetaja/tunnikava/${e.id}`}
                              className={
                                'inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ' +
                                (e.lessonPlan ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')
                              }
                            >
                              {e.lessonPlan ? 'Muuda' : 'Lisa'}
                            </a>
                          </td>
                          <td className="py-2 pr-2 text-center">{e.expectingObserver ? 'Jah' : 'Ei'}</td>
                          <td className="py-2 pr-2">
                            {e.observerUser?.name ?? (e.expectingObserver ? 'vaba' : '—')}
                          </td>
                          <td className="py-2 pr-2"></td>
                          <td className="py-2 pr-2 text-center">
                            <a
                              href={`/opetaja/paevik/${e.id}`}
                              className={
                                'inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ' +
                                (e.journalEntry ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')
                              }
                            >
                              {e.journalEntry ? 'Muuda' : 'Lisa'}
                            </a>
                          </td>
                          <td className="py-2 pr-2 text-center">
                            {e.lessonPlan && e.lessonPlan.observationProtocols.length > 0 ? (
                              <a
                                href={`/opetaja/vaatlusprotokoll/${e.id}`}
                                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 bg-green-50 text-green-600"
                              >
                                Vaata ({e.lessonPlan.observationProtocols.length})
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2 pr-2 text-center">
                            {e.lessonPlan?.publishedToGalleryAt ? 'Avaldatud' : '—'}
                          </td>
                          <td className="py-2">
                            <button
                              type="submit"
                              name="id"
                              value={e.id}
                              formAction="/api/opetaja/uuringukava/restore"
                              className="text-brand-600 underline hover:no-underline"
                            >
                              Taasta
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={e.id} className="border-b border-slate-100 align-top">
                        <td className="py-2 pr-2">
                          <input
                            type="date"
                            name={`date.${e.id}`}
                            defaultValue={e.date.toISOString().slice(0, 10)}
                            required
                            className="w-16 rounded border border-slate-300 px-1 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="time"
                            name={`startTime.${e.id}`}
                            defaultValue={e.startTime ?? ''}
                            className="w-10 rounded border border-slate-300 px-1 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            name={`durationMin.${e.id}`}
                            defaultValue={e.durationMin ?? undefined}
                            min="1"
                            className="w-8 rounded border border-slate-300 px-1 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            name={`studentGroup.${e.id}`}
                            defaultValue={e.studentGroup ?? ''}
                            className="w-8 rounded border border-slate-300 px-1 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1.5">
                            {METHOD_OPTIONS.map((m) => (
                              <label key={m.value} className="flex items-center gap-0.5" title={m.label}>
                                <input
                                  type="checkbox"
                                  name={`appliedMethods.${e.id}`}
                                  value={m.value}
                                  defaultChecked={e.appliedMethods.includes(m.value)}
                                  className="h-3.5 w-3.5 rounded border-slate-300"
                                />
                                {m.letter}
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            name={`topic.${e.id}`}
                            defaultValue={e.topic ?? ''}
                            className="w-32 rounded border border-slate-300 px-1 py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2 text-center">
                          <a
                            href={`/opetaja/tunnikava/${e.id}`}
                            className={
                              'inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ' +
                              (e.lessonPlan ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                            }
                          >
                            {e.lessonPlan ? 'Muuda' : 'Lisa'}
                          </a>
                        </td>
                        <td className="py-2 pr-2 text-center">
                          <input
                            type="checkbox"
                            name={`expectingObserver.${e.id}`}
                            defaultChecked={e.expectingObserver}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          {e.observerUser?.name ?? (e.expectingObserver ? 'vaba' : '—')}
                        </td>
                        <td className="py-2 pr-2">
                          <button
                            type="submit"
                            name="id"
                            value={e.id}
                            formAction="/api/opetaja/uuringukava/update"
                            className="text-brand-600 underline hover:no-underline"
                          >
                            Salvesta
                          </button>
                        </td>
                        <td className="py-2 pr-2 text-center">
                          <a
                            href={`/opetaja/paevik/${e.id}`}
                            className={
                              'inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ' +
                              (e.journalEntry ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                            }
                          >
                            {e.journalEntry ? 'Muuda' : 'Lisa'}
                          </a>
                        </td>
                        <td className="py-2 pr-2 text-center">
                          {e.lessonPlan && e.lessonPlan.observationProtocols.length > 0 ? (
                            <a
                              href={`/opetaja/vaatlusprotokoll/${e.id}`}
                              className="inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 bg-green-100 text-green-700"
                            >
                              Vaata ({e.lessonPlan.observationProtocols.length})
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 pr-2 text-center">
                          <input
                            type="checkbox"
                            name={`publishToGallery.${e.id}`}
                            defaultChecked={Boolean(e.lessonPlan?.publishedToGalleryAt)}
                            disabled={!e.lessonPlan}
                            title={
                              e.lessonPlan
                                ? 'Avalda see tunnikava avalikus galeriis CC-BY litsentsiga'
                                : 'Lisa esmalt tunnikava'
                            }
                            className="h-4 w-4 rounded border-slate-300 disabled:opacity-30"
                          />
                        </td>
                        <td className="py-2">
                          <button
                            type="submit"
                            name="id"
                            value={e.id}
                            formAction="/api/opetaja/uuringukava/hide"
                            className="text-red-600 underline hover:no-underline"
                          >
                            Peida
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
