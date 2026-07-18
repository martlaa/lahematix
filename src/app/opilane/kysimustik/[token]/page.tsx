import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FormShell, Alert } from '@/components/ui';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { getQuestionnaireByCode } from '@/lib/questionnaires';

const CODE_BY_PURPOSE: Record<string, string> = {
  QUESTIONNAIRE_EEL: 'lisa4-eel',
  QUESTIONNAIRE_JAREL: 'lisa4-jarel',
};

export default async function OpilaneKysimustikPage({ params }: { params: { token: string } }) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: { student: true },
  });

  const questionnaireCode = invite ? CODE_BY_PURPOSE[invite.purpose] : undefined;

  if (!invite || !invite.student || !questionnaireCode || invite.expiresAt < new Date()) {
    notFound();
  }

  const student = invite.student!;
  const definition = getQuestionnaireByCode(questionnaireCode!);
  if (!definition) notFound();

  const latestConsent = await prisma.consentRecord.findFirst({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });
  const hasConsent = latestConsent?.status === 'ANTUD';

  if (!hasConsent) {
    return (
      <FormShell title="Nõusolek on vajalik" subtitle={definition!.title}>
        <Alert kind="info">
          Enne küsimustiku täitmist on vaja, et uuringus osalemiseks oleks antud nõusolek. Kui arvad, et
          see on eksitus, võta ühendust oma õpetajaga.
        </Alert>
      </FormShell>
    );
  }

  const existing = await prisma.questionnaireResponse.findUnique({
    where: { questionnaireCode_studentId: { questionnaireCode: questionnaireCode!, studentId: student.id } },
  });

  return (
    <FormShell title={definition!.title} subtitle={`LAHEMATE projekt — ${student.name}`}>
      {existing ? (
        <Alert kind="success">
          Oled selle küsimustiku juba täitnud {existing.submittedAt.toLocaleDateString('et-EE')}. Täname
          vastamast!
        </Alert>
      ) : (
        <QuestionnaireForm
          definition={definition!}
          action="/api/kysimustik/opilane"
          hiddenFields={{ token: invite.token }}
        />
      )}
    </FormShell>
  );
}
