import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import {
  MIN_PARTS,
  MAX_PARTS,
  LESSON_PART_TYPE_OPTIONS,
  MATERIAL_OPTIONS,
  MATERIAL_ITEMS_PER_TYPE,
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
    include: {
      parts: { orderBy: { order: 'asc' } },
      previousSampleLessonPlan: true,
      nextSampleLessonPlan: true,
      taskUsages: { include: { task: true }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!plan || plan.authorUserId !== session.userId) notFound();

  // Kandidaadid "eelmine tund" valikusse: kõik teised sama teaduri näidistunnid.
  const otherSamplePlans = await prisma.sampleLessonPlan.findMany({
    where: { authorUserId: session.userId, id: { not: plan.id } },
    orderBy: { createdAt: 'desc' },
  });

  const parts = plan.parts;
  const durationSum = parts.reduce((sum, p) => sum + p.durationMin, 0);
  const durationMismatch = plan.durationMin != null && parts.length > 0 && durationSum !== plan.durationMin;
  const materials: MaterialsAnswers = plan.materialsJson ? JSON.parse(plan.materialsJson) : {};

  const attachedTaskIds = new Set(plan.taskUsages.map((u) => u.taskId));
  let matchingTasks: Prisma.TaskGetPayload<{ include: { authorUser: true } }>[] = [];
  if (plan.gradeBand) {
    const taskCandidates = await prisma.task.findMany({
      where: { hidden: false, gradeBand: plan.gradeBand },
      include: { authorUser: true },
      orderBy: { createdAt: 'desc' },
    });
    const planTopic = (plan.topic ?? '').trim().toLowerCase();
    matchingTasks = taskCandidates.filter((t) => {
      if (attachedTaskIds.has(t.id)) return false;
      const methodMatch = t.appliedMethods.some((m) => plan.appliedMethods.includes(m));
      const taskTopic = (t.topic ?? '').trim().toLowerCase();
      const topicMatch = Boolean(planTopic) && Boolean(taskTopic) && (planTopic.includes(taskTopic) || taskTopic.includes(planTopic));
      return methodMatch || topicMatch;
    });
  }

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
            <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="publishToGallery"
                defaultChecked={Boolean(plan.publishedToGalleryAt)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Avalikusta see näidistund avalikus galeriis (CC-BY litsentsiga)
            </label>
            <button className="col-span-2 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Salvesta
            </button>
          </form>
        </div>

        {(plan.previousSampleLessonPlan || plan.nextSampleLessonPlan) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            {plan.previousSampleLessonPlan ? (
              <a
                href={`/teadur/naidistunnikavad/${plan.previousSampleLessonPlan.id}`}
                className="text-brand-600 underline hover:no-underline"
              >
                ← Eelmine tund{plan.previousSampleLessonPlan.topic ? ` (${plan.previousSampleLessonPlan.topic})` : ''}
              </a>
            ) : (
              <span />
            )}
            {plan.nextSampleLessonPlan && (
              <a
                href={`/teadur/naidistunnikavad/${plan.nextSampleLessonPlan.id}`}
                className="text-brand-600 underline hover:no-underline"
              >
                Järgmine tund{plan.nextSampleLessonPlan.topic ? ` (${plan.nextSampleLessonPlan.topic})` : ''} →
              </a>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Seotud näidistunnid</h2>
          <p className="text-sm text-slate-600 mb-3">
            Kui see näidistund jätkab otseselt mõnd teist sinu näidistundi, märgi see siin — nii moodustub
            terviklik järjestikuste näidistundide komplekt, mida õpetajad ja teised näidistunnikavade
            vaatajad saavad eelmise/järgmise tunni vahel liikudes läbi vaadata.
          </p>
          {otherSamplePlans.length === 0 ? (
            <p className="text-sm text-slate-500">Ühtegi teist enda näidistundi pole veel lisatud.</p>
          ) : (
            <form action="/api/teadur/naidistunnikava/eelmine" method="post" className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="sampleLessonPlanId" value={plan.id} />
              <select
                name="previousSampleLessonPlanId"
                defaultValue={plan.previousSampleLessonPlanId ?? ''}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">— pole eelmist tundi / esimene tund —</option>
                {otherSamplePlans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.topic ? s.topic : '(teema määramata)'} — {s.createdAt.toLocaleDateString('et-EE')}
                  </option>
                ))}
              </select>
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Salvesta
              </button>
            </form>
          )}
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
            <p className="text-sm text-slate-500 mb-4">Tunniosi pole veel lisatud.</p>
          ) : (
            <form method="post" className="mb-6">
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
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1">
                          <span>{p.order}</span>
                          <span className="flex flex-col leading-none">
                            <button
                              type="submit"
                              name="id"
                              value={p.id}
                              formAction="/api/teadur/naidistunnikava/osa/ules"
                              disabled={p.order === 1}
                              title="Liiguta tunniosa üles"
                              className="text-slate-500 hover:text-brand-600 disabled:opacity-20 disabled:hover:text-slate-500"
                            >
                              ▲
                            </button>
                            <button
                              type="submit"
                              name="id"
                              value={p.id}
                              formAction="/api/teadur/naidistunnikava/osa/alla"
                              disabled={p.order === parts.length}
                              title="Liiguta tunniosa alla"
                              className="text-slate-500 hover:text-brand-600 disabled:opacity-20 disabled:hover:text-slate-500"
                            >
                              ▼
                            </button>
                          </span>
                        </div>
                      </td>
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

          <p className="text-xs text-slate-500 border-t border-slate-100 pt-4">
            Tunniosi võib olla {MIN_PARTS}–{MAX_PARTS} (praegu lisatud {parts.length}).
          </p>

          {parts.length < MAX_PARTS ? (
            <form action="/api/teadur/naidistunnikava/osa" method="post" className="grid grid-cols-2 gap-3 pt-3">
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
            <p className="text-xs text-slate-500 pt-3">Maksimaalne tunniosade arv ({MAX_PARTS}) on saavutatud.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Kasutatav õppevara ja kodutöö</h2>
          <p className="text-xs text-slate-500 mb-3">
            Igat tüüpi saab lisada mitu (nt mitu esitlust või mitu ülesannet) — tühjaks jäetud rida eemaldub
            salvestamisel.
          </p>
          <form action="/api/teadur/naidistunnikava/lisainfo" method="post" className="space-y-3 text-sm">
            <input type="hidden" name="sampleLessonPlanId" value={plan.id} />
            {MATERIAL_OPTIONS.map((m) => {
              const items = materials[m.key] ?? [];
              return (
                <div key={m.key} className="border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      name={`material.${m.key}`}
                      defaultChecked={m.key in materials}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="w-40 text-slate-700">{m.label}</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {Array.from({ length: MATERIAL_ITEMS_PER_TYPE }, (_, i) => (
                      <input
                        key={i}
                        type="text"
                        name={`materialLink.${m.key}.${i}`}
                        defaultValue={items[i] ?? ''}
                        placeholder={i === 0 ? 'Link / fail / lk-d' : 'Veel üks link / fail / lk-d'}
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-1">Ülesannete pank</h2>
          <p className="text-xs text-slate-500 mb-3">
            Lisa näidistunnikavasse ülesandeid ja töölehti avalikust{' '}
            <a href="/ulesanded" className="text-brand-600 underline hover:no-underline">
              ülesannete pangast
            </a>
            .
          </p>

          {plan.taskUsages.length > 0 && (
            <table className="w-full text-sm mb-4">
              <tbody>
                {plan.taskUsages.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{u.task.title}</td>
                    <td className="py-2 pr-2">
                      <a href={`/ulesanded/${u.task.id}`} className="text-brand-600 underline hover:no-underline">
                        Vaata
                      </a>
                    </td>
                    <td className="py-2">
                      <form action="/api/teadur/naidistunnikava/ulesanne/eemalda" method="post">
                        <input type="hidden" name="sampleLessonPlanId" value={plan.id} />
                        <input type="hidden" name="taskId" value={u.task.id} />
                        <button type="submit" className="text-red-600 underline hover:no-underline">
                          Eemalda
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {matchingTasks.length === 0 ? (
            <p className="text-sm text-slate-500">
              Praegu ei leitud sinu vanuseastme/meetodi/teemaga sobivaid ülesandeid pangast.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Pealkiri</th>
                  <th className="py-1 pr-2">Teema</th>
                  <th className="py-1 pr-2">Autor</th>
                  <th className="py-1 pr-2"></th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {matchingTasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{t.title}</td>
                    <td className="py-2 pr-2">{t.topic ?? '—'}</td>
                    <td className="py-2 pr-2">{t.creditedAuthor ?? t.authorUser.name}</td>
                    <td className="py-2 pr-2">
                      <a href={`/ulesanded/${t.id}`} className="text-brand-600 underline hover:no-underline">
                        Vaata
                      </a>
                    </td>
                    <td className="py-2 pr-2">
                      <form action="/api/teadur/naidistunnikava/ulesanne" method="post">
                        <input type="hidden" name="sampleLessonPlanId" value={plan.id} />
                        <input type="hidden" name="taskId" value={t.id} />
                        <button type="submit" className="text-brand-600 underline hover:no-underline">
                          Lisa tunnikavasse
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
