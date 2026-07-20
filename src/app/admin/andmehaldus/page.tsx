import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';

export default async function AdminAndmehaldusPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        <a href="/admin" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Andmeekspordi taotlused</h2>
            <p className="text-sm text-slate-600 mt-1">
              Küsimustike, testitulemuste ja uurijapäeviku ekspordilubade kinnitamine.
            </p>
          </div>
          <a href="/admin/eksporditaotlused" className="text-sm text-brand-600 underline hover:no-underline whitespace-nowrap">
            Ava taotlused →
          </a>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Andmete kustutamine</h2>
            <p className="text-sm text-slate-600 mt-1">
              Nõusoleku tagasi võtnud õpilaste/õpetajate identifitseerivate andmete jäädav kustutamine.
            </p>
          </div>
          <a href="/admin/andmekustutus" className="text-sm text-brand-600 underline hover:no-underline whitespace-nowrap">
            Ava →
          </a>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Rakenduse sulgemine</h2>
            <p className="text-sm text-slate-600 mt-1">
              Uuringu lõppedes rakenduse sulgemine — valmisoleku ülevaade ja sulgemis-/taasavamistoiming.
            </p>
          </div>
          <a href="/admin/sulgemine" className="text-sm text-brand-600 underline hover:no-underline whitespace-nowrap">
            Ava →
          </a>
        </section>
      </main>
    </>
  );
}
