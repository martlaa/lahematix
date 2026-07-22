import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
      <p className="text-3xl font-semibold text-brand-700">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default async function TeadurDashboard() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const [schoolsTotal, schoolsConsented, teachersTotal, teacherConsents, studentsTotal, studentsConsented, studentsExcluded] =
    await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { consentGiven: true } }),
      prisma.teacher.count(),
      prisma.consentRecord.groupBy({
        by: ['subjectId'],
        where: { subjectType: 'OPETAJA', status: 'ANTUD' },
      }),
      prisma.student.count(),
      prisma.student.count({
        where: {
          consentRecords: { some: { status: 'ANTUD' } },
          excludedFromAnalysis: false,
        },
      }),
      prisma.student.count({ where: { excludedFromAnalysis: true } }),
    ]);

  const schools = await prisma.school.findMany({
    include: {
      teachers: {
        include: {
          user: true,
          students: { include: { consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
  const unbookedLessons = await prisma.researchPlanEntry.findMany({
    where: {
      expectingObserver: true,
      observerUserId: null,
      hidden: false,
      date: { gte: new Date(), lte: twoWeeksOut },
    },
    include: { teacher: { include: { user: true, school: true } } },
    orderBy: { date: 'asc' },
  });

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {unbookedLessons.length > 0 && (
          <Alert kind="info">
            <p className="font-medium mb-1">Need tunnid ootavad veel vaatlejat:</p>
            <ul className="space-y-1">
              {unbookedLessons.map((e) => (
                <li key={e.id}>
                  Õpetaja {e.teacher.user.name} tund {e.date.toLocaleDateString('et-EE')} kuupäeval{' '}
                  {e.teacher.school.name} koolis ootab vaatlejat — kas saaksid ennast pakkuda?
                </li>
              ))}
            </ul>
            <a href="/vaatlused" className="underline hover:no-underline">
              Ava tunnivaatluste broneerimise tabel
            </a>
          </Alert>
        )}

        <Link
          href="/vaatlused"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu tunnivaatlused</h2>
          <p className="text-sm text-slate-600 mt-1">
            Broneeri end õpetaja-uurija tunni vaatlejaks või vaata oma juba broneeritud tunnivaatlusi.
          </p>
        </Link>

        <Link
          href="/teadur/naidistunnikavad"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu näidistunnid</h2>
          <p className="text-sm text-slate-600 mt-1">
            Koosta näidistunnikavu, mida õpetajad-uurijad näevad eeskujuna oma tunnikava koostamisel.
          </p>
        </Link>

        <Link
          href="/teadur/ulesanded"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu ülesanded</h2>
          <p className="text-sm text-slate-600 mt-1">
            Lisa ülesandeid/töölehti avalikku ülesannete panka, mida õpetajad-uurijad saavad oma tunnikavades
            kasutada.
          </p>
        </Link>

        <Link
          href="/teadur/instrumendid"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Uuringu andmekogumisinstrumendid</h2>
          <p className="text-sm text-slate-600 mt-1">
            Katseta ise kõiki uuringus kasutatavaid instrumente — küsimustikud, uurijapäevik, testid ja
            tunnivaatlusprotokoll.
          </p>
        </Link>

        <Link
          href="/teadur/eksport"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Andmete eksport</h2>
          <p className="text-sm text-slate-600 mt-1">
            Ekspordi pseudonümiseeritud uurimisandmestik CSV või XLSX formaadis, andmestiku kaupa.
          </p>
        </Link>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Koole nõusolekuga" value={`${schoolsConsented}/${schoolsTotal}`} />
          <StatCard label="Õpetajaid nõusolekuga" value={`${teacherConsents.length}/${teachersTotal}`} />
          <StatCard label="Õpilasi nõusolekuga" value={`${studentsConsented}/${studentsTotal}`} />
          <StatCard label="Väljajäetud analüüsist" value={studentsExcluded} />
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Koolide ja klasside seis</h2>
          <div className="space-y-4">
            {schools.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-4">
                <p className="font-medium">
                  {s.name} {s.consentGiven ? '✅' : '⏳'}
                </p>
                <ul className="mt-2 text-sm text-slate-700 space-y-1">
                  {s.teachers.map((t) => {
                    const given = t.students.filter((st) => st.consentRecords[0]?.status === 'ANTUD').length;
                    return (
                      <li key={t.id}>
                        {t.user.name} — {given}/{t.students.length} õpilast nõusolekuga
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
