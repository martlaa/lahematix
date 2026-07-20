import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { getAppSettings } from '@/lib/appSettings';

export default async function AdminSulgeminePage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const settings = await getAppSettings();

  const [pendingExportRequests, ungradedTests, unpublishedProtocols, withdrawnStudents, withdrawnTeacherConsents] =
    await Promise.all([
      prisma.exportRequest.count({ where: { status: 'PENDING' } }),
      prisma.testSubmission.count({ where: { grading: null } }),
      prisma.observationProtocol.count({ where: { publishedAt: null } }),
      prisma.student.count({ where: { excludedFromAnalysis: true, identityDeletedAt: null } }),
      prisma.consentRecord.findMany({
        where: { subjectType: 'OPETAJA', status: 'TAGASI_VOETUD' },
        distinct: ['subjectId'],
        select: { subjectId: true },
      }),
    ]);

  const withdrawnTeachersNotDeleted = await prisma.teacher.count({
    where: {
      userId: { in: withdrawnTeacherConsents.map((r) => r.subjectId) },
      user: { identityDeletedAt: null },
    },
  });

  const checklist = [
    { label: 'Ootel ekspordiload', count: pendingExportRequests, href: '/admin/eksporditaotlused' },
    { label: 'Hindamata testisooritused', count: ungradedTests, href: null },
    { label: 'Avalikustamata vaatlusprotokollid', count: unpublishedProtocols, href: null },
    {
      label: 'Kustutamiskõlblikud identiteedid (nõusolek tagasi võetud)',
      count: withdrawnStudents + withdrawnTeachersNotDeleted,
      href: '/admin/andmekustutus',
    },
  ];
  const readyToClose = checklist.every((c) => c.count === 0);

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/admin" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Rakenduse sulgemine</h1>
          <p className="text-sm text-slate-600">
            Kui uuring on lõppenud (vt eetikataotlus p 4.2, andmehaldusplaan), saab rakenduse sulgeda —
            pärast sulgemist ei saa ükski õpetaja-uurija, teadur ega koolijuht enam sisse logida, ainult
            admin.
          </p>
        </div>

        {settings.closedAt ? (
          <Alert kind="info">
            Rakendus on suletud alates {settings.closedAt.toLocaleString('et-EE')}.
          </Alert>
        ) : (
          <Alert kind="success">Rakendus on avatud ja kasutusel.</Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Valmisoleku ülevaade</h2>
          <ul className="divide-y divide-slate-100">
            {checklist.map((c) => (
              <li key={c.label} className="py-2 flex items-center justify-between text-sm">
                <span className="text-slate-700">{c.label}</span>
                <span className="flex items-center gap-3">
                  <span
                    className={
                      'rounded-full px-2 py-0.5 text-xs font-medium ' +
                      (c.count === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')
                    }
                  >
                    {c.count}
                  </span>
                  {c.href && c.count > 0 && (
                    <a href={c.href} className="text-brand-600 underline hover:no-underline text-xs">
                      Vaata
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {!readyToClose && !settings.closedAt && (
            <Alert kind="info">
              Soovituslik on need punktid enne sulgemist lahendada, kuid sulgemine on siiski võimalik.
            </Alert>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {settings.closedAt ? (
            <form action="/api/admin/sulgemine" method="post">
              <input type="hidden" name="action" value="reopen" />
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Ava rakendus uuesti
              </button>
            </form>
          ) : (
            <a
              href="/admin/sulgemine/kinnita"
              className="inline-block rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
            >
              Sule rakendus
            </a>
          )}
        </div>
      </main>
    </>
  );
}
