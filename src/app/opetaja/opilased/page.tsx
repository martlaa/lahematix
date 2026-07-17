import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function OpilasedPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) redirect('/opetaja');

  const students = await prisma.student.findMany({
    where: { teacherId: teacher!.id },
    include: {
      parent: { include: { user: true } },
      consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      inviteTokens: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  const baseUrl = process.env.APP_BASE_URL ?? '';

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Lisa õpilane</h2>
          <Alert kind="info">
            Kui õpilane on alla 15-aastane, täida ka lapsevanema väljad — vanemale saadetakse
            nõusolekukutse e-postiga. 15-aastastele ja vanematele genereerib süsteem ühekordse
            nõusolekulingi, mille saad ise õpilasele edastada.
          </Alert>
          <form action="/api/opetaja/opilased" method="post" className="space-y-3 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <select name="group" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="INTERVENTSIOON">Sekkumisrühm</option>
                <option value="KONTROLL">Kontrollrühm</option>
              </select>
              <input
                name="birthYear"
                type="number"
                min="2005"
                max="2020"
                placeholder="Sünniaasta"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <select name="gender" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Sugu — vali</option>
                <option value="T">Tüdruk</option>
                <option value="P">Poiss</option>
                <option value="M">Muu / ei soovi öelda</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" name="isFifteenOrOlder" className="h-4 w-4 rounded border-slate-300" />
              Õpilane on 15-aastane või vanem (nõusoleku annab õpilane ise)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="parentName"
                placeholder="Lapsevanema nimi (kui alla 15a)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="parentEmail"
                type="email"
                placeholder="Lapsevanema e-post (kui alla 15a)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lisa õpilane
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Õpilaste nimekiri ({students.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-1">Pseudonüüm</th>
                <th className="py-1">Rühm</th>
                <th className="py-1">Nõusolek</th>
                <th className="py-1">Link / vanem</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const consent = s.consentRecords[0];
                const consentGiven = consent?.status === 'ANTUD';
                const token = s.inviteTokens[0];
                return (
                  <tr key={s.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 font-mono">{s.pseudonymCode}</td>
                    <td className="py-2">{s.group === 'INTERVENTSIOON' ? 'Sekkumine' : 'Kontroll'}</td>
                    <td className="py-2">
                      {s.excludedFromAnalysis ? (
                        <span className="text-red-600">Väljajäetud</span>
                      ) : consentGiven ? (
                        <span className="text-green-600">Antud</span>
                      ) : (
                        <span className="text-slate-400">Puudub</span>
                      )}
                    </td>
                    <td className="py-2 text-xs">
                      {s.isFifteenOrOlder ? (
                        token ? (
                          <code className="break-all">{`${baseUrl}/opilane/nousolek/${token.token}`}</code>
                        ) : (
                          '—'
                        )
                      ) : s.parent ? (
                        `${s.parent.user.name} (${s.parent.user.email})`
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    Õpilasi pole veel lisatud
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
