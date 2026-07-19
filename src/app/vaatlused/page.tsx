import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

export default async function VaatlusedPage() {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) redirect('/login');

  const teacher =
    session.role === 'OPETAJA' ? await prisma.teacher.findUnique({ where: { userId: session.userId } }) : null;

  const marketplace = await prisma.researchPlanEntry.findMany({
    where: { expectingObserver: true, hidden: false },
    include: { teacher: { include: { user: true, school: true } }, observerUser: true, lessonPlan: true },
    orderBy: { date: 'asc' },
  });

  const myObservations = await prisma.researchPlanEntry.findMany({
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
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Minu tunnivaatlused</h1>
          <p className="text-sm text-slate-600">
            Kõik katsetunnid, kuhu õpetajad on vaatlejat oodanud, on koos allolevas broneerimise tabelis.
            Vali endale sobiv tund ja märgi end vaatlejaks — vajadusel saad broneeringu ka tühistada.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Tunnivaatluste broneerimise tabel</h2>
          {marketplace.length === 0 ? (
            <p className="text-sm text-slate-400">Ükski õpetaja pole hetkel vaatlejat oodanud.</p>
          ) : (
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1 pr-2">Kuupäev</th>
                  <th className="py-1 pr-2">Kool</th>
                  <th className="py-1 pr-2">Õpetaja</th>
                  <th className="py-1 pr-2">Meetod</th>
                  <th className="py-1 pr-2">Teema</th>
                  <th className="py-1 pr-2">Staatus</th>
                  <th className="py-1 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {marketplace.map((e) => {
                  const isOwnLesson = teacher != null && e.teacherId === teacher.id;
                  const isMyBooking = e.observerUserId === session.userId;
                  return (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">{e.date.toLocaleDateString('et-EE')}</td>
                      <td className="py-2 pr-2">{e.teacher.school.name}</td>
                      <td className="py-2 pr-2">{e.teacher.user.name}</td>
                      <td className="py-2 pr-2">{e.teacher.method ? METHOD_LABEL[e.teacher.method] : '—'}</td>
                      <td className="py-2 pr-2">{e.topic ?? '—'}</td>
                      <td className="py-2 pr-2">
                        {isOwnLesson ? (
                          <span className="text-slate-400">sinu enda tund</span>
                        ) : e.observerUserId ? (
                          <span className={isMyBooking ? 'text-brand-700 font-medium' : 'text-slate-500'}>
                            broneeritud{isMyBooking ? ' (sinu poolt)' : ''}
                          </span>
                        ) : (
                          <span className="text-green-700 font-medium">vaba</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {!isOwnLesson && !e.observerUserId && (
                          <form action="/api/vaatlused/broneeri" method="post">
                            <input type="hidden" name="planEntryId" value={e.id} />
                            <button className="text-brand-600 underline hover:no-underline">Broneeri</button>
                          </form>
                        )}
                        {isMyBooking && (
                          <form action="/api/vaatlused/tuhista" method="post">
                            <input type="hidden" name="planEntryId" value={e.id} />
                            <button className="text-red-600 underline hover:no-underline">Tühista</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          <h2 className="font-semibold text-slate-900 mb-3">Minu broneeritud tunnivaatlused</h2>
          {myObservations.length === 0 ? (
            <p className="text-sm text-slate-400">Sa pole veel ühtegi tunnivaatlust enda nimele broneerinud.</p>
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
                {myObservations.map((e) => {
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
                              (ownProtocol?.publishedAt
                                ? 'bg-green-100 text-green-700'
                                : ownProtocol?.submittedAt
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700')
                            }
                          >
                            {ownProtocol?.publishedAt ? 'Avalikustatud' : ownProtocol?.submittedAt ? 'Mustand' : 'Täida'}
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
