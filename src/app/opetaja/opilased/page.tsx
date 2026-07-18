import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function OpilasedPage({
  searchParams,
}: {
  searchParams: { imported?: string; errors?: string };
}) {
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
  const imported = searchParams.imported ? Number(searchParams.imported) : null;
  const importErrors: { row: number; message: string }[] = searchParams.errors
    ? JSON.parse(searchParams.errors)
    : [];

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {imported !== null && (
          <Alert kind={importErrors.length > 0 ? 'info' : 'success'}>
            <p>{imported} õpilast lisati edukalt CSV-failist.</p>
            {importErrors.length > 0 && (
              <>
                <p className="mt-2 font-medium">{importErrors.length} rida ei õnnestunud või jäeti vahele:</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Lisa õpilane</h2>
          <Alert kind="info">
            Nimi ja e-post on vajalikud, et hiljem saaks õpilasele saata küsimustiku/testi kutse ning et
            eel- ja järelandmed saaks omavahel siduda. Uurimisandmestikus (testid, küsimustikud)
            kasutatakse ainult pseudonüümikoodi, mitte nime. Kui õpilane on alla 15-aastane, täida ka
            lapsevanema väljad — vanemale saadetakse nõusolekukutse e-postiga. 15-aastastele ja
            vanematele genereerib süsteem ühekordse nõusolekulingi, mille saad ise õpilasele edastada.
          </Alert>
          <form action="/api/opetaja/opilased" method="post" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="name"
                required
                placeholder="Õpilase ees- ja perekonnanimi"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Õpilase e-post"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <input
                name="classCode"
                placeholder="Klassi kood (nt 5A)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
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
          <h2 className="font-semibold text-slate-900 mb-2">Lisa terve klass korraga (CSV)</h2>
          <p className="text-sm text-slate-600 mb-3">
            Kui klassis on palju õpilasi, on lihtsam täita nimekiri Excelis või Numbersis ja laadida see
            ühe failina üles.{' '}
            <a href="/naidis_opilased.csv" download className="text-brand-600 underline hover:no-underline">
              Laadi alla näidis-CSV
            </a>{' '}
            — ava see Excelis/Numbersis, täida oma klassi andmetega samas struktuuris ja salvesta uuesti
            CSV-vormingus. Sama e-postiga õpilast ei lisata kunagi topelt — kui rida vastab juba
            nimekirjas olevale õpilasele, jäetakse see lihtsalt vahele.
          </p>
          <form
            action="/api/opetaja/opilased/csv"
            method="post"
            encType="multipart/form-data"
            className="flex flex-wrap items-center gap-3"
          >
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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Õpilaste nimekiri ({students.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-1">Nimi</th>
                <th className="py-1">Pseudonüüm</th>
                <th className="py-1">Klass</th>
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
                    <td className="py-2">
                      {s.name}
                      <div className="text-xs text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-2 font-mono">{s.pseudonymCode}</td>
                    <td className="py-2">{s.classCode ?? '—'}</td>
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
                  <td colSpan={6} className="py-4 text-center text-slate-400">
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
