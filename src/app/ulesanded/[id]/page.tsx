import { notFound } from 'next/navigation';
import { getTaskBankDetail } from '@/lib/taskbank';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { GRADE_BAND_LABEL, METHOD_LABEL } from '@/lib/tasks/types';
import { PublicNav } from '@/components/PublicNav';

export const dynamic = 'force-dynamic';

const RATING_VALUES = [1, 2, 3, 4, 5];

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function UlesandeDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const task = await getTaskBankDetail(params.id);
  if (!task) notFound();

  const session = await getSession();
  const canRate = Boolean(session.userId) && (session.role === 'OPETAJA' || session.role === 'TEADUR');
  const ownRating = canRate
    ? await prisma.taskRating.findUnique({
        where: { taskId_userId: { taskId: task.id, userId: session.userId! } },
      })
    : null;

  return (
    <>
      <PublicNav active="ulesanded" />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/ulesanded" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi ülesannete panka
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">{task.title}</h1>
          <p className="text-sm text-slate-600 mt-2">
            Vanuseaste: {task.gradeBand ? GRADE_BAND_LABEL[task.gradeBand] : '—'} <br />
            Teema: {task.topic ?? '—'} <br />
            Meetod: {task.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'} <br />
            Autor: {task.creditedAuthor ?? task.authorName} <br />
            Lisas rakendusse: {task.authorName} ({task.authorRoleLabel})
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            {task.hasFile && (
              <a
                href={`/api/ulesanded/${task.id}/fail`}
                className="inline-block rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
              >
                Laadi alla fail{task.fileSizeBytes ? ` (${formatFileSize(task.fileSizeBytes)})` : ''}
              </a>
            )}
            {task.hasLink && (
              <a
                href={`/api/ulesanded/${task.id}/link`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Ava tööleht (väline link)
              </a>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Populaarsus</h2>
          <p className="text-sm text-slate-700">
            Allalaadimisi: {task.downloadCount} <br />
            Taaskasutatud tunnikavades: {task.usageCount} <br />
            Kasutajate keskmine hinnang: {task.avgRating !== null ? `${task.avgRating.toFixed(1)} / 5 (${task.ratingCount} hinnangut)` : 'Hinnanguid pole veel'}
          </p>
        </div>

        {canRate && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Hinda seda ülesannet</h2>
            <form action={`/api/ulesanded/${task.id}/hinnang`} method="post" className="flex items-center gap-4">
              <div className="flex gap-3">
                {RATING_VALUES.map((v) => (
                  <label key={v} className="flex items-center gap-1 text-sm">
                    <input type="radio" name="value" value={v} defaultChecked={ownRating?.value === v} required />
                    {v}
                  </label>
                ))}
              </div>
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                {ownRating ? 'Uuenda hinnangut' : 'Salvesta hinnang'}
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
