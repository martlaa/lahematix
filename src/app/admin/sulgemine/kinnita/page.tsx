import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { getAppSettings } from '@/lib/appSettings';

export default async function AdminSulgemineKinnitaPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const settings = await getAppSettings();
  if (settings.closedAt) redirect('/admin/sulgemine');

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/admin/sulgemine" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Kinnita rakenduse sulgemine</h1>
          <Alert kind="error">
            Pärast sulgemist ei saa ükski õpetaja-uurija, teadur ega koolijuht enam sisse logida — ainult
            admin. Toimingu saab hiljem tagasi võtta ("Ava rakendus uuesti"), aga see peaks jääma
            erandlikuks — planeeri sulgemine kokkuleppel projekti meeskonnaga.
          </Alert>
          <form action="/api/admin/sulgemine" method="post">
            <input type="hidden" name="action" value="close" />
            <button className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700">
              Jah, sule rakendus
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
