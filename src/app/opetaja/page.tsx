import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function OpetajaDashboard() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.userId },
    include: { school: true, students: true },
  });

  const ownConsent = await prisma.consentRecord.findFirst({
    where: { subjectType: 'OPETAJA', subjectId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  const hasConsent = ownConsent?.status === 'ANTUD';

  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
  const unbookedLessons = await prisma.researchPlanEntry.findMany({
    where: {
      expectingObserver: true,
      observerUserId: null,
      hidden: false,
      teacherId: { not: teacher?.id },
      date: { gte: new Date(), lte: twoWeeksOut },
    },
    include: { teacher: { include: { user: true, school: true } } },
    orderBy: { date: 'asc' },
  });

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Minu andmed</h2>
          <p className="text-sm text-slate-600">
            Kool: {teacher?.school.name ?? '—'} <br />
            Meetod: {teacher?.method ?? 'valimata'} <br />
            Õpilasi nimekirjas: {teacher?.students.length ?? 0}
          </p>
          <form action="/api/opetaja/gradeband" method="post" className="mt-3 flex items-center gap-2">
            <label className="text-sm text-slate-700">Vanuseaste (testide jaoks):</label>
            <select
              name="gradeBand"
              defaultValue={teacher?.gradeBand ?? ''}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">— vali —</option>
              <option value="4-6">4.–6. klass</option>
              <option value="7-9">7.–9. klass</option>
              <option value="10-12">10.–12. klass</option>
            </select>
            <button type="submit" className="text-xs text-brand-600 underline hover:no-underline">
              Salvesta
            </button>
          </form>
        </div>

        <Link
          href="/opetaja/nousolek"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">
            Minu nõusolek {hasConsent ? '✅' : '— tuleb täita'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {hasConsent ? 'Nõusolek on antud. Vaata või muuda.' : 'Palun täida oma nõusolekuvorm.'}
          </p>
        </Link>

        <Link
          href="/opetaja/opilased"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu õpilased</h2>
          <p className="text-sm text-slate-600 mt-1">Lisa ja halda oma klassi ja kontrollrühma õpilaste nimekirja.</p>
        </Link>

        <Link
          href="/opetaja/ulesanded"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu ülesanded</h2>
          <p className="text-sm text-slate-600 mt-1">
            Lisa ülesandeid/töölehti avalikku ülesannete panka, mida teised õpetajad-uurijad ja teadurid saavad
            oma tunnikavades kasutada.
          </p>
        </Link>

        <Link
          href="/opetaja/uuringuandmestik"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">Minu uuringuandmestik</h2>
          <p className="text-sm text-slate-600 mt-1">
            Küsimustik, uuringukava, uurijapäevik ja tunnivaatlused ühes kohas.
          </p>
        </Link>
      </main>
    </>
  );
}
