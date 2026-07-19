import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';

export default async function VaatlusedPage() {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) redirect('/login');

  const assignments = await prisma.researchPlanEntry.findMany({
    where: { observerUserId: session.userId, hidden: false },
    include: {
      teacher: { include: { user: true, school: true } },
      lessonPlan: { include: { observationProtocols: { where: { observerUserId: session.userId } } } },
    },
    orderBy: { date: 'asc' },
  });

  return (
    <>
      <Header userLabel={`${session.name} (${session.role === 'TEADUR' ? 'teadur' : 'õpetaja-uurija'})`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Minu vaatlused</h1>
          <p className="text-sm text-slate-600">
            Siin näed katsetunde, kuhu oled määratud vaatlejaks. Saad tunnikavaga tutvuda, seda
            kommenteerida enne ja pärast tundi ning täita tunnivaatlusprotokolli.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          {assignments.length === 0 ? (
            <p className="text-sm text-slate-400">Sind pole veel ühegi tunni vaatlejaks määratud.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Kuupäev</th>
                  <th className="py-1 pr-2">Õpetaja</th>
                  <th className="py-1 pr-2">Kool</th>
                  <th className="py-1 pr-2">Teema</th>
                  <th className="py-1 pr-2">Tunnikava</th>
                  <th className="py-1 pr-2">Protokoll</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((e) => {
                  const ownProtocol = e.lessonPlan?.observationProtocols[0];
                  return (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">{e.date.toLocaleDateString('et-EE')}</td>
                      <td className="py-2 pr-2">{e.teacher.user.name}</td>
                      <td className="py-2 pr-2">{e.teacher.school.name}</td>
                      <td className="py-2 pr-2">{e.topic ?? '—'}</td>
                      <td className="py-2 pr-2">
                        {e.lessonPlan ? (
                          <a href={`/vaatlused/${e.id}`} className="text-brand-600 underline hover:no-underline">
                            ava
                          </a>
                        ) : (
                          <span className="text-slate-400">pole veel valmis</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {e.lessonPlan ? (
                          <a
                            href={`/vaatlused/${e.id}/protokoll`}
                            className={
                              'inline-block rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ' +
                              (ownProtocol?.submittedAt
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700')
                            }
                          >
                            {ownProtocol?.submittedAt ? 'Muuda' : 'Täida'}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
