import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function AdminAndmekustutusPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const withdrawnStudents = await prisma.student.findMany({
    where: { excludedFromAnalysis: true, identityDeletedAt: null },
    include: { teacher: { include: { school: true } } },
    orderBy: { excludedAt: 'asc' },
  });

  const teacherWithdrawals = await prisma.consentRecord.findMany({
    where: { subjectType: 'OPETAJA', status: 'TAGASI_VOETUD' },
    distinct: ['subjectId'],
    orderBy: { withdrawnAt: 'asc' },
  });
  const withdrawnTeacherUserIds = teacherWithdrawals.map((r) => r.subjectId);
  const withdrawnTeachers = await prisma.teacher.findMany({
    where: { userId: { in: withdrawnTeacherUserIds }, user: { identityDeletedAt: null } },
    include: { user: true, school: true },
  });

  const deletedStudents = await prisma.student.findMany({
    where: { identityDeletedAt: { not: null } },
    orderBy: { identityDeletedAt: 'desc' },
  });
  const deletedTeachers = await prisma.teacher.findMany({
    where: { user: { identityDeletedAt: { not: null } } },
    include: { user: true },
    orderBy: { user: { identityDeletedAt: 'desc' } },
  });

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/admin" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Andmete kustutamine</h1>
          <p className="text-sm text-slate-600">
            Nõusoleku tagasivõtmisel jäetakse andmesubjekt analüüsist välja, kuid tema identifitseerivad
            andmed (nimi, e-post, lapsevanema andmed) säilivad kuni jäädava kustutamiseni. Kustutamine on
            pöördumatu — pseudonümiseeritud uurimisandmestik (testitulemused, küsimustikud jms) säilib
            eetikataotluses (p 4.2) kirjeldatud tähtajani, ainult otsesed identifitseerivad andmed
            kustutatakse.
          </p>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-4">
            Nõusoleku tagasi võtnud õpilased ({withdrawnStudents.length})
          </h2>
          {withdrawnStudents.length === 0 ? (
            <p className="text-sm text-slate-500">Ühtegi kustutamiskõlblikku õpilast pole.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Pseudonüüm</th>
                  <th className="py-1 pr-2">Kool</th>
                  <th className="py-1 pr-2">Tagasi võetud</th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {withdrawnStudents.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{s.pseudonymCode}</td>
                    <td className="py-2 pr-2">{s.teacher.school.name}</td>
                    <td className="py-2 pr-2">{s.excludedAt?.toLocaleDateString('et-EE') ?? '—'}</td>
                    <td className="py-2 pr-2">
                      <a
                        href={`/admin/andmekustutus/kinnita?type=student&id=${s.id}`}
                        className="text-xs text-red-600 underline hover:no-underline"
                      >
                        Kustuta jäädavalt
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-4">
            Nõusoleku tagasi võtnud õpetajad-uurijad ({withdrawnTeachers.length})
          </h2>
          {withdrawnTeachers.length === 0 ? (
            <p className="text-sm text-slate-500">Ühtegi kustutamiskõlblikku õpetajat pole.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Pseudonüüm</th>
                  <th className="py-1 pr-2">Kool</th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {withdrawnTeachers.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{t.pseudonymCode}</td>
                    <td className="py-2 pr-2">{t.school.name}</td>
                    <td className="py-2 pr-2">
                      <a
                        href={`/admin/andmekustutus/kinnita?type=teacher&id=${t.id}`}
                        className="text-xs text-red-600 underline hover:no-underline"
                      >
                        Kustuta jäädavalt
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {(deletedStudents.length > 0 || deletedTeachers.length > 0) && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
            <h2 className="font-semibold text-slate-900 mb-4">Juba kustutatud identiteedid</h2>
            <Alert kind="info">
              Need read on juba jäädavalt kustutatud — allolev pseudonüüm ja kustutamise kuupäev on kõik,
              mis säilib.
            </Alert>
            <ul className="text-sm text-slate-600 space-y-1">
              {deletedStudents.map((s) => (
                <li key={s.id}>
                  {s.pseudonymCode} (õpilane) — kustutatud {s.identityDeletedAt?.toLocaleDateString('et-EE')}
                </li>
              ))}
              {deletedTeachers.map((t) => (
                <li key={t.id}>
                  {t.pseudonymCode} (õpetaja-uurija) — kustutatud{' '}
                  {t.user.identityDeletedAt?.toLocaleDateString('et-EE')}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
