import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PrintableConsent } from '@/components/PrintableConsent';
import { OpetajaConsentInfo } from '@/components/consentTexts';

export default async function OpetajaKinnitusPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const latest = await prisma.consentRecord.findFirst({
    where: { subjectType: 'OPETAJA', subjectId: session.userId, status: 'ANTUD' },
    orderBy: { createdAt: 'desc' },
  });
  if (!latest) redirect('/opetaja/nousolek');

  const details = latest.detailsJson ? JSON.parse(latest.detailsJson) : {};
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.userId },
    include: { school: true },
  });

  return (
    <PrintableConsent
      title="Nõusolekuvorm — õpetaja-uurija (Lisa 2)"
      subtitle="LAHEMATE projekt — õppijakeskse matemaatilise probleemilahenduse õppemetoodika arendusuuring"
      items={[
        {
          label:
            'Olen tutvunud eespool kirjeldatud uuringu eesmärgi, käigu ja andmekaitsepõhimõtetega ning annan nõusoleku osaleda uuringus eelkirjeldatud viisil (katsetunnid, uurijapäevik, küsimustik).',
          checked: !!details.osalemine,
        },
        {
          label:
            'Annan nõusoleku, et minu tundi vaatleb kolleeg ja/või ülikooli teadlane tunnivaatlusprotokolli alusel, ning olen ise nõus vaatlema kolleegi tundi.',
          checked: !!details.vaatlus,
        },
        {
          label: 'Annan nõusoleku osaleda veebipõhises rühmaintervjuus, mis salvestatakse (heli ja video) ning transkribeeritakse.',
          checked: !!details.intervjuu,
        },
      ]}
      meta={[
        { label: 'Õpetaja nimi', value: session.name ?? '' },
        { label: 'Kool', value: teacher?.school.name ?? '—' },
        { label: 'Kuupäev', value: latest.givenAt.toLocaleDateString('et-EE') },
      ]}
    >
      <OpetajaConsentInfo />
    </PrintableConsent>
  );
}
