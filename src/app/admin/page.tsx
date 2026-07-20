import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const pendingExportRequests = await prisma.exportRequest.count({ where: { status: 'PENDING' } });

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {pendingExportRequests > 0 && (
          <Alert kind="info">
            <a href="/admin/eksporditaotlused" className="underline hover:no-underline font-medium">
              {pendingExportRequests} ekspordiluba ootab sinu otsust →
            </a>
          </Alert>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Koolide ja kasutajate haldus</h2>
            <p className="text-sm text-slate-600 mt-1">
              Lisa koole ja kasutajaid, halda õpilaste CSV-importi ning vaata kõigi kasutajate nimekirja.
            </p>
          </div>
          <a href="/admin/kasutajad" className="text-sm text-brand-600 underline hover:no-underline whitespace-nowrap">
            Ava →
          </a>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Andmete ja elukaare haldus</h2>
            <p className="text-sm text-slate-600 mt-1">
              Andmeekspordi taotlused, andmete kustutamine ja rakenduse sulgemine.
            </p>
          </div>
          <a href="/admin/andmehaldus" className="text-sm text-brand-600 underline hover:no-underline whitespace-nowrap">
            Ava →
          </a>
        </section>
      </main>
    </>
  );
}
