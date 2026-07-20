import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { PrintableConsent } from '@/components/PrintableConsent';
import { KoolijuhtConsentInfo } from '@/components/consentTexts';

export default async function KoolijuhtKinnitusPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: { school: true },
  });

  if (!invite || !invite.school) notFound();
  const school = invite.school!;
  if (!school.consentGiven) redirect(`/koolijuht/nousolek/${params.token}`);

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
        { label: 'Koolijuhi nimi', value: school.directorName ?? '' },
        { label: 'Kool', value: school.name },
        { label: 'Kuupäev', value: school.consentAt?.toLocaleDateString('et-EE') ?? '' },
      ]}
    >
      <KoolijuhtConsentInfo />
    </PrintableConsent>
  );
}
