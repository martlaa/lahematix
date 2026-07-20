import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FormShell, Alert } from '@/components/ui';
import { TestForm } from '@/components/TestForm';
import { getTestByGradeBand } from '@/lib/tests';

const PHASE_BY_PURPOSE: Record<string, 'EEL' | 'JAREL'> = {
  TEST_EEL: 'EEL',
  TEST_JAREL: 'JAREL',
};

export default async function OpilaneTestPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: { student: { include: { teacher: true } } },
  });

  const phase = invite ? PHASE_BY_PURPOSE[invite.purpose] : undefined;

  if (!invite || !invite.student || !phase || invite.expiresAt < new Date()) {
    notFound();
  }

  const student = invite.student!;
  const definition = student.teacher.gradeBand ? getTestByGradeBand(student.teacher.gradeBand) : undefined;
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
          Enne testi sooritamist on vaja, et uuringus osalemiseks oleks antud nõusolek. Kui arvad, et see on
          eksitus, võta ühendust oma õpetajaga.
        </Alert>
      </FormShell>
    );
  }

  const existing = await prisma.testSubmission.findUnique({
    where: { testCode_phase_studentId: { testCode: definition!.code, phase: phase!, studentId: student.id } },
  });

  if (!existing && !invite.firstViewedAt) {
    // Märgi ära, et link on avatud — annab õpetaja vaates "alustatud, kuid pooleli" signaali.
    await prisma.inviteToken.update({ where: { id: invite.id }, data: { firstViewedAt: new Date() } });
  }

  return (
    <FormShell title={definition!.title} subtitle={`LAHEMATE projekt — ${student.name}`}>
      {existing ? (
        <Alert kind="success">
          Oled selle testi juba sooritanud{' '}
          {(existing.submittedAt ?? existing.createdAt).toLocaleDateString('et-EE')}. Täname!
        </Alert>
      ) : (
        <TestForm
          definition={definition!}
          action="/api/test/opilane"
          hiddenFields={{ token: invite.token }}
          seed={invite.token}
        />
      )}
    </FormShell>
  );
}
