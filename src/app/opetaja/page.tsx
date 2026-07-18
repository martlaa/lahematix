import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';

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

  const ownQuestionnaire = await prisma.questionnaireResponse.findUnique({
    where: { questionnaireCode_teacherUserId: { questionnaireCode: 'lisa8', teacherUserId: session.userId } },
  });

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Minu andmed</h2>
          <p className="text-sm text-slate-600">
            Kool: {teacher?.school.name ?? '—'} <br />
            Meetod: {teacher?.method ?? 'valimata'} <br />
            Õpilasi nimekirjas: {teacher?.students.length ?? 0}
          </p>
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
          href="/opetaja/kysimustik"
          className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:border-brand-400"
        >
          <h2 className="font-semibold text-slate-900">
            Minu küsimustik {ownQuestionnaire ? '✅' : '— tuleb täita'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {ownQuestionnaire
              ? 'Küsimustik on täidetud. Vaata staatust.'
              : 'Täidetakse projekti lõpus (Lisa 8) — vajab enne oma nõusolekut.'}
          </p>
        </Link>
      </main>
    </>
  );
}
