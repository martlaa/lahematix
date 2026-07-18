import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PrintableConsent } from '@/components/PrintableConsent';
import { KoolijuhtConsentInfo } from '@/components/consentTexts';

export default async function KoolijuhtKinnitusPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'KOOLIJUHT') redirect('/login');

  const school = await prisma.school.findUnique({ where: { directorId: session.userId } });
  if (!school || !school.consentGiven) redirect('/koolijuht/nousolek');

  return (
    <PrintableConsent
      title="Nõusolekuvorm — koolijuht (Lisa 1)"
      subtitle="LAHEMATE projekt — õppijakeskse matemaatilise probleemilahenduse õppemetoodika arendusuuring"
      items={[
        {
          label:
            'Kinnitan, et olen tutvunud eespool kirjeldatud uuringu eesmärgi, käigu ja andmekaitsepõhimõtetega ning annan nõusoleku, et meie koolis võivad osaleda need matemaatikaõpetajad, kes on ise selleks soovi avaldanud, koos oma õpilastega (nii katse- kui vajadusel võrdlusrühmas).',
          checked: true,
        },
      ]}
      meta={[
        { label: 'Koolijuhi nimi', value: session.name ?? '' },
        { label: 'Kool', value: school.name },
        { label: 'Kuupäev', value: school.consentAt?.toLocaleDateString('et-EE') ?? '' },
      ]}
    >
      <KoolijuhtConsentInfo />
    </PrintableConsent>
  );
}
