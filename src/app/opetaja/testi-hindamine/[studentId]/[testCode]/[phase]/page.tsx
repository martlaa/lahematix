import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert, PrimaryButton } from '@/components/ui';
import { getTestByCode } from '@/lib/tests';
import type { TestAnswers } from '@/lib/tests';

const PHASE_LABEL: Record<string, string> = { EEL: 'Eelmõõtmine', JAREL: 'Järelmõõtmine' };

export default async function TestiHindaminePage({
  params,
}: {
  params: { studentId: string; testCode: string; phase: string };
}) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) redirect('/opetaja');

  const phase = params.phase === 'EEL' || params.phase === 'JAREL' ? params.phase : undefined;
  if (!phase) notFound();

  const definition = getTestByCode(params.testCode);
  if (!definition) notFound();

  const student = await prisma.student.findUnique({ where: { id: params.studentId } });
  if (!student || student.teacherId !== teacher!.id) notFound();

  const submission = await prisma.testSubmission.findUnique({
    where: { testCode_phase_studentId: { testCode: definition.code, phase: phase!, studentId: student.id } },
    include: { photos: { orderBy: { uploadedAt: 'asc' } }, grading: true },
  });

  const answers: TestAnswers = submission?.answersJson ? JSON.parse(submission.answersJson) : {};
  const existingScores: Record<string, Record<string, number>> = submission?.grading
    ? JSON.parse(submission.grading.scoresJson)
    : {};

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/opetaja/opilased" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi õpilaste nimekirja
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            {definition.title} — {PHASE_LABEL[phase!]}
          </h1>
          <p className="text-slate-600 mt-1 text-sm">Õpilane: {student.name}</p>
          <p className="text-xs text-slate-500 mt-2">{definition.gradingIntro}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Paberil sooritatud testi fotod</h2>
          {submission && submission.photos.length > 0 && (
            <ul className="mb-4 space-y-1">
              {submission.photos.map((photo) => (
                <li key={photo.id} className="text-sm">
                  <a
                    href={`/api/opetaja/testi-foto/${photo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 underline hover:no-underline"
                  >
                    {photo.originalName}
                  </a>
                  <span className="text-xs text-slate-400 ml-2">
                    {photo.uploadedAt.toLocaleString('et-EE')}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form
            action="/api/opetaja/testi-foto"
            method="post"
            encType="multipart/form-data"
            className="flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="testCode" value={definition.code} />
            <input type="hidden" name="phase" value={phase!} />
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Laadi fotod üles
            </button>
          </form>
        </div>

        <form action="/api/opetaja/testi-hindamine" method="post">
          <input type="hidden" name="studentId" value={student.id} />
          <input type="hidden" name="testCode" value={definition.code} />
          <input type="hidden" name="phase" value={phase!} />

          {definition.problems.map((problem) => (
            <div key={problem.key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
              <h3 className="font-medium text-slate-900 mb-3">
                {problem.key}. {problem.title}
              </h3>
              {problem.subQuestions.map((sub) => {
                const studentAnswer = answers[problem.key]?.[sub.key];
                const chosenLabel = studentAnswer?.choice
                  ? sub.options.find((o) => o.key === studentAnswer.choice)?.label
                  : undefined;
                const existingScore = existingScores[problem.key]?.[sub.key];
                return (
                  <div key={sub.key} className="mb-4 pb-4 border-b border-slate-100 last:border-0">
                    <p className="text-sm text-slate-800 mb-1">
                      <span className="font-medium">{sub.key})</span> {sub.prompt}
                    </p>
                    <p className="text-xs text-slate-600 mb-1">
                      Õpilase valik:{' '}
                      {studentAnswer?.choice ? (
                        <strong>{chosenLabel}</strong>
                      ) : (
                        <span className="text-slate-400">puudub (paberil sooritus)</span>
                      )}
                    </p>
                    {sub.requiresExplanation && studentAnswer?.choice && (
                      <p className="text-xs text-slate-600 mb-1 whitespace-pre-wrap">
                        Selgitus:{' '}
                        {studentAnswer.explanation ? (
                          studentAnswer.explanation
                        ) : (
                          <span className="text-slate-400 italic">Selgitust ei lisatud.</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mb-2 italic">{sub.rationale}</p>
                    <label className="flex items-center gap-2 text-sm">
                      <span>Punktid (0–{sub.maxPoints}):</span>
                      <input
                        type="number"
                        name={`${problem.key}.${sub.key}`}
                        min={0}
                        max={sub.maxPoints}
                        step={1}
                        defaultValue={existingScore ?? ''}
                        required
                        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <label className="block mb-2">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Kommentaar (nähtav ainult sulle, teaduritele ja adminile)
              </span>
              <textarea
                name="comment"
                rows={3}
                defaultValue={submission?.grading?.comment ?? ''}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </label>
            {submission?.grading && (
              <Alert kind="info">
                Juba hinnatud {submission.grading.gradedAt.toLocaleDateString('et-EE')} — koondskoor{' '}
                {submission.grading.totalScore}/{definition.maxScore}. Salvestamine kirjutab hinnangu üle.
              </Alert>
            )}
            <PrimaryButton type="submit">Salvesta hindamine</PrimaryButton>
          </div>
        </form>
      </main>
    </>
  );
}
