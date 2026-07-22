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
  type MaterialsAnswers,
} from '@/lib/lessonplan/types';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

export default async function OpetajaTunnikavaPage(
  props: {
    params: Promise<{ planEntryId: string }>;
    searchParams: Promise<{ error?: string; copied?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) redirect('/opetaja');

  const planEntry = await prisma.researchPlanEntry.findUnique({
    where: { id: params.planEntryId },
    include: {
      observerUser: true,
      lessonPlan: {
        include: {
          parts: { orderBy: { order: 'asc' } },
          comments: { include: { authorUser: true }, orderBy: { createdAt: 'asc' } },
          previousLessonPlan: { include: { researchPlanEntry: true } },
          nextLessonPlan: { include: { researchPlanEntry: true } },
          taskUsages: { include: { task: true }, orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });
  if (!planEntry || planEntry.teacherId !== teacher!.id) notFound();

  // Kandidaadid "eelmine tund" valikusse: kõik teised sama õpetaja tunnikavad,
  // uuemad enne (kuupäeva järgi), et hõlpsam oleks värskeim eelnev tund leida.
  const otherLessonPlans = await prisma.lessonPlan.findMany({
    where: {
      researchPlanEntry: { teacherId: teacher!.id, id: { not: planEntry!.id } },
    },
    include: { researchPlanEntry: true },
    orderBy: { researchPlanEntry: { date: 'desc' } },
  });

  const parts = planEntry!.lessonPlan?.parts ?? [];
  const durationSum = parts.reduce((sum, p) => sum + p.durationMin, 0);
  const durationMismatch =
    planEntry!.durationMin != null && parts.length > 0 && durationSum !== planEntry!.durationMin;

  const materials: MaterialsAnswers = planEntry!.lessonPlan?.materialsJson
    ? JSON.parse(planEntry!.lessonPlan.materialsJson)
    : {};

  let matchingSamples: Prisma.SampleLessonPlanGetPayload<{ include: { authorUser: true; parts: true } }>[] = [];
  if (teacher!.gradeBand) {
    const candidates = await prisma.sampleLessonPlan.findMany({
      where: { hidden: false, gradeBand: teacher!.gradeBand },
      include: { authorUser: true, parts: true },
      orderBy: { createdAt: 'desc' },
    });
    const entryTopic = (planEntry!.topic ?? '').trim().toLowerCase();
    matchingSamples = candidates.filter((s) => {
      const methodMatch = s.appliedMethods.some((m) => planEntry!.appliedMethods.includes(m));
      const sampleTopic = (s.topic ?? '').trim().toLowerCase();
      const topicMatch = Boolean(entryTopic) && Boolean(sampleTopic) && (entryTopic.includes(sampleTopic) || sampleTopic.includes(entryTopic));
      return methodMatch || topicMatch;
    });
  }

  const attachedTaskIds = new Set((planEntry!.lessonPlan?.taskUsages ?? []).map((u) => u.taskId));
  let matchingTasks: Prisma.TaskGetPayload<{ include: { authorUser: true } }>[] = [];
  if (teacher!.gradeBand) {
    const taskCandidates = await prisma.task.findMany({
      where: { hidden: false, gradeBand: teacher!.gradeBand },
      include: { authorUser: true },
      orderBy: { createdAt: 'desc' },
    });
    const entryTopic = (planEntry!.topic ?? '').trim().toLowerCase();
    matchingTasks = taskCandidates.filter((t) => {
      if (attachedTaskIds.has(t.id)) return false;
      const methodMatch = t.appliedMethods.some((m) => planEntry!.appliedMethods.includes(m));
      const taskTopic = (t.topic ?? '').trim().toLowerCase();
      const topicMatch = Boolean(entryTopic) && Boolean(taskTopic) && (entryTopic.includes(taskTopic) || taskTopic.includes(entryTopic));
      return methodMatch || topicMatch;
    });
  }

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/opetaja/uuringukava" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi uuringukavva
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">Tunnikava</h1>
          <p className="text-sm text-slate-600 mt-2">
            Kuupäev: {planEntry!.date.toLocaleDateString('et-EE')} <br />
            Algusaeg: {planEntry!.startTime ?? '—'} <br />
            Kestus: {planEntry!.durationMin ? `${planEntry!.durationMin} min` : '—'} <br />
            Klass/rühm: {planEntry!.studentGroup ?? '—'} <br />
            Meetod: {teacher!.method ? METHOD_LABEL[teacher!.method] : '—'} <br />
            Tunni teema: {planEntry!.topic ?? '—'}
          </p>
        </div>

        {(planEntry!.lessonPlan?.previousLessonPlan || planEntry!.lessonPlan?.nextLessonPlan) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            {planEntry!.lessonPlan?.previousLessonPlan ? (
              <a
                href={`/opetaja/tunnikava/${planEntry!.lessonPlan.previousLessonPlan.researchPlanEntryId}`}
                className="text-brand-600 underline hover:no-underline"
              >
                ← Eelmine tund ({planEntry!.lessonPlan.previousLessonPlan.researchPlanEntry.date.toLocaleDateString('et-EE')}
                {planEntry!.lessonPlan.previousLessonPlan.researchPlanEntry.topic
                  ? `, ${planEntry!.lessonPlan.previousLessonPlan.researchPlanEntry.topic}`
                  : ''}
                )
              </a>
            ) : (
              <span />
            )}
            {planEntry!.lessonPlan?.nextLessonPlan && (
              <a
                href={`/opetaja/tunnikava/${planEntry!.lessonPlan.nextLessonPlan.researchPlanEntryId}`}
                className="text-brand-600 underline hover:no-underline"
              >
                Järgmine tund ({planEntry!.lessonPlan.nextLessonPlan.researchPlanEntry.date.toLocaleDateString('et-EE')}
                {planEntry!.lessonPlan.nextLessonPlan.researchPlanEntry.topic
                  ? `, ${planEntry!.lessonPlan.nextLessonPlan.researchPlanEntry.topic}`
                  : ''}
                ) →
              </a>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Seotud tunnikavad</h2>
          <p className="text-sm text-slate-600 mb-3">
            Kui see tund jätkab otseselt mõnd varasemat tundi, märgi see siin — nii saavad tunnikava
            vaatajad (nt vaatlejaks märkinud teadur) hõlpsasti eelmise ja järgmise tunni vahel liikuda.
          </p>
          {otherLessonPlans.length === 0 ? (
            <p className="text-sm text-slate-500">Ühtegi teist enda tunnikava pole veel lisatud.</p>
          ) : (
            <form action="/api/opetaja/tunnikava/eelmine" method="post" className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="planEntryId" value={planEntry!.id} />
              <select
                name="previousLessonPlanId"
                defaultValue={planEntry!.lessonPlan?.previousLessonPlanId ?? ''}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">— pole eelmist tundi / esimene tund —</option>
                {otherLessonPlans.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.researchPlanEntry.date.toLocaleDateString('et-EE')}
                    {lp.researchPlanEntry.topic ? ` — ${lp.researchPlanEntry.topic}` : ''}
                  </option>
                ))}
              </select>
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Salvesta
              </button>
            </form>
          )}
        </div>

        {matchingSamples.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
            <h2 className="font-semibold text-slate-900 mb-1">Näidistunnikavad eeskujuks</h2>
            <p className="text-xs text-slate-500 mb-3">
              Teadurite koostatud näidistunnid, millel on sinuga sama vanuseaste ning sama teema või meetod.
              Sobiva leidmisel saad selle tunniosad ja õppevara kopeerida otse oma tunnikavasse ning seejärel
              koopiat oma tunni jaoks kohandada.
            </p>
            {searchParams.copied === '1' && (
              <Alert kind="success">Näidistunnikava sisu kopeeriti sinu tunnikavasse — kohanda seda allpool oma tunni jaoks.</Alert>
            )}
            {searchParams.error === 'copy_has_parts' && (
              <Alert kind="error">
                Sul on sellel tunnil juba tunniosi lisatud — kopeerimine on lubatud ainult tühjale tunnikavale, et
                mitte sinu senist sisu kogemata üle kirjutada. Eemalda enne kopeerimist oma tunniosad allpool.
              </Alert>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Autor</th>
                  <th className="py-1 pr-2">Meetod</th>
                  <th className="py-1 pr-2">Teema</th>
                  <th className="py-1 pr-2">Tunniosi</th>
                  <th className="py-1 pr-2"></th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {matchingSamples.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{s.authorUser.name}</td>
                    <td className="py-2 pr-2">
                      {s.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'}
                    </td>
                    <td className="py-2 pr-2">{s.topic ?? '—'}</td>
                    <td className="py-2 pr-2">{s.parts.length}</td>
                    <td className="py-2 pr-2">
                      <a href={`/opetaja/naidistunnikava/${s.id}`} className="text-brand-600 underline hover:no-underline">
                        Vaata
                      </a>
                    </td>
                    <td className="py-2 pr-2">
                      <form action="/api/opetaja/tunnikava/kopeeri" method="post">
                        <input type="hidden" name="planEntryId" value={planEntry!.id} />
                        <input type="hidden" name="sampleLessonPlanId" value={s.id} />
                        <button type="submit" className="text-brand-600 underline hover:no-underline">
                          Kopeeri minu tunnikavasse
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {searchParams.error === 'max_parts' && (
          <Alert kind="error">Tunniosi saab olla kuni {MAX_PARTS}. Eemalda mõni osa enne uue lisamist.</Alert>
        )}
        {durationMismatch && (
          <Alert kind="error">
            Tunniosade kestuste summa ({durationSum} min) ei vasta tunni kogukestusele (
            {planEntry!.durationMin} min).
          </Alert>
        )}
        {parts.length > 0 && parts.length < MIN_PARTS && (
          <Alert kind="info">
            Soovituslikult peaks tunnikavas olema vähemalt {MIN_PARTS} tunniosa — hetkel on lisatud {parts.length}.
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Tunni osad</h2>
          {parts.length === 0 ? (
            <p className="text-sm text-slate-500 mb-4">Tunniosi pole veel lisatud.</p>
          ) : (
            <form method="post" className="mb-6">
              <table className="w-full text-xs min-w-[720px]">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">#</th>
                    <th className="py-1 pr-2">Osa nimetus</th>
                    <th className="py-1 pr-2">Tüüp</th>
                    <th className="py-1 pr-2">Kestus</th>
                    <th className="py-1 pr-2">Lühikirjeldus</th>
                    <th className="py-1 pr-2">Vaatlejale</th>
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
                              formAction="/api/opetaja/tunnikava/osa/ules"
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
                              formAction="/api/opetaja/tunnikava/osa/alla"
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
                          className="w-40 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <textarea
                          name={`observerNote.${p.id}`}
                          defaultValue={p.observerNote ?? ''}
                          rows={2}
                          placeholder="valikuline"
                          className="w-32 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-2 space-y-1">
                        <button
                          type="submit"
                          name="id"
                          value={p.id}
                          formAction="/api/opetaja/tunnikava/osa/update"
                          className="block text-brand-600 underline hover:no-underline"
                        >
                          Salvesta
                        </button>
                        <button
                          type="submit"
                          name="id"
                          value={p.id}
                          formAction="/api/opetaja/tunnikava/osa/delete"
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
            <form action="/api/opetaja/tunnikava/osa" method="post" className="grid grid-cols-2 gap-3 pt-3">
              <input type="hidden" name="planEntryId" value={planEntry!.id} />
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
              <input
                type="text"
                name="observerNote"
                placeholder="Vaatlejale (valikuline)"
                className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
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
          <h2 className="font-semibold text-slate-900 mb-3">Kasutatav õppevara ja kodutöö</h2>
          <form action="/api/opetaja/tunnikava/lisainfo" method="post" className="space-y-3 text-sm">
            <input type="hidden" name="planEntryId" value={planEntry!.id} />
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
                defaultValue={planEntry!.lessonPlan?.homeworkText ?? ''}
                rows={2}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="homeworkRelated"
                  defaultChecked={planEntry!.lessonPlan?.homeworkRelated ?? false}
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

        {planEntry!.lessonPlan && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
            <h2 className="font-semibold text-slate-900 mb-1">Ülesannete pank</h2>
            <p className="text-xs text-slate-500 mb-3">
              Lisa tunnikavasse ülesandeid ja töölehti avalikust{' '}
              <a href="/ulesanded" className="text-brand-600 underline hover:no-underline">
                ülesannete pangast
              </a>
              .
            </p>

            {planEntry!.lessonPlan.taskUsages.length > 0 && (
              <table className="w-full text-sm mb-4">
                <tbody>
                  {planEntry!.lessonPlan.taskUsages.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">{u.task.title}</td>
                      <td className="py-2 pr-2">
                        <a href={`/ulesanded/${u.task.id}`} className="text-brand-600 underline hover:no-underline">
                          Vaata
                        </a>
                      </td>
                      <td className="py-2">
                        <form action="/api/opetaja/tunnikava/ulesanne/eemalda" method="post">
                          <input type="hidden" name="planEntryId" value={planEntry!.id} />
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
                        <form action="/api/opetaja/tunnikava/ulesanne" method="post">
                          <input type="hidden" name="planEntryId" value={planEntry!.id} />
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
        )}

        {planEntry!.observerUser && planEntry!.lessonPlan && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">
              Vaatleja ({planEntry!.observerUser.name}) kommentaarid
            </h2>
            {planEntry!.lessonPlan.comments.length === 0 ? (
              <p className="text-sm text-slate-500">Kommentaare pole veel lisatud.</p>
            ) : (
              <ul className="space-y-2">
                {planEntry!.lessonPlan.comments.map((c) => (
                  <li key={c.id} className="text-sm text-slate-700 border-b border-slate-100 pb-2">
                    <span className="text-slate-500">
                      [{c.timing === 'ENNE' ? 'enne tundi' : 'pärast tundi'}] {c.authorUser.name},{' '}
                      {c.createdAt.toLocaleString('et-EE')}:
                    </span>{' '}
                    {c.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </>
  );
}
