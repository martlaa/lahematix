import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert, PrimaryButton } from '@/components/ui';
import { getTestByCode } from '@/lib/tests';
import type { TestAnswers } from '@/lib/tests';

export default async function TeadurTestHindaminePage(props: { params: Promise<{ testCode: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const definition = getTestByCode(params.testCode);
  if (!definition) notFound();

  const trial = await prisma.instrumentTrial.findUnique({
    where: { authorUserId_instrumentCode: { authorUserId: session.userId, instrumentCode: definition.code } },
  });
  if (!trial || !trial.answersJson) redirect(`/teadur/instrumendid/test/${definition.code}`);

  const answers: TestAnswers = JSON.parse(trial.answersJson);
  const existingScores: Record<string, Record<string, number>> = trial.gradingJson ? JSON.parse(trial.gradingJson) : {};

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/teadur/instrumendid" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi instrumentide juurde
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">{definition.title} — hindamine (katsetus)</h1>
          <p className="text-xs text-slate-500 mt-2">{definition.gradingIntro}</p>
        </div>

        <form action="/api/teadur/instrumendid/test/hinda" method="post">
          <input type="hidden" name="testCode" value={definition.code} />

          {definition.problems.map((problem) => (
            <div key={problem.key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
              <h3 className="font-medium text-slate-900 mb-3">
                {problem.key}. {problem.title}
              </h3>
              {problem.subQuestions.map((sub) => {
                const ownAnswer = answers[problem.key]?.[sub.key];
                const chosenLabel = ownAnswer?.choice
                  ? sub.options.find((o) => o.key === ownAnswer.choice)?.label
                  : undefined;
                const existingScore = existingScores[problem.key]?.[sub.key];
                return (
                  <div key={sub.key} className="mb-4 pb-4 border-b border-slate-100 last:border-0">
                    <p className="text-sm text-slate-800 mb-1">
                      <span className="font-medium">{sub.key})</span> {sub.prompt}
                    </p>
                    <p className="text-xs text-slate-600 mb-1">
                      Sinu valik:{' '}
                      {ownAnswer?.choice ? (
                        <strong>{chosenLabel}</strong>
                      ) : (
                        <span className="text-slate-500">vastuseta</span>
                      )}
                    </p>
                    {sub.requiresExplanation && ownAnswer?.choice && (
                      <p className="text-xs text-slate-600 mb-1 whitespace-pre-wrap">
                        Selgitus:{' '}
                        {ownAnswer.explanation ? (
                          ownAnswer.explanation
                        ) : (
                          <span className="text-slate-500 italic">Selgitust ei lisatud.</span>
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
              <span className="block text-sm font-medium text-slate-700 mb-1">Kommentaar</span>
              <textarea
                name="comment"
                rows={3}
                defaultValue={trial.gradingComment ?? ''}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </label>
            {trial.gradedAt && (
              <Alert kind="info">
                Juba hinnatud {trial.gradedAt.toLocaleDateString('et-EE')} — koondskoor {trial.totalScore}/
                {definition.maxScore}. Salvestamine kirjutab hinnangu üle.
              </Alert>
            )}
            <PrimaryButton type="submit">Salvesta hindamine</PrimaryButton>
          </div>
        </form>
      </main>
    </>
  );
}
