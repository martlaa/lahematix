import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default async function LapsevanemDashboard() {
  const session = await getSession();
  if (!session.userId || session.role !== 'LAPSEVANEM') redirect('/login');

  const parent = await prisma.parent.findUnique({
    where: { userId: session.userId },
    include: {
      students: {
        include: { consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 }, teacher: { include: { school: true } } },
      },
    },
  });

  return (
    <>
      <Header userLabel={`${session.name} (lapsevanem)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">Minu lapsed</h1>
        {parent?.students.map((s) => {
          const consent = s.consentRecords[0];
          const given = consent?.status === 'ANTUD';
          return (
            <Link
              key={s.id}
              href={`/lapsevanem/nousolek/${s.id}`}
              className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{s.teacher.school.name}</p>
                  <p className="text-sm text-slate-500">Õpilase kood: {s.pseudonymCode}</p>
                </div>
                <span
                  className={
                    'text-xs px-2 py-1 rounded-full ' +
                    (given ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')
                  }
                >
                  {given ? 'Nõusolek antud' : 'Nõusolek puudub'}
                </span>
              </div>
            </Link>
          );
        })}
        {(!parent || parent.students.length === 0) && (
          <p className="text-slate-500 text-sm">Ühtegi last pole veel Sinuga seotud.</p>
        )}
      </main>
    </>
  );
}
