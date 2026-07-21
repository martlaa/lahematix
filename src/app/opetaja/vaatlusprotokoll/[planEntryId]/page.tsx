import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { LESSON_PART_TYPE_LABEL } from '@/lib/lessonplan/types';
import {
  OBSERVATION_DOMAINS,
  type ObservationRatings,
  type IncidentLogRow,
  type ObservationSummary,
} from '@/lib/observation/lisa6';

export default async function OpetajaVaatlusprotokollPage(props: { params: Promise<{ planEntryId: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) redirect('/opetaja');

  const entry = await prisma.researchPlanEntry.findUnique({
    where: { id: params.planEntryId },
    include: {
      lessonPlan: {
        include: {
          parts: { orderBy: { order: 'asc' } },
          observationProtocols: {
            where: { publishedAt: { not: null } },
            include: { observerUser: true },
            orderBy: { publishedAt: 'asc' },
          },
        },
      },
    },
  });
  if (!entry || entry.teacherId !== teacher.id) notFound();
  if (!entry.lessonPlan || entry.lessonPlan.observationProtocols.length === 0) notFound();

  const parts = entry.lessonPlan.parts;
  const protocols = entry.lessonPlan.observationProtocols;

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a
          href="/opetaja/uuringukava"
          className="inline-block text-sm text-brand-600 underline hover:no-underline"
        >
          ← Tagasi uuringukavva
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">Tunnivaatlusprotokoll(id)</h1>
          <p className="text-sm text-slate-600 mt-2">
            Kuupäev: {entry.date.toLocaleDateString('et-EE')} <br />
            Tunni teema: {entry.topic ?? '—'} <br />
            Avalikustatud protokolle: {protocols.length}
          </p>
        </div>

        {protocols.map((protocol) => {
          const ratings: ObservationRatings = protocol.ratingsJson ? JSON.parse(protocol.ratingsJson) : {};
          const incidents: IncidentLogRow[] = protocol.incidentsJson ? JSON.parse(protocol.incidentsJson) : [];
          const summary: Partial<ObservationSummary> = protocol.summaryJson ? JSON.parse(protocol.summaryJson) : {};

          return (
            <div key={protocol.id} className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900">
                  Vaatleja: {protocol.observerUser.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Avalikustatud {protocol.publishedAt?.toLocaleDateString('et-EE')}
                </p>
              </div>

              {parts.map((p, idx) => {
                const checkpointRatings = ratings[p.id] ?? {};
                return (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Tunniosa {idx + 1}: {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {LESSON_PART_TYPE_LABEL[p.type]} · {p.durationMin} min
                    </p>
                    {OBSERVATION_DOMAINS.map((domain) => (
                      <div key={domain.key} className="mb-4">
                        <p className="text-sm font-medium text-slate-800">
                          {domain.key}. {domain.label}
                        </p>
                        <table className="w-full text-xs mt-2 min-w-[500px]">
                          <tbody>
                            {domain.items.map((item) => {
                              const r = checkpointRatings[item.key];
                              return (
                                <tr key={item.key} className="border-b border-slate-100 align-top">
                                  <td className="py-2 pr-2 w-64">{item.label}</td>
                                  <td className="py-2 pr-2 w-10 font-semibold">{r?.value ?? '—'}</td>
                                  <td className="py-2 pr-2 text-slate-600">{r?.note || '—'}</td>
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
                <h3 className="font-semibold text-slate-900 mb-3">Intsidentide ja tähelepanekute logi</h3>
                {incidents.length === 0 ? (
                  <p className="text-sm text-slate-500">Intsidente pole märgitud.</p>
                ) : (
                  <table className="w-full text-xs min-w-[600px]">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-1 pr-2">Aeg (min)</th>
                        <th className="py-1 pr-2">Mis juhtus</th>
                        <th className="py-1 pr-2">Konstrukt</th>
                        <th className="py-1 pr-2">Kellega seotud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-1 pr-2">{row.timeMin}</td>
                          <td className="py-1 pr-2">{row.description}</td>
                          <td className="py-1 pr-2">{row.construct}</td>
                          <td className="py-1 pr-2">{row.whoWith}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
                <h3 className="font-semibold text-slate-900">Üldkokkuvõte</h3>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Lühikokkuvõte:</span> {summary.shortSummary || '—'}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Meetodi järgimine:</span> {summary.methodFidelity || '—'}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Üllatused:</span> {summary.surprises || '—'}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Soovitused:</span> {summary.recommendations || '—'}
                </p>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}
