import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { DATASET_DEFINITIONS } from '@/lib/export/datasets';
import { isGatedDataset } from '@/lib/export/types';

export default async function TeadurEksportPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const myRequests = await prisma.exportRequest.findMany({
    where: { requestedByUserId: session.userId },
    orderBy: { requestedAt: 'desc' },
  });
  const latestRequestByDataset = new Map<string, (typeof myRequests)[number]>();
  for (const r of myRequests) {
    if (!latestRequestByDataset.has(r.datasetKey)) latestRequestByDataset.set(r.datasetKey, r);
  }

  const datasets = await Promise.all(
    DATASET_DEFINITIONS.map(async (d) => ({
      ...d,
      rowCount: (await d.build()).rows.length,
      gated: isGatedDataset(d.key),
      request: latestRequestByDataset.get(d.key) ?? null,
    })),
  );

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/teadur" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Andmete eksport</h1>
          <p className="text-sm text-slate-600">
            Kõik allolevad andmestikud on pseudonümiseeritud — need ei sisalda õpilaste, õpetajate-uurijate
            ega lapsevanemate nimesid ega kontaktandmeid, ainult uurimisandmestiku pseudonüümikoode (vt
            eetikataotlus p 4.1–4.2). Teaduri enda instrumendikatsetused ja näidistunnikavad ei ole päris
            uurimisandmestik, seetõttu neid siit ei ekspordita.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Küsimustike, testitulemuste ja uurijapäeviku andmed sisaldavad hoiaku-/õpitulemuste andmeid —
            nende allalaadimine vajab iga kord admini kinnitust (vt allpool "Taotle ekspordiluba").
          </p>
        </div>

        <Alert kind="info">
          Pseudonümiseeritud andmete taaskasutus ja avaldamine peab vastama andmehaldusplaanis kirjeldatule
          — vt eetikataotlus p 4.2. Kontaktandmete (nimed, e-postid) haldamine käib jätkuvalt õpetaja
          õpilaste nimekirja ja admini kasutajahalduse kaudu, mitte selle ekspordi kaudu.
        </Alert>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-2">Andmestik</th>
                <th className="py-2 pr-2">Kirjeldus</th>
                <th className="py-2 pr-2 text-right">Ridu</th>
                <th className="py-2 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d) => (
                <tr key={d.key} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-2 font-medium text-slate-900">{d.label}</td>
                  <td className="py-3 pr-2 text-slate-600">{d.description}</td>
                  <td className="py-3 pr-2 text-right text-slate-700">{d.rowCount}</td>
                  <td className="py-3 pr-2 whitespace-nowrap">
                    {!d.gated && (
                      <>
                        <a
                          href={`/api/teadur/eksport/${d.key}?format=csv`}
                          className="text-brand-600 underline hover:no-underline mr-3"
                        >
                          CSV
                        </a>
                        <a
                          href={`/api/teadur/eksport/${d.key}?format=xlsx`}
                          className="text-brand-600 underline hover:no-underline"
                        >
                          XLSX
                        </a>
                      </>
                    )}
                    {d.gated && d.request?.status === 'PENDING' && (
                      <span className="text-xs text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5">
                        Ootab admini kinnitust
                      </span>
                    )}
                    {d.gated && d.request?.status === 'APPROVED' && (
                      <div className="space-y-1">
                        <div>
                          <a
                            href={`/api/teadur/eksport/${d.key}?format=csv`}
                            className="text-brand-600 underline hover:no-underline mr-3"
                          >
                            CSV
                          </a>
                          <a
                            href={`/api/teadur/eksport/${d.key}?format=xlsx`}
                            className="text-brand-600 underline hover:no-underline"
                          >
                            XLSX
                          </a>
                        </div>
                        <p className="text-xs text-slate-500">Luba kehtib ühekordseks allalaadimiseks.</p>
                      </div>
                    )}
                    {d.gated && (!d.request || d.request.status === 'DENIED' || d.request.status === 'FULFILLED') && (
                      <div className="space-y-1">
                        {d.request?.status === 'DENIED' && (
                          <p className="text-xs text-red-600">
                            Eelmine taotlus lükati tagasi{d.request.decisionNote ? `: ${d.request.decisionNote}` : '.'}
                          </p>
                        )}
                        {d.request?.status === 'FULFILLED' && (
                          <p className="text-xs text-slate-500">Eelmine luba on ära kasutatud.</p>
                        )}
                        <form action="/api/teadur/eksport/taotle" method="post">
                          <input type="hidden" name="datasetKey" value={d.key} />
                          <button className="text-xs text-brand-600 underline hover:no-underline">
                            Taotle ekspordiluba
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
