import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { PrintableConsent } from '@/components/PrintableConsent';
import { LapsevanemConsentInfo } from '@/components/consentTexts';

export default async function LapsevanemKinnitusPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: {
      student: { include: { consentRecords: { where: { status: 'ANTUD' }, orderBy: { createdAt: 'desc' }, take: 1 } } },
    },
  });

  if (!invite || !invite.student) notFound();

  const student = invite.student;
  const latest = student.consentRecords[0];
  if (!latest) redirect(`/lapsevanem/nousolek/${params.token}`);

  const details = latest.detailsJson ? JSON.parse(latest.detailsJson) : {};

  return (
    <PrintableConsent
      title="Nõusolekuvorm — lapsevanem ja laps (Lisa 3)"
      subtitle="LAHEMATE projekt — õppijakeskse matemaatilise probleemilahenduse õppemetoodika arendusuuring"
      items={[
        {
          label: 'Annan loa oma lapsel uuringus osaleda ja tema isikuandmeid eelkirjeldatud viisil töödelda.',
          checked: !!details.loaOsaleda,
        },
        {
          label:
            'Lapsele on uuringut talle arusaadavalt tutvustatud eespool oleva selgituse abil ja laps on suuliselt kinnitanud, et on nõus osalema.',
          checked: !!details.lapseleTutvustatud,
        },
      ]}
      meta={[
        { label: 'Lapsevanema nimi', value: student.parentName ?? '' },
        { label: 'Õpilase kood', value: student.pseudonymCode },
        { label: 'Kuupäev', value: latest.givenAt.toLocaleDateString('et-EE') },
      ]}
    >
      <LapsevanemConsentInfo />
    </PrintableConsent>
  );
}
