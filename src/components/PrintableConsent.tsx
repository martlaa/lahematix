'use client';

export function PrintableConsent({
  title,
  subtitle,
  children,
  items,
  meta,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  items: { label: string; checked: boolean }[];
  meta: { label: string; value: string }[];
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Prindi / salvesta PDF-ina
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 print:shadow-none print:border-none print:p-0">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="text-slate-600 mt-1 text-sm">{subtitle}</p>

        <div className="prose prose-sm max-w-none text-slate-700 mt-6 space-y-4">{children}</div>

        <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-2 text-sm text-slate-800">
              <span aria-hidden className="mt-0.5">
                {item.checked ? '☑' : '☐'}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-700 space-y-1">
          {meta.map((m) => (
            <p key={m.label}>
              <strong>{m.label}:</strong> {m.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
