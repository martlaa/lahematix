import type { QuestionnaireDefinition } from './types';

/** Loeb vormiandmetest välja ainult need väljad, mis definitsioonis kirjeldatud,
 *  struktureerituna { [plokk]: { [väide]: väärtus } } kujul (method_comparison
 *  plokkide puhul { [plokk]: { "meetod.väide": väärtus } }). */
export function parseQuestionnaireAnswers(
  definition: QuestionnaireDefinition,
  form: FormData,
): Record<string, Record<string, string>> {
  const answers: Record<string, Record<string, string>> = {};

  for (const block of definition.blocks) {
    const blockAnswers: Record<string, string> = {};

    if (block.type === 'method_comparison') {
      for (const method of block.methods) {
        for (const item of block.items) {
          const value = form.get(`${block.key}.${method.key}.${item.key}`);
          if (value != null) blockAnswers[`${method.key}.${item.key}`] = String(value);
        }
      }
    } else {
      for (const item of block.items) {
        const value = form.get(`${block.key}.${item.key}`);
        if (value != null) blockAnswers[item.key] = String(value);
      }
    }

    if (Object.keys(blockAnswers).length > 0) {
      answers[block.key] = blockAnswers;
    }
  }

  return answers;
}
