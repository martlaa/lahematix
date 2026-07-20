import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import {
  MIN_PARTS,
  MAX_PARTS,
  LESSON_PART_TYPE_OPTIONS,
  MATERIAL_OPTIONS,
  type MaterialsAnswers,
} from '@/lib/lessonplan/types';

const METHOD_OPTIONS = [
  { value: 'BOALER', letter: 'B', label: 'Boaler' },
  { value: 'LILJEDAHL', letter: 'L', label: 'Liljedahl' },
  { value: 'TOH', letter: 'T', label: 'Toh' },
] as const;

export default async function TeadurNaidistunnikavaPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ error?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const plan = await prisma.sampleLessonPlan.findUnique({
    where: { id: params.id },
    include: { parts: { orderBy: { order: 'asc' } } },
  });
  if (!plan || plan.authorUserId !== session.userId) notFound();

  const parts = plan.parts;
  const durationSum = parts.reduce((sum, p) => sum + p.durationMin, 0);
  const durationMismatch = plan.durationMin != null && parts.length > 0 && durationSum !== plan.durationMin;
  const materials: MaterialsAnswers = plan.materialsJson ? JSON.parse(plan.materialsJson) : {};

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/teadur/naidistunnikavad" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi näidistundide juurde
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-3">Näidistunni metaandmed</h1>
          <form action="/api/teadur/naidistunnikava/update" method="post" className="grid grid-cols-2 gap-3">
            <input type="hidden" name="id" value={plan.id} />
            <select
              name="gradeBand"
              defaultValue={plan.gradeBand ?? ''}
              required
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">— vali vanuseaste —</option>
              <option value="4-6">4.–6. klass</option>
              <option value="7-9">7.–9. klass</option>
              <option value="10-12">10.–12. klass</option>
            </select>
            <input
              type="number"
              name="durationMin"
              defaultValue={plan.durationMin ?? undefined}
              placeholder="Kestus (min)"
              min="1"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="col-span-2 flex items-center gap-4 text-sm text-slate-700">
              <span className="text-slate-500">Meetod:</span>
              {METHOD_OPTIONS.map((m) => (
                <label key={m.value} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="appliedMethods"
                    value={m.value}
                    defaultChecked={plan.appliedMethods.includes(m.value)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {m.label}
                </label>
              ))}
            </div>
            <input
              type="text"
              name="topic"
              defaultValue={plan.topic ?? ''}
              placeholder="Tunni teema"
              className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button className="col-span-2 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Salvesta
            </button>
          </form>
        </div>

        {searchParams.error === 'max_parts' && (
          <Alert kind="error">Tunniosi saab olla kuni {MAX_PARTS}. Eemalda mõni osa enne uue lisamist.</Alert>
        )}
        {durationMismatch && (
          <Alert kind="error">
            Tunniosade kestuste summa ({durationSum} min) ei vasta märgitud kogukestusele ({plan.durationMin} min).
          </Alert>
        )}
        {parts.length > 0 && parts.length < MIN_PARTS && (
          <Alert kind="info">
            Soovituslikult peaks näidistunnis olema vähemalt {MIN_PARTS} tunniosa — hetkel on lisatud {parts.length}.
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Tunni osad</h2>
          {parts.length === 0 ? (
            <p className="text-sm text-slate-400 mb-4">Tunniosi pole veel lisatud.</p>
          ) : (
            <form className="mb-6">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">#</th>
                    <th className="py-1 pr-2">Osa nimetus</th>
                    <th className="py-1 pr-2">Tüüp</th>
                    <th className="py-1 pr-2">Kestus</th>
                    <th className="py-1 pr-2">Lühikirjeldus</th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-2">{p.order}</td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          name={`title.${p.id}`}
                          defaultValue={p.title}
                          required
                          className="w-28 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          name={`type.${p.id}`}
                          defaultValue={p.type}
                          className="w-32 rounded border border-slate-300 px-1 py-1 text-xs"
                        >
                          {LESSON_PART_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          name={`durationMin.${p.id}`}
                          defaultValue={p.durationMin}
                          min="1"
                          className="w-12 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <textarea
                          name={`description.${p.id}`}
                          defaultValue={p.description ?? ''}
                          rows={2}
                          className="w-56 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 space-y-1">
                        <button
                          type="submit"
                          name="id"
                          value={p.id}
                          formAction="/api/teadur/naidistunnikava/osa/update"
                          className="block text-brand-600 underline hover:no-underline"
                        >
                          Salvesta
                        </button>
                        <button
                          type="submit"
                          name="id"
                          value={p.id}
                          formAction="/api/teadur/naidistunnikava/osa/delete"
                          className="block text-red-600 underline hover:no-underline"
                        >
                          Eemalda
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
          )}

          {parts.length < MAX_PARTS ? (
            <form action="/api/teadur/naidistunnikava/osa" method="post" className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <input type="hidden" name="sampleLessonPlanId" value={plan.id} />
              <input
                type="text"
                name="title"
                placeholder="Osa nimetus"
                required
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <select name="type" required className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                <option value="">— vali tüüp —</option>
                {LESSON_PART_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="durationMin"
                placeholder="Kestus (min)"
                min="1"
                required
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                name="description"
                placeholder="Lühikirjeldus (1–3 lauset)"
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button className="col-span-2 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Lisa tunniosa
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
              Maksimaalne tunniosade arv ({MAX_PARTS}) on saavutatud.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Kasutatav õppevara ja kodutöö</h2>
          <form action="/api/teadur/naidistunnikava/lisainfo" method="post" className="space-y-3 text-sm">
            <input type="hidden" name="sampleLessonPlanId" value={plan.id} />
            {MATERIAL_OPTIONS.map((m) => (
              <div key={m.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`material.${m.key}`}
                  defaultChecked={m.key in materials}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="w-40 text-slate-700">{m.label}</span>
                <input
                  type="text"
                  name={`materialLink.${m.key}`}
                  defaultValue={materials[m.key] ?? ''}
                  placeholder="Link / fail / lk-d"
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">Kodutöö lühikirjeldus</label>
              <textarea
                name="homeworkText"
                defaultValue={plan.homeworkText ?? ''}
                rows={2}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="homeworkRelated"
                  defaultChecked={plan.homeworkRelated}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Kodutöö on otseselt seotud tänase tunni teemaga
              </label>
            </div>
            <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Salvesta
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
