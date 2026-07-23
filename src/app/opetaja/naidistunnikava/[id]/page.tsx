import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { LESSON_PART_TYPE_LABEL, MATERIAL_OPTIONS, type MaterialsAnswers } from '@/lib/lessonplan/types';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

const GRADE_BAND_LABEL: Record<string, string> = {
  '4-6': '4.–6. klass',
  '7-9': '7.–9. klass',
  '10-12': '10.–12. klass',
};

export default async function NaidistunnikavaVaatePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) redirect('/login');

  const plan = await prisma.sampleLessonPlan.findUnique({
    where: { id: params.id },
    include: { authorUser: true, parts: { orderBy: { order: 'asc' } } },
  });
  if (!plan || plan.hidden) notFound();

  const materials: MaterialsAnswers = plan.materialsJson ? JSON.parse(plan.materialsJson) : {};

  return (
    <>
      <Header userLabel={`${session.name} (${session.role === 'TEADUR' ? 'teadur' : 'õpetaja-uurija'})`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a
          href={session.role === 'TEADUR' ? '/teadur' : '/opetaja/uuringukava'}
          className="inline-block text-sm text-brand-600 underline hover:no-underline"
        >
          ← Tagasi
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">Näidistunnikava</h1>
          <p className="text-sm text-slate-600 mt-2">
            Autor: {plan.authorUser.name} (teadur) <br />
            Vanuseaste: {plan.gradeBand ? GRADE_BAND_LABEL[plan.gradeBand] : '—'} <br />
            Meetod: {plan.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'} <br />
            Kestus: {plan.durationMin ? `${plan.durationMin} min` : '—'} <br />
            Tunni teema: {plan.topic ?? '—'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Tunni osad</h2>
          {plan.parts.length === 0 ? (
            <p className="text-sm text-slate-500">Tunniosi pole lisatud.</p>
          ) : (
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">#</th>
                  <th className="py-1 pr-2">Osa nimetus</th>
                  <th className="py-1 pr-2">Tüüp</th>
                  <th className="py-1 pr-2">Kestus</th>
                  <th className="py-1 pr-2">Lühikirjeldus</th>
                </tr>
              </thead>
              <tbody>
                {plan.parts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2">{p.order}</td>
                    <td className="py-2 pr-2">{p.title}</td>
                    <td className="py-2 pr-2">{LESSON_PART_TYPE_LABEL[p.type]}</td>
                    <td className="py-2 pr-2">{p.durationMin} min</td>
                    <td className="py-2 pr-2">{p.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Kasutatav õppevara ja kodutöö</h2>
          <ul className="text-sm text-slate-700 space-y-1">
            {MATERIAL_OPTIONS.filter((m) => m.key in materials).map((m) => (
              <li key={m.key}>
                {m.label}
                {materials[m.key]?.length ? `: ${materials[m.key].join(', ')}` : ''}
              </li>
            ))}
            {Object.keys(materials).length === 0 && <li className="text-slate-500">Õppevara pole märgitud.</li>}
          </ul>
          {plan.homeworkText && (
            <p className="text-sm text-slate-700 mt-3">
              Kodutöö: {plan.homeworkText}{' '}
              {plan.homeworkRelated && <span className="text-slate-500">(seotud tänase teemaga)</span>}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
