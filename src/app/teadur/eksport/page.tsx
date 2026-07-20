import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';
import { DATASET_DEFINITIONS } from '@/lib/export/datasets';

export default async function TeadurEksportPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const datasets = await Promise.all(
    DATASET_DEFINITIONS.map(async (d) => ({ ...d, rowCount: (await d.build()).rows.length })),
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
