import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { LESSON_PART_TYPE_LABEL, MATERIAL_OPTIONS, type MaterialsAnswers } from '@/lib/lessonplan/types';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

export default async function VaatlusDetailPage(props: { params: Promise<{ planEntryId: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) redirect('/login');

  const entry = await prisma.researchPlanEntry.findUnique({
    where: { id: params.planEntryId },
    include: {
      teacher: { include: { user: true, school: true } },
      lessonPlan: { include: { parts: { orderBy: { order: 'asc' } }, comments: { include: { authorUser: true }, orderBy: { createdAt: 'asc' } } } },
    },
  });
  if (!entry || entry.observerUserId !== session.userId) notFound();
  if (!entry.lessonPlan) notFound();

  const lessonPlan = entry.lessonPlan;
  const materials: MaterialsAnswers = lessonPlan.materialsJson ? JSON.parse(lessonPlan.materialsJson) : {};
  const beforeComments = lessonPlan.comments.filter((c) => c.timing === 'ENNE');
  const afterComments = lessonPlan.comments.filter((c) => c.timing === 'JAREL');

  const reviewDeadline = new Date(entry.date);
  reviewDeadline.setDate(reviewDeadline.getDate() - 7);
  const reviewOverdue = beforeComments.length === 0 && new Date() >= reviewDeadline && entry.date >= new Date();

  return (
    <>
      <Header userLabel={`${session.name} (${session.role === 'TEADUR' ? 'teadur' : 'õpetaja-uurija'})`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/vaatlused" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi vaatluste juurde
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">Tunnikava (vaatleja vaade)</h1>
          <p className="text-sm text-slate-600 mt-2">
            Kool: {entry.teacher.school.name} <br />
            Õpetaja: {entry.teacher.user.name} <br />
            Kuupäev: {entry.date.toLocaleDateString('et-EE')} <br />
            Algusaeg: {entry.startTime ?? '—'} <br />
            Kestus: {entry.durationMin ? `${entry.durationMin} min` : '—'} <br />
            Klass/rühm: {entry.studentGroup ?? '—'} <br />
            Meetod: {entry.teacher.method ? METHOD_LABEL[entry.teacher.method] : '—'} <br />
            Tunni teema: {entry.topic ?? '—'}
          </p>
        </div>

        {reviewOverdue && (
          <Alert kind="info">
            Palun vaata tunnikava üle ja lisa vajadusel kommentaar enne tundi — soovituslik tähtaeg oli{' '}
            {reviewDeadline.toLocaleDateString('et-EE')} (üks nädal enne tundi).
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Tunni osad</h2>
          {lessonPlan.parts.length === 0 ? (
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
                  <th className="py-1 pr-2">Vaatlejale</th>
                </tr>
              </thead>
              <tbody>
                {lessonPlan.parts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2">{p.order}</td>
                    <td className="py-2 pr-2">{p.title}</td>
                    <td className="py-2 pr-2">{LESSON_PART_TYPE_LABEL[p.type]}</td>
                    <td className="py-2 pr-2">{p.durationMin} min</td>
                    <td className="py-2 pr-2">{p.description ?? '—'}</td>
                    <td className="py-2 pr-2">{p.observerNote ?? '—'}</td>
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
                {materials[m.key] ? `: ${materials[m.key]}` : ''}
              </li>
            ))}
            {Object.keys(materials).length === 0 && <li className="text-slate-500">Õppevara pole märgitud.</li>}
          </ul>
          {lessonPlan.homeworkText && (
            <p className="text-sm text-slate-700 mt-3">
              Kodutöö: {lessonPlan.homeworkText}{' '}
              {lessonPlan.homeworkRelated && <span className="text-slate-500">(seotud tänase teemaga)</span>}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Kommentaarid enne tundi</h2>
          <ul className="space-y-2 mb-4">
            {beforeComments.length === 0 && <li className="text-sm text-slate-500">Kommentaare pole veel.</li>}
            {beforeComments.map((c) => (
              <li key={c.id} className="text-sm text-slate-700 border-b border-slate-100 pb-2">
                <span className="text-slate-500">
                  {c.authorUser.name}, {c.createdAt.toLocaleString('et-EE')}:
                </span>{' '}
                {c.text}
              </li>
            ))}
          </ul>
          <form action="/api/vaatlused/kommentaar" method="post" className="flex gap-2">
            <input type="hidden" name="planEntryId" value={entry.id} />
            <input type="hidden" name="timing" value="ENNE" />
            <input
              type="text"
              name="text"
              placeholder="Lisa kommentaar enne tundi"
              required
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button className="rounded-md bg-brand-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-brand-700">
              Lisa
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Kommentaarid pärast tundi</h2>
          <ul className="space-y-2 mb-4">
            {afterComments.length === 0 && <li className="text-sm text-slate-500">Kommentaare pole veel.</li>}
            {afterComments.map((c) => (
              <li key={c.id} className="text-sm text-slate-700 border-b border-slate-100 pb-2">
                <span className="text-slate-500">
                  {c.authorUser.name}, {c.createdAt.toLocaleString('et-EE')}:
                </span>{' '}
                {c.text}
              </li>
            ))}
          </ul>
          <form action="/api/vaatlused/kommentaar" method="post" className="flex gap-2">
            <input type="hidden" name="planEntryId" value={entry.id} />
            <input type="hidden" name="timing" value="JAREL" />
            <input
              type="text"
              name="text"
              placeholder="Lisa kommentaar pärast tundi"
              required
              className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button className="rounded-md bg-brand-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-brand-700">
              Lisa
            </button>
          </form>
        </div>

        <a
          href={`/vaatlused/${entry.id}/protokoll`}
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Tunnivaatlusprotokoll</h2>
          <p className="text-sm text-slate-600 mt-1">Täida struktureeritud hinnangud, intsidentide logi ja üldkokkuvõte.</p>
        </a>
      </main>
    </>
  );
}
