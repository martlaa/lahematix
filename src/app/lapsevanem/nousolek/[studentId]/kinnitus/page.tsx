import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { PrintableConsent } from '@/components/PrintableConsent';
import { LapsevanemConsentInfo } from '@/components/consentTexts';

export default async function LapsevanemKinnitusPage({ params }: { params: { studentId: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== 'LAPSEVANEM') redirect('/login');

  const parent = await prisma.parent.findUnique({ where: { userId: session.userId } });
  if (!parent) redirect('/lapsevanem');

  const student = await prisma.student.findFirst({
    where: { id: params.studentId, parentId: parent.id },
    include: { consentRecords: { where: { status: 'ANTUD' }, orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  if (!student) notFound();

  const latest = student.consentRecords[0];
  if (!latest) redirect(`/lapsevanem/nousolek/${student.id}`);

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
        { label: 'Lapsevanema nimi', value: session.name ?? '' },
        { label: 'Õpilase kood', value: student.pseudonymCode },
        { label: 'Kuupäev', value: latest.givenAt.toLocaleDateString('et-EE') },
      ]}
    >
      <LapsevanemConsentInfo />
    </PrintableConsent>
  );
}
