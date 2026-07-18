export function FormShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-md border border-slate-300 px-3 py-2 text-sm ' +
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ' +
        (props.className ?? '')
      }
    />
  );
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-start gap-2 mb-3 text-sm text-slate-800">
      <input type="checkbox" {...props} className="mt-1 h-4 w-4 rounded border-slate-300" />
      <span>{label}</span>
    </label>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 ' +
        'text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 ' +
        (props.className ?? '')
      }
    />
  );
}

export function SecondaryLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {children}
    </a>
  );
}

export type QuestionnaireStatus = 'done' | 'started' | 'none';

export function questionnaireStatus(viewedAt: Date | null | undefined, done: boolean): QuestionnaireStatus {
  if (done) return 'done';
  if (viewedAt) return 'started';
  return 'none';
}

export function StatusDot({ status }: { status: QuestionnaireStatus }) {
  const styles: Record<QuestionnaireStatus, { color: string; label: string }> = {
    done: { color: 'bg-green-500', label: 'Lõpetatud' },
    started: { color: 'bg-yellow-400', label: 'Alustatud, pooleli' },
    none: { color: 'bg-slate-200', label: 'Pole alustatud' },
  };
  const { color, label } = styles[status];
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

export function StatusLegend({ showWithdrawn }: { showWithdrawn?: boolean } = {}) {
  return (
    <p className="text-xs text-slate-500 mb-4 flex items-center gap-4 flex-wrap">
      <span>Staatus:</span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" /> lõpetatud/antud
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" /> alustatud, pooleli
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-200" /> pole alustatud
      </span>
      {showWithdrawn && (
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> tagasi võetud
        </span>
      )}
    </p>
  );
}

export function Alert({ kind, children }: { kind: 'success' | 'error' | 'info'; children: React.ReactNode }) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  } as const;
  return <div className={`rounded-md border px-4 py-3 text-sm mb-4 ${styles[kind]}`}>{children}</div>;
}
