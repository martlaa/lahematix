import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Alert } from '@/components/ui';

export default async function AdminAndmekustutusKinnitaPage({
  searchParams,
}: {
  searchParams: { type?: string; id?: string };
}) {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') redirect('/login');

  const type = searchParams.type;
  const id = searchParams.id;
  if ((type !== 'student' && type !== 'teacher') || !id) notFound();

  let pseudonym: string;
  let fieldsToScrub: string[];

  if (type === 'student') {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student || student.identityDeletedAt || !student.excludedFromAnalysis) notFound();
    pseudonym = student.pseudonymCode;
    fieldsToScrub = ['Nimi', 'E-post', 'Lapsevanema nimi (kui täidetud)', 'Lapsevanema e-post (kui täidetud)'];
  } else {
    const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
    if (!teacher || teacher.user.identityDeletedAt) notFound();
    const hasWithdrawal = await prisma.consentRecord.findFirst({
      where: { subjectType: 'OPETAJA', subjectId: teacher.userId, status: 'TAGASI_VOETUD' },
    });
    if (!hasWithdrawal) notFound();
    pseudonym = teacher.pseudonymCode;
    fieldsToScrub = ['Nimi', 'E-post', 'Konto muudetakse ligipääsematuks (staatus DISABLED)'];
  }

  return (
    <>
      <Header userLabel={`${session.name} (admin)`} />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/admin/andmekustutus" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Kinnita jäädav kustutamine</h1>
          <p className="text-sm text-slate-600 mb-4">
            Pseudonüüm: <strong>{pseudonym}</strong>
          </p>
          <Alert kind="error">
            See toiming on pöördumatu. Järgnevad väljad kustutatakse jäädavalt:
            <ul className="list-disc list-inside mt-1">
              {fieldsToScrub.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-2">
              Pseudonümiseeritud uurimisandmestik (testitulemused, küsimustikuvastused, uurijapäeviku
              sissekanded jms) SÄILIB, seotuna sama pseudonüümikoodiga.
            </p>
          </Alert>
          <form action="/api/admin/andmekustutus" method="post">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="id" value={id} />
            <button className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700">
              Jah, kustuta jäädavalt
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
