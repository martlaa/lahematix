import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert, StatusDot, StatusLegend, questionnaireStatus } from '@/components/ui';

type UserSortField = 'name' | 'email' | 'role' | 'status' | 'lastLogin';

export default async function AdminKasutajadPage(
  props: {
    searchParams: Promise<{ imported?: string; errors?: string; sort?: string; dir?: string; editSchool?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const schools = await prisma.school.findMany({
    include: {
      teachers: {
        include: {
          user: { include: { questionnaireResponses: { where: { questionnaireCode: 'lisa8' } } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  const usersRaw = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

  const lastLoginByUserId = new Map(
    (
      await prisma.loginToken.groupBy({
        by: ['userId'],
        where: { usedAt: { not: null } },
        _max: { usedAt: true },
      })
    ).map((r) => [r.userId, r._max.usedAt as Date]),
  );

  const users = usersRaw.map((u) => ({ ...u, lastLogin: lastLoginByUserId.get(u.id) ?? null }));

  const validSortFields: UserSortField[] = ['name', 'email', 'role', 'status', 'lastLogin'];
  const sortField: UserSortField = validSortFields.includes(searchParams.sort as UserSortField)
    ? (searchParams.sort as UserSortField)
    : 'name';
  const sortDir: 'asc' | 'desc' = searchParams.dir === 'desc' ? 'desc' : 'asc';

  users.sort((a, b) => {
    let cmp: number;
    if (sortField === 'lastLogin') {
      cmp = (a.lastLogin?.getTime() ?? 0) - (b.lastLogin?.getTime() ?? 0);
    } else {
      cmp = String(a[sortField]).localeCompare(String(b[sortField]), 'et');
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function sortLink(field: UserSortField): string {
    const nextDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    return `/admin/kasutajad?sort=${field}&dir=${nextDir}#kasutajad`;
  }

  function sortIndicator(field: UserSortField): string {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  const teacherOptions = schools.flatMap((s) => s.teachers.map((t) => ({ id: t.id, label: `${t.user.name} (${s.name})` })));

  const imported = searchParams.imported ? Number(searchParams.imported) : null;
  const importErrors: { row: number; message: string }[] = searchParams.errors
    ? JSON.parse(searchParams.errors)
    : [];

  const editSchoolId = searchParams.editSchool ?? null;

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        <a href="/admin" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

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
          <p className="text-sm text-slate-600 mb-3">
            Koolijuhi nime ja e-posti võid lisada kohe või hiljem allpool "Koolid ja õpetajad" all —
            koolijuht ei vaja kasutajakontot, talle saadetakse hiljem ühekordne nõusolekulink.
          </p>
          <form action="/api/admin/schools" method="post" className="grid grid-cols-3 gap-3">
            <input
              name="name"
              required
              placeholder="Kooli nimi"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="directorName"
              placeholder="Koolijuhi nimi (valikuline)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="directorEmail"
              type="email"
              placeholder="Koolijuhi e-post (valikuline)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="col-span-3 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
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
              </select>
              <select name="schoolId" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">— kool (õpetajale) —</option>
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
            <p className="text-sm text-slate-500">Ühtegi õpetajat pole veel lisatud.</p>
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

        <section id="koolid" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Koolid ja õpetajad</h2>
          <div className="space-y-4">
            {schools.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  {editSchoolId === s.id ? (
                    <form action="/api/admin/schools/rename" method="post" className="flex flex-1 items-center gap-2">
                      <input type="hidden" name="schoolId" value={s.id} />
                      <input
                        name="name"
                        required
                        defaultValue={s.name}
                        autoFocus
                        className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm font-medium"
                      />
                      <button type="submit" className="text-xs text-brand-600 underline hover:no-underline whitespace-nowrap">
                        Salvesta
                      </button>
                      <a
                        href="/admin/kasutajad#koolid"
                        className="text-xs text-slate-500 underline hover:no-underline whitespace-nowrap"
                      >
                        Loobu
                      </a>
                    </form>
                  ) : (
                    <span className="font-medium">
                      {s.name}{' '}
                      <a
                        href={`/admin/kasutajad?editSchool=${s.id}#koolid`}
                        className="text-xs text-brand-600 underline hover:no-underline font-normal"
                      >
                        Muuda nime
                      </a>
                    </span>
                  )}
                  <span
                    className={
                      'text-xs px-2 py-1 rounded-full ml-3 whitespace-nowrap ' +
                      (s.consentGiven ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')
                    }
                  >
                    {s.consentGiven ? 'Nõusolek antud' : 'Nõusolek puudub'}
                  </span>
                </div>

                {s.directorEmail ? (
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-sm text-slate-500">
                      Koolijuht: {s.directorName} ({s.directorEmail})
                    </p>
                    {!s.consentGiven && (
                      <form action="/api/admin/schools/invite" method="post">
                        <input type="hidden" name="schoolId" value={s.id} />
                        <button type="submit" className="text-xs text-brand-600 underline hover:no-underline">
                          Saada kutse/meeldetuletus
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <form action="/api/admin/schools/director" method="post" className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="schoolId" value={s.id} />
                    <input
                      name="directorName"
                      required
                      placeholder="Koolijuhi nimi"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    />
                    <input
                      name="directorEmail"
                      type="email"
                      required
                      placeholder="Koolijuhi e-post"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    />
                    <button type="submit" className="text-xs text-brand-600 underline hover:no-underline">
                      Määra koolijuht
                    </button>
                  </form>
                )}

                {s.teachers.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Õpetajaid pole veel lisatud</p>
                ) : (
                  <table className="mt-2 w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-1 font-normal">Õpetaja</th>
                        <th className="py-1 font-normal">Meetod</th>
                        <th className="py-1 font-normal text-center" title="Lisa 8 küsimustik">
                          Küsimustik
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.teachers.map((t) => (
                        <tr key={t.id}>
                          <td className="py-1 text-slate-700">
                            {t.user.name} ({t.user.email})
                          </td>
                          <td className="py-1 text-slate-700">{t.method ?? 'valimata'}</td>
                          <td className="py-1 text-center">
                            <StatusDot
                              status={questionnaireStatus(t.lisa8FirstViewedAt, t.user.questionnaireResponses.length > 0)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
          {schools.some((s) => s.teachers.length > 0) && <StatusLegend />}
        </section>

        <section id="kasutajad" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Kõik kasutajad (viimased 50)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-1">
                  <a href={sortLink('name')} className="hover:text-slate-800 hover:underline">
                    Nimi{sortIndicator('name')}
                  </a>
                </th>
                <th className="py-1">
                  <a href={sortLink('email')} className="hover:text-slate-800 hover:underline">
                    E-post{sortIndicator('email')}
                  </a>
                </th>
                <th className="py-1">
                  <a href={sortLink('role')} className="hover:text-slate-800 hover:underline">
                    Roll{sortIndicator('role')}
                  </a>
                </th>
                <th className="py-1">
                  <a href={sortLink('status')} className="hover:text-slate-800 hover:underline">
                    Staatus{sortIndicator('status')}
                  </a>
                </th>
                <th className="py-1">
                  <a href={sortLink('lastLogin')} className="hover:text-slate-800 hover:underline">
                    Viimati{sortIndicator('lastLogin')}
                  </a>
                </th>
                <th className="py-1"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const removable = ['TEADUR', 'OPETAJA'].includes(u.role);
                return (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-1">{u.name}</td>
                    <td className="py-1">{u.email}</td>
                    <td className="py-1">{u.role}</td>
                    <td className="py-1">{u.status}</td>
                    <td className="py-1">{u.lastLogin ? u.lastLogin.toLocaleString('et-EE') : '—'}</td>
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
