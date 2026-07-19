import type { JournalDefinition } from './types';

export type JournalAnswers = {
  likert: Record<string, Record<string, { value: string; comment?: string }>>;
  rolfe: { what: [string, string, string]; soWhat: string; nowWhat: string };
};

/** Loeb vormiandmetest välja uurijapäeviku vastused. */
export function parseJournalAnswers(definition: JournalDefinition, form: FormData): JournalAnswers {
  const likert: JournalAnswers['likert'] = {};

  for (const domain of definition.domains) {
    const domainAnswers: Record<string, { value: string; comment?: string }> = {};
    for (const item of domain.items) {
      const value = form.get(`likert.${domain.key}.${item.key}.value`);
      const comment = form.get(`likert.${domain.key}.${item.key}.comment`);
      if (value != null) {
        domainAnswers[item.key] = {
          value: String(value),
          ...(comment != null && String(comment).trim() !== '' ? { comment: String(comment) } : {}),
        };
      }
    }
    if (Object.keys(domainAnswers).length > 0) likert[domain.key] = domainAnswers;
  }

  const what: [string, string, string] = [
    String(form.get('rolfe.what.1') ?? ''),
    String(form.get('rolfe.what.2') ?? ''),
    String(form.get('rolfe.what.3') ?? ''),
  ];

  return {
    likert,
    rolfe: {
      what,
      soWhat: String(form.get('rolfe.soWhat') ?? ''),
      nowWhat: String(form.get('rolfe.nowWhat') ?? ''),
    },
  };
}
