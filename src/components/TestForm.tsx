import { PrimaryButton } from '@/components/ui';
import { seededShuffle } from '@/lib/tests/shuffle';
import type { Problem, TestDefinition } from '@/lib/tests';

function SubQuestionBlock({
  problemKey,
  sub,
  seed,
}: {
  problemKey: string;
  sub: Problem['subQuestions'][number];
  seed: string;
}) {
  const name = `${problemKey}.${sub.key}`;
  // Variandid segatakse iga õpilase jaoks erinevasse (aga talle stabiilsesse)
  // järjekorda ja tähed (A/B/C/D) ei ole nähtavad — see vähendab maha
  // kirjutamise ohtu, kuna kaaslasel võib "õige vastus on teine" viidata
  // erinevale variandile.
  const options = seededShuffle(sub.options, `${seed}.${problemKey}.${sub.key}`);
  return (
    <div className="mb-6">
      <p className="text-sm text-slate-800 mb-2">
        <span className="font-medium">{sub.key})</span> {sub.prompt}
      </p>
      <div className="space-y-1 mb-2">
        {options.map((opt) => (
          <label key={opt.key} className="flex items-start gap-2 text-sm text-slate-700">
            <input type="radio" name={`${name}.choice`} value={opt.key} required className="mt-1 h-4 w-4" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {sub.requiresExplanation && (
        <label className="block mt-2">
          <span className="block text-xs text-slate-600 mb-1">{sub.explanationPrompt ?? 'Selgita oma vastust:'}</span>
          <textarea
            name={`${name}.explanation`}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </label>
      )}
      {sub.bonusPrompt && (
        <label className="block mt-2">
          <span className="block text-xs text-slate-500 mb-1">{sub.bonusPrompt}</span>
          <textarea
            name={`${name}.bonus`}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </label>
      )}
    </div>
  );
}

function ProblemBlock({ problem, seed }: { problem: Problem; seed: string }) {
  return (
    <div className="mb-8 pb-6 border-b border-slate-100 last:border-0">
      <h3 className="font-medium text-slate-900 mb-1">
        {problem.key}. {problem.title}
      </h3>
      <p className="text-sm text-slate-700 mb-4">{problem.story}</p>
      {problem.subQuestions.map((sub) => (
        <SubQuestionBlock key={sub.key} problemKey={problem.key} sub={sub} seed={seed} />
      ))}
    </div>
  );
}

export function TestForm({
  definition,
  action,
  hiddenFields,
  seed,
}: {
  definition: TestDefinition;
  action: string;
  hiddenFields?: Record<string, string>;
  /** Stabiilne, õpilase-spetsiifiline seeme (nt kutse token), mille põhjal
   *  vastusevariandid segatakse. Sama seemega laetakse alati sama järjekord. */
  seed: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-6">{definition.instructions}</p>
      <form action={action} method="post">
        {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {definition.problems.map((problem) => (
          <ProblemBlock key={problem.key} problem={problem} seed={seed} />
        ))}
        <PrimaryButton type="submit">Saada vastused</PrimaryButton>
      </form>
    </div>
  );
}
