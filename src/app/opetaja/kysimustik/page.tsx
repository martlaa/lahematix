import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert, SecondaryLinkButton } from '@/components/ui';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { lisa8 } from '@/lib/questionnaires';

const methodLabels: Record<string, string> = {
  BOALER: "Jo Boaler'i Mathematical Mindset",
  LILJEDAHL: "Peter Liljedahl'i Thinking Classroom",
  TOH: 'Toh jt Mathematical Problem Solving for Everyone (MProSE)',
};

export default async function OpetajaKysimustikPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.userId },
    include: { school: true },
  });

  const ownConsent = await prisma.consentRecord.findFirst({
    where: { subjectType: 'OPETAJA', subjectId: session.userId },
    orderBy: { createdAt: 'desc' },
  });
  const hasConsent = ownConsent?.status === 'ANTUD';

  if (!hasConsent) {
    return (
      <>
        <Header userLabel={`${session.name} (õpetaja-uurija)`} />
        <FormShell title="Nõusolek on vajalik" subtitle={lisa8.title}>
          <Alert kind="info">Enne küsimustiku täitmist palun täida oma nõusolekuvorm.</Alert>
          <SecondaryLinkButton href="/opetaja/nousolek">Ava nõusolekuvorm</SecondaryLinkButton>
        </FormShell>
      </>
    );
  }

  const existing = await prisma.questionnaireResponse.findUnique({
    where: { questionnaireCode_teacherUserId: { questionnaireCode: 'lisa8', teacherUserId: session.userId } },
  });

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <FormShell title={lisa8.title} subtitle={`${session.name} — ${teacher?.school.name ?? ''}`}>
        {existing ? (
          <Alert kind="success">
            Oled selle küsimustiku juba täitnud {existing.submittedAt.toLocaleDateString('et-EE')}. Täname
            vastamast!
          </Alert>
        ) : (
          <QuestionnaireForm
            definition={lisa8}
            action="/api/kysimustik/opetaja"
            aboveForm={
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 mb-6 text-sm text-slate-700">
                <p>Kool: {teacher?.school.name ?? '—'}</p>
                <p>Peamiselt rakendatud meetod: {teacher?.method ? methodLabels[teacher.method] : 'valimata'}</p>
              </div>
            }
          />
        )}
      </FormShell>
    </>
  );
}
