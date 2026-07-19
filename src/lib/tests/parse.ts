import type { TestDefinition } from './types';

export type TestAnswer = { choice?: string; explanation?: string; bonus?: string };
export type TestAnswers = Record<string, Record<string, TestAnswer>>; // { [problemKey]: { [subKey]: TestAnswer } }

/** Loeb vormiandmetest välja testivastused struktuuris
 *  { [probleemKey]: { [alaküsimuseKey]: { choice, explanation?, bonus? } } }. */
export function parseTestAnswers(definition: TestDefinition, form: FormData): TestAnswers {
  const answers: TestAnswers = {};

  for (const problem of definition.problems) {
    const problemAnswers: Record<string, TestAnswer> = {};

    for (const sub of problem.subQuestions) {
      const choice = form.get(`${problem.key}.${sub.key}.choice`);
      const explanation = form.get(`${problem.key}.${sub.key}.explanation`);
      const bonus = form.get(`${problem.key}.${sub.key}.bonus`);

      const entry: TestAnswer = {};
      if (choice != null) entry.choice = String(choice);
      if (explanation != null && String(explanation).trim() !== '') entry.explanation = String(explanation);
      if (bonus != null && String(bonus).trim() !== '') entry.bonus = String(bonus);

      if (Object.keys(entry).length > 0) problemAnswers[sub.key] = entry;
    }

    if (Object.keys(problemAnswers).length > 0) answers[problem.key] = problemAnswers;
  }

  return answers;
}
