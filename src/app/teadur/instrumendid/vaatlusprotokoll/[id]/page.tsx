import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { LESSON_PART_TYPE_LABEL } from '@/lib/lessonplan/types';
import {
  OBSERVATION_DOMAINS,
  INCIDENT_CONSTRUCT_OPTIONS,
  type ObservationRatings,
  type IncidentLogRow,
  type ObservationSummary,
} from '@/lib/observation/lisa6';

const INCIDENT_ROW_COUNT = 8;
const RATING_VALUES = [1, 2, 3, 4];

export default async function TeadurVaatlusprotokollKatsetusPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const plan = await prisma.sampleLessonPlan.findUnique({
    where: { id: params.id },
    include: { parts: { orderBy: { order: 'asc' } } },
  });
  if (!plan || plan.authorUserId !== session.userId) notFound();

  const parts = plan.parts;
  const instrumentCode = `lisa6:${plan.id}`;

  const trial = await prisma.instrumentTrial.findUnique({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode } },
  });

  const stored: { ratings?: ObservationRatings; incidents?: IncidentLogRow[]; summary?: Partial<ObservationSummary> } =
    trial?.answersJson ? JSON.parse(trial.answersJson) : {};
  const ratings = stored.ratings ?? {};
  const incidents = stored.incidents ?? [];
  const summary = stored.summary ?? {};

  const incidentRows: IncidentLogRow[] = Array.from({ length: INCIDENT_ROW_COUNT }, (_, i) => ({
    timeMin: incidents[i]?.timeMin ?? '',
    description: incidents[i]?.description ?? '',
    construct: incidents[i]?.construct ?? '',
    whoWith: incidents[i]?.whoWith ?? '',
  }));

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a
          href="/teadur/instrumendid/vaatlusprotokoll"
          className="inline-block text-sm text-brand-600 underline hover:no-underline"
        >
          ← Tagasi valiku juurde
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">Tunnivaatlusprotokoll (katsetus)</h1>
          <p className="text-sm text-slate-600 mt-2">Näidistund: {plan.topic ?? '(teema määramata)'}</p>
          {trial?.submittedAt && (
            <Alert kind="info">
              Katsetasid seda protokolli esmakordselt {trial.submittedAt.toLocaleDateString('et-EE')}. Vorm on
              eeltäidetud senise sisuga.
            </Alert>
          )}
        </div>

        {parts.length === 0 ? (
          <Alert kind="error">Sellel näidistunnil pole tunniosi.</Alert>
        ) : (
          <form action="/api/teadur/instrumendid/vaatlusprotokoll" method="post" className="space-y-6">
            <input type="hidden" name="sampleLessonPlanId" value={plan.id} />

            {parts.map((p, idx) => {
              const checkpointRatings = ratings[p.id] ?? {};
              return (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                  <h2 className="font-semibold text-slate-900 mb-1">
                    Tunniosa {idx + 1}: {p.title}
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    {LESSON_PART_TYPE_LABEL[p.type]} · {p.durationMin} min
                    {p.description ? ` · ${p.description}` : ''}
                  </p>

                  {OBSERVATION_DOMAINS.map((domain) => (
                    <div key={domain.key} className="mb-4">
                      <p className="text-sm font-medium text-slate-800">
                        {domain.key}. {domain.label}
                      </p>
                      <table className="w-full text-xs mt-2 min-w-[600px]">
                        <tbody>
                          {domain.items.map((item) => {
                            const current = checkpointRatings[item.key];
                            return (
                              <tr key={item.key} className="border-b border-slate-100 align-top">
                                <td className="py-2 pr-2 w-64">{item.label}</td>
                                <td className="py-2 pr-2">
                                  <div className="flex gap-2">
                                    {RATING_VALUES.map((v) => (
                                      <label key={v} className="flex items-center gap-1">
                                        <input
                                          type="radio"
                                          name={`rating.${p.id}.${item.key}`}
                                          value={v}
                                          defaultChecked={current?.value === v}
                                          required
                                        />
                                        {v}
                                      </label>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-2 pr-2 w-56">
                                  <input
                                    type="text"
                                    name={`note.${p.id}.${item.key}`}
                                    defaultValue={current?.note ?? ''}
                                    placeholder="Märkus / tõendus"
                                    className="w-full rounded border border-slate-300 px-1 py-1 text-xs"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              );
            })}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
              <h2 className="font-semibold text-slate-900 mb-1">Intsidentide ja tähelepanekute logi</h2>
              <p className="text-xs text-slate-500 mb-4">
                Konstrukti lühikoodid: {INCIDENT_CONSTRUCT_OPTIONS.join(' / ')}.
              </p>
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1 pr-2">Aeg (min)</th>
                    <th className="py-1 pr-2">Mis juhtus</th>
                    <th className="py-1 pr-2">Konstrukt</th>
                    <th className="py-1 pr-2">Kellega seotud</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentRows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1 pr-2">
                        <input
                          type="text"
                          name={`incident.${i}.timeMin`}
                          defaultValue={row.timeMin}
                          className="w-16 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          type="text"
                          name={`incident.${i}.description`}
                          defaultValue={row.description}
                          className="w-full rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <select
                          name={`incident.${i}.construct`}
                          defaultValue={row.construct}
                          className="rounded border border-slate-300 px-1 py-1 text-xs"
                        >
                          <option value="">—</option>
                          {INCIDENT_CONSTRUCT_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          type="text"
                          name={`incident.${i}.whoWith`}
                          defaultValue={row.whoWith}
                          className="w-32 rounded border border-slate-300 px-1 py-1 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Üldkokkuvõte</h2>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Lühikokkuvõte tunnist (3–5 lauset)</span>
                <textarea
                  name="shortSummary"
                  defaultValue={summary.shortSummary ?? ''}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">
                  Kas ja kuidas tund järgis kavandatud meetodi põhivõtteid?
                </span>
                <textarea
                  name="methodFidelity"
                  defaultValue={summary.methodFidelity ?? ''}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Mis üllatas või erines oodatust?</span>
                <textarea
                  name="surprises"
                  defaultValue={summary.surprises ?? ''}
                  rows={2}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1">Soovitused</span>
                <textarea
                  name="recommendations"
                  defaultValue={summary.recommendations ?? ''}
                  rows={2}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Salvesta
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
