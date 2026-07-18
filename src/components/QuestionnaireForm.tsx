import { PrimaryButton } from '@/components/ui';
import type { LikertItem, QuestionnaireBlock, QuestionnaireDefinition } from '@/lib/questionnaires';

function LikertRow({ name, item, allowEoh }: { name: string; item: LikertItem; allowEoh?: boolean }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-slate-800 mb-1">{item.label}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        {[1, 2, 3, 4, 5].map((v) => (
          <label key={v} className="flex items-center gap-1">
            <input type="radio" name={name} value={v} required className="h-4 w-4" />
            {v}
          </label>
        ))}
        {allowEoh && (
          <label className="flex items-center gap-1">
            <input type="radio" name={name} value="EOH" className="h-4 w-4" />
            EOH
          </label>
        )}
      </div>
    </div>
  );
}

function BlockRenderer({ block }: { block: QuestionnaireBlock }) {
  switch (block.type) {
    case 'likert':
      return (
        <div className="mb-8">
          <h3 className="font-medium text-slate-900 mb-3">{block.title}</h3>
          {block.items.map((item) => (
            <LikertRow key={item.key} name={`${block.key}.${item.key}`} item={item} allowEoh={block.allowEoh} />
          ))}
        </div>
      );
    case 'method_comparison':
      return (
        <div className="mb-8">
          <h3 className="font-medium text-slate-900 mb-1">{block.title}</h3>
          {block.intro && <p className="text-sm text-slate-600 mb-4">{block.intro}</p>}
          {block.methods.map((method) => (
            <div key={method.key} className="mb-6">
              <h4 className="text-sm font-medium text-slate-800 mb-2">{method.label}</h4>
              {block.items.map((item) => (
                <LikertRow
                  key={item.key}
                  name={`${block.key}.${method.key}.${item.key}`}
                  item={item}
                  allowEoh
                />
              ))}
            </div>
          ))}
        </div>
      );
    case 'text':
      return (
        <div className="mb-8">
          <h3 className="font-medium text-slate-900 mb-3">{block.title}</h3>
          {block.items.map((item) => (
            <label key={item.key} className="block mb-4">
              <span className="block text-sm text-slate-800 mb-1">{item.label}</span>
              <textarea
                name={`${block.key}.${item.key}`}
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </label>
          ))}
        </div>
      );
    case 'fields':
      return (
        <div className="mb-8">
          <h3 className="font-medium text-slate-900 mb-3">{block.title}</h3>
          {block.items.map((item) => (
            <label key={item.key} className="block mb-4">
              <span className="block text-sm text-slate-800 mb-1">{item.label}</span>
              {item.inputType === 'textarea' ? (
                <textarea
                  name={`${block.key}.${item.key}`}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <input
                  type={item.inputType}
                  name={`${block.key}.${item.key}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              )}
            </label>
          ))}
        </div>
      );
  }
}

export function QuestionnaireForm({
  definition,
  action,
  hiddenFields,
  aboveForm,
}: {
  definition: QuestionnaireDefinition;
  action: string;
  hiddenFields?: Record<string, string>;
  aboveForm?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-slate-600 mb-2">{definition.intro}</p>
      <p className="text-xs text-slate-500 mb-6">
        Skaala: {definition.scaleLabels.join(' · ')}
      </p>
      {aboveForm}
      <form action={action} method="post">
        {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {definition.blocks.map((block) => (
          <BlockRenderer key={block.key} block={block} />
        ))}
        <PrimaryButton type="submit">Saada vastused</PrimaryButton>
      </form>
    </div>
  );
}
