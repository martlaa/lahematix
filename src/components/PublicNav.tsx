export function PublicNav({ active }: { active?: 'home' | 'galerii' }) {
  return (
    <header className="bg-brand-700 text-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-semibold text-lg">LAHEMATIX</span>
          <span className="text-brand-100 text-sm hidden sm:inline">LAHEMATE uuringurakendus</span>
        </a>
        <nav className="flex items-center gap-5 text-sm">
          <a href="/" className={active === 'home' ? 'font-semibold underline' : 'hover:underline'}>
            Avaleht
          </a>
          <a
            href="/galerii"
            className={active === 'galerii' ? 'font-semibold underline' : 'hover:underline'}
          >
            Tunnikavade galerii
          </a>
          <a
            href="/login"
            className="rounded-md bg-white text-brand-700 px-3 py-1.5 font-medium hover:bg-brand-50"
          >
            Logi sisse
          </a>
        </nav>
      </div>
    </header>
  );
}
