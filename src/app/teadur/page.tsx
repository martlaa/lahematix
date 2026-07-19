import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';

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

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        <Link
          href="/vaatlused"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu vaatlused</h2>
          <p className="text-sm text-slate-600 mt-1">
            Katsetunnid, kus oled õpetajale-uurijale vaatlejaks määratud — tunnikava, kommentaarid ja
            vaatlusprotokoll.
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
