import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert, StatusDot, StatusLegend, questionnaireStatus } from '@/components/ui';
import { getTestByGradeBand } from '@/lib/tests';

export default async function OpilasedPage(
  props: {
    searchParams: Promise<{ imported?: string; errors?: string; sent?: string; skipped?: string; inviteErrors?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) redirect('/opetaja');

  const testDefinition = teacher!.gradeBand ? getTestByGradeBand(teacher!.gradeBand) : undefined;

  const students = await prisma.student.findMany({
    where: { teacherId: teacher!.id },
    include: {
      consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      inviteTokens: { orderBy: { createdAt: 'desc' } },
      questionnaireResponses: true,
      testSubmissions: { include: { grading: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const classCodes = [...new Set(students.map((s) => s.classCode).filter((c): c is string => !!c))].sort();

  const baseUrl = process.env.APP_BASE_URL ?? '';
  const imported = searchParams.imported ? Number(searchParams.imported) : null;
  const importErrors: { row: number; message: string }[] = searchParams.errors
    ? JSON.parse(searchParams.errors)
    : [];
  const sent = searchParams.sent ? Number(searchParams.sent) : null;
  const skipped = searchParams.skipped ? Number(searchParams.skipped) : 0;
  const inviteErrors: { name: string; message: string }[] = searchParams.inviteErrors
    ? JSON.parse(searchParams.inviteErrors)
    : [];

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/opetaja" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

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

        {sent !== null && (
          <Alert kind={inviteErrors.length > 0 ? 'info' : 'success'}>
            <p>
              Kutse saadeti {sent} inimesele.
              {skipped > 0 && ` ${skipped} jäeti vahele (juba tehtud).`}
            </p>
            {inviteErrors.length > 0 && (
              <>
                <p className="mt-2 font-medium">{inviteErrors.length} kutset ei õnnestunud saata:</p>
                <ul className="list-disc list-inside">
                  {inviteErrors.map((e, i) => (
                    <li key={i}>
                      {e.name}: {e.message}
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
            lapsevanema väljad. Nõusolekukutseid ei saadeta automaatselt — vali allpool nimekirjast, kellele
            ja millal kutse saata.
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

        {classCodes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Saada kutse tervele klassile</h2>
            <p className="text-sm text-slate-600 mb-3">
              Saadab kutse (või meeldetuletuse) kõigile valitud klassi õpilastele/lapsevanematele. Nõusoleku
              puhul ei saadeta neile, kes on juba nõustunud; küsimustike puhul saadetakse ainult neile, kelle
              nõusolek on juba antud ja kes pole veel vastanud.
            </p>
            <form action="/api/opetaja/opilased/invite" method="post" className="flex flex-wrap items-center gap-3">
              <select name="classCode" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">— vali klass —</option>
                {classCodes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select name="purpose" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="CONSENT">Nõusolek</option>
                <option value="QUESTIONNAIRE_EEL">Eelküsimustik</option>
                <option value="QUESTIONNAIRE_JAREL">Järelküsimustik</option>
                <option value="TEST_EEL">Test eel</option>
                <option value="TEST_JAREL">Test järel</option>
              </select>
              <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Saada kutse klassile
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Õpilaste nimekiri ({students.length})</h2>
          {!testDefinition && (
            <Alert kind="info">
              Testi veergude nägemiseks ja testikutsete saatmiseks määra töölaual ("Minu andmed" plokis) oma
              vanuseaste.
            </Alert>
          )}
          <StatusLegend showWithdrawn />
          <form action="/api/opetaja/opilased/invite" method="post">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1"></th>
                  <th className="py-1">Nimi</th>
                  <th className="py-1">Pseudonüüm</th>
                  <th className="py-1">Klass</th>
                  <th className="py-1">Rühm</th>
                  <th className="py-1 text-center">Nõus</th>
                  <th className="py-1 text-center" title="Eelküsimustik">
                    Eel
                  </th>
                  <th className="py-1 text-center" title="Järelküsimustik">
                    Järel
                  </th>
                  <th className="py-1 text-center" title="Test eel">
                    Test eel
                  </th>
                  <th className="py-1 text-center" title="Test järel">
                    Test järel
                  </th>
                  <th className="py-1">Link / vanem</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const consent = s.consentRecords[0];
                  const consentGiven = consent?.status === 'ANTUD';
                  const token = s.inviteTokens.find((t) => t.purpose === 'CONSENT');
                  const eelToken = s.inviteTokens.find((t) => t.purpose === 'QUESTIONNAIRE_EEL');
                  const jarelToken = s.inviteTokens.find((t) => t.purpose === 'QUESTIONNAIRE_JAREL');
                  const eelDone = s.questionnaireResponses.some((r) => r.questionnaireCode === 'lisa4-eel');
                  const jarelDone = s.questionnaireResponses.some((r) => r.questionnaireCode === 'lisa4-jarel');
                  const testEelToken = s.inviteTokens.find((t) => t.purpose === 'TEST_EEL');
                  const testJarelToken = s.inviteTokens.find((t) => t.purpose === 'TEST_JAREL');
                  const testEelSubmission = testDefinition
                    ? s.testSubmissions.find((t) => t.testCode === testDefinition.code && t.phase === 'EEL')
                    : undefined;
                  const testJarelSubmission = testDefinition
                    ? s.testSubmissions.find((t) => t.testCode === testDefinition.code && t.phase === 'JAREL')
                    : undefined;
                  return (
                    <tr key={s.id} className="border-b border-slate-100 align-top">
                      <td className="py-2">
                        <input type="checkbox" name="studentIds" value={s.id} className="h-4 w-4 rounded border-slate-300" />
                      </td>
                      <td className="py-2">
                        {s.name}
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-2 font-mono">{s.pseudonymCode}</td>
                      <td className="py-2">{s.classCode ?? '—'}</td>
                      <td className="py-2">{s.group === 'INTERVENTSIOON' ? 'Sekkumine' : 'Kontroll'}</td>
                      <td className="py-2 text-center">
                        {s.excludedFromAnalysis ? (
                          <span title="Nõusolek tagasi võetud" className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                        ) : (
                          <StatusDot status={questionnaireStatus(token?.firstViewedAt, consentGiven)} />
                        )}
                      </td>
                      <td className="py-2 text-center">
                        <StatusDot status={questionnaireStatus(eelToken?.firstViewedAt, eelDone)} />
                      </td>
                      <td className="py-2 text-center">
                        <StatusDot status={questionnaireStatus(jarelToken?.firstViewedAt, jarelDone)} />
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <StatusDot status={questionnaireStatus(testEelToken?.firstViewedAt, !!testEelSubmission)} />
                          {testDefinition ? (
                            testEelSubmission?.grading ? (
                              <span className="text-xs text-slate-500">
                                {testEelSubmission.grading.totalScore}/{testDefinition.maxScore}
                              </span>
                            ) : (
                              <a
                                href={`/opetaja/testi-hindamine/${s.id}/${testDefinition.code}/EEL`}
                                className="text-xs text-brand-600 underline hover:no-underline"
                              >
                                Hinda →
                              </a>
                            )
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <StatusDot status={questionnaireStatus(testJarelToken?.firstViewedAt, !!testJarelSubmission)} />
                          {testDefinition ? (
                            testJarelSubmission?.grading ? (
                              <span className="text-xs text-slate-500">
                                {testJarelSubmission.grading.totalScore}/{testDefinition.maxScore}
                              </span>
                            ) : (
                              <a
                                href={`/opetaja/testi-hindamine/${s.id}/${testDefinition.code}/JAREL`}
                                className="text-xs text-brand-600 underline hover:no-underline"
                              >
                                Hinda →
                              </a>
                            )
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-xs">
                        {s.isFifteenOrOlder ? (
                          token ? (
                            <code className="break-all">{`${baseUrl}/opilane/nousolek/${token.token}`}</code>
                          ) : (
                            '—'
                          )
                        ) : s.parentName ? (
                          `${s.parentName} (${s.parentEmail})`
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="submit"
                          formAction="/api/opetaja/opilased/remove"
                          name="studentId"
                          value={s.id}
                          className="text-xs text-red-600 underline hover:no-underline"
                        >
                          Eemalda
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-4 text-center text-slate-500">
                      Õpilasi pole veel lisatud
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {students.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select name="purpose" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  <option value="CONSENT">Nõusolek</option>
                  <option value="QUESTIONNAIRE_EEL">Eelküsimustik</option>
                  <option value="QUESTIONNAIRE_JAREL">Järelküsimustik</option>
                  <option value="TEST_EEL">Test eel</option>
                  <option value="TEST_JAREL">Test järel</option>
                </select>
                <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
                  Saada kutse/meeldetuletus valitud isikutele
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}
