import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { imported?: string; errors?: string };
}) {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const schools = await prisma.school.findMany({
    include: { teachers: { include: { user: true } }, director: true },
    orderBy: { name: 'asc' },
  });
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

  const teacherOptions = schools.flatMap((s) => s.teachers.map((t) => ({ id: t.id, label: `${t.user.name} (${s.name})` })));

  const imported = searchParams.imported ? Number(searchParams.imported) : null;
  const importErrors: { row: number; message: string }[] = searchParams.errors
    ? JSON.parse(searchParams.errors)
    : [];

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {imported !== null && (
          <Alert kind={importErrors.length > 0 ? 'info' : 'success'}>
            <p>{imported} õpilast lisati edukalt CSV-failist.</p>
            {importErrors.length > 0 && (
              <>
                <p className="mt-2 font-medium">{importErrors.length} rida ei õnnestunud:</p>
                <ul className="list-disc list-inside">
                  {importErrors.map((e, i) => (
                    <li key={i}>
                      Rida {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Alert>
        )}

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Uus kool</h2>
          <form action="/api/admin/schools" method="post" className="flex gap-3">
            <input
              name="name"
              required
              placeholder="Kooli nimi"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lisa kool
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Kutsu kasutaja</h2>
          <form action="/api/admin/invite" method="post" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="name"
                required
                placeholder="Nimi"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="E-post"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select name="role" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="TEADUR">Teadur</option>
                <option value="OPETAJA">Õpetaja-uurija</option>
                <option value="KOOLIJUHT">Koolijuht</option>
              </select>
              <select name="schoolId" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">— kool (õpetajale/koolijuhile) —</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Saada kutse
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Lisa õpilasi õpetaja eest (CSV)</h2>
          <p className="text-sm text-slate-600 mb-3">
            Kasuta seda, kui õpetajal endal pole mugav CSV-faili üles laadida — täida nimekiri tema klassi
            õpilastega ise ja vali allpool, millisele õpetajale need lisatakse.{' '}
            <a href="/naidis_opilased.csv" download className="text-brand-600 underline hover:no-underline">
              Laadi alla näidis-CSV
            </a>
            .
          </p>
          {teacherOptions.length === 0 ? (
            <p className="text-sm text-slate-400">Ühtegi õpetajat pole veel lisatud.</p>
          ) : (
            <form
              action="/api/admin/opilased/csv"
              method="post"
              encType="multipart/form-data"
              className="flex flex-wrap items-center gap-3"
            >
              <select name="teacherId" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">— vali õpetaja —</option>
                {teacherOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
              />
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Impordi CSV-st
              </button>
            </form>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Koolid ja õpetajad</h2>
          <div className="space-y-4">
            {schools.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span
                    className={
                      'text-xs px-2 py-1 rounded-full ' +
                      (s.consentGiven ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')
                    }
                  >
                    {s.consentGiven ? 'Nõusolek antud' : 'Nõusolek puudub'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Koolijuht: {s.director ? s.director.name : '— pole kutsutud —'}
                </p>
                <ul className="mt-2 text-sm text-slate-700 list-disc list-inside">
                  {s.teachers.map((t) => (
                    <li key={t.id}>
                      {t.user.name} ({t.user.email}) — {t.method ?? 'meetod valimata'}
                    </li>
                  ))}
                  {s.teachers.length === 0 && <li className="text-slate-400 list-none">Õpetajaid pole veel lisatud</li>}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Kõik kasutajad (viimased 50)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-1">Nimi</th>
                <th className="py-1">E-post</th>
                <th className="py-1">Roll</th>
                <th className="py-1">Staatus</th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const removable = ['TEADUR', 'OPETAJA', 'KOOLIJUHT'].includes(u.role);
                return (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-1">{u.name}</td>
                    <td className="py-1">{u.email}</td>
                    <td className="py-1">{u.role}</td>
                    <td className="py-1">{u.status}</td>
                    <td className="py-1 text-right">
                      {removable && u.status !== 'DISABLED' && (
                        <form action="/api/admin/users/remove" method="post">
                          <input type="hidden" name="userId" value={u.id} />
                          <button type="submit" className="text-xs text-red-600 underline hover:no-underline">
                            Eemalda
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
