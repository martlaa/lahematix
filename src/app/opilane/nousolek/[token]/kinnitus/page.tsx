import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { PrintableConsent } from '@/components/PrintableConsent';
import { OpilaneConsentInfo } from '@/components/consentTexts';

export default async function OpilaneKinnitusPage({ params }: { params: { token: string } }) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: {
      student: { include: { consentRecords: { where: { status: 'ANTUD' }, orderBy: { createdAt: 'desc' }, take: 1 } } },
    },
  });

  if (!invite || !invite.student) notFound();

  const student = invite.student;
  const latest = student.consentRecords[0];
  if (!latest) redirect(`/opilane/nousolek/${params.token}`);

  const details = latest.detailsJson ? JSON.parse(latest.detailsJson) : {};

  return (
    <PrintableConsent
      title="Nõusolekuvorm — õpilane 15+ (Lisa 3b)"
      subtitle="LAHEMATE projekt — õppijakeskse matemaatilise probleemilahenduse õppemetoodika arendusuuring"
      items={[
        {
          label: 'Olen tutvunud eespool kirjeldatud uuringu eesmärgi, käigu ja andmekaitsepõhimõtetega.',
          checked: !!details.tutvunud,
        },
        { label: 'SOOVIN uuringus osaleda.', checked: !!details.soovin },
        {
          label: 'OLEN NÕUS, et minu kohta kogutud andmeid analüüsitakse eespool kirjeldatud viisil.',
          checked: !!details.nousAndmetega,
        },
      ]}
      meta={[
        { label: 'Õpilase nimi', value: details.fullName ?? '' },
        { label: 'Õpilase kood', value: student.pseudonymCode },
        { label: 'Kuupäev', value: latest.givenAt.toLocaleDateString('et-EE') },
      ]}
    >
      <OpilaneConsentInfo />
    </PrintableConsent>
  );
}
