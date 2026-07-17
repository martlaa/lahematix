export function Header({ userLabel }: { userLabel?: string }) {
  return (
    <header className="bg-brand-700 text-white">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <span className="font-semibold text-lg">LAHEMATIX</span>
          <span className="text-brand-100 text-sm ml-2">LAHEMATE uuringurakendus</span>
        </div>
        {userLabel && (
          <form action="/api/auth/logout" method="post">
            <div className="flex items-center gap-3 text-sm">
              <span>{userLabel}</span>
              <button className="underline hover:no-underline" type="submit">
                Logi välja
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
