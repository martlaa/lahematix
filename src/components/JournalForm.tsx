import { PrimaryButton } from '@/components/ui';
import type { JournalAnswers, JournalDefinition, JournalDomain } from '@/lib/journal';

function LikertItemRow({
  domainKey,
  item,
  existing,
}: {
  domainKey: string;
  item: JournalDomain['items'][number];
  existing?: { value: string; comment?: string };
}) {
  const name = `likert.${domainKey}.${item.key}`;
  return (
    <div className="mb-4">
      <p className="text-sm text-slate-800 mb-1">{item.label}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <label key={v} className="flex items-center gap-1">
            <input
              type="radio"
              name={`${name}.value`}
              value={v}
              required
              defaultChecked={existing?.value === String(v)}
              className="h-4 w-4"
            />
            {v}
          </label>
        ))}
      </div>
      <textarea
        name={`${name}.comment`}
        rows={1}
        defaultValue={existing?.comment ?? ''}
        placeholder="Kommentaar (soovi korral)"
        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>
  );
}

function DomainBlock({
  domain,
  existingDomainAnswers,
}: {
  domain: JournalDomain;
  existingDomainAnswers?: Record<string, { value: string; comment?: string }>;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-medium text-slate-900 mb-3">{domain.title}</h3>
      {domain.items.map((item) => (
        <LikertItemRow
          key={item.key}
          domainKey={domain.key}
          item={item}
          existing={existingDomainAnswers?.[item.key]}
        />
      ))}
    </div>
  );
}

export function JournalForm({
  definition,
  action,
  hiddenFields,
  existingAnswers,
}: {
  definition: JournalDefinition;
  action: string;
  hiddenFields?: Record<string, string>;
  /** Kui õpetaja täiendab varem alustatud/täidetud sissekannet, eeltäidetakse vorm sellega. */
  existingAnswers?: JournalAnswers;
}) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-2">{definition.intro}</p>
      <p className="text-xs text-slate-500 mb-6">Skaala: {definition.scaleLabels.join(' · ')}</p>
      <form action={action} method="post">
        {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        {definition.domains.map((domain) => (
          <DomainBlock
            key={domain.key}
            domain={domain}
            existingDomainAnswers={existingAnswers?.likert[domain.key]}
          />
        ))}

        <div className="mb-6">
          <h3 className="font-medium text-slate-900 mb-1">{definition.rolfe.whatIntro}</h3>
          <p className="text-xs text-slate-600 mb-3">{definition.rolfe.whatHelp}</p>
          {definition.rolfe.whatStageLabels.map((label, i) => (
            <label key={label} className="block mb-3">
              <span className="block text-xs font-medium text-slate-700 mb-1">{label}</span>
              <textarea
                name={`rolfe.what.${i + 1}`}
                rows={2}
                defaultValue={existingAnswers?.rolfe.what[i] ?? ''}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </label>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-slate-900 mb-1">{definition.rolfe.soWhatIntro}</h3>
          <p className="text-xs text-slate-600 mb-3">{definition.rolfe.soWhatHelp}</p>
          <textarea
            name="rolfe.soWhat"
            rows={4}
            defaultValue={existingAnswers?.rolfe.soWhat ?? ''}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-slate-900 mb-1">{definition.rolfe.nowWhatIntro}</h3>
          <p className="text-xs text-slate-600 mb-3">{definition.rolfe.nowWhatHelp}</p>
          <textarea
            name="rolfe.nowWhat"
            rows={4}
            defaultValue={existingAnswers?.rolfe.nowWhat ?? ''}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <PrimaryButton type="submit">Salvesta sissekanne</PrimaryButton>
      </form>
    </div>
  );
}
