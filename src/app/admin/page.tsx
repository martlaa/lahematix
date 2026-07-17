import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';

export default async function AdminPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const schools = await prisma.school.findMany({
    include: { teachers: { include: { user: true } }, director: true },
    orderBy: { name: 'asc' },
  });
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
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
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-1">{u.name}</td>
                  <td className="py-1">{u.email}</td>
                  <td className="py-1">{u.role}</td>
                  <td className="py-1">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
