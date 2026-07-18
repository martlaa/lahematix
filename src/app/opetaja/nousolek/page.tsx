import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert, Checkbox, PrimaryButton, SecondaryLinkButton } from '@/components/ui';
import { OpetajaConsentInfo } from '@/components/consentTexts';

export default async function OpetajaNousolekPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') redirect('/login');

  const latest = await prisma.consentRecord.findFirst({
    where: { subjectType: 'OPETAJA', subjectId: session.userId },
    orderBy: { createdAt: 'desc' },
  });
  const hasConsent = latest?.status === 'ANTUD';
  const details = latest?.detailsJson ? JSON.parse(latest.detailsJson) : {};

  return (
    <>
      <Header userLabel={`${session.name} (õpetaja-uurija)`} />
      <FormShell title="Minu nõusolek" subtitle="LAHEMATE projekt — infoleht ja nõusolekuvorm õpetajale-uurijale (Lisa 2)">
        {hasConsent && (
          <Alert kind="success">
            Nõusolek on antud {latest?.givenAt.toLocaleDateString('et-EE')}. Saad allpool oma valikuid
            muuta või nõusoleku täielikult tagasi võtta.
          </Alert>
        )}

        <div className="prose prose-sm max-w-none text-slate-700 mb-6 space-y-4">
          <OpetajaConsentInfo />
        </div>

        <form action="/api/consent/opetaja" method="post">
          <input type="hidden" name="action" value="give" />
          <Checkbox
            name="osalemine"
            required
            defaultChecked={details.osalemine}
            label="Olen tutvunud eespool kirjeldatud uuringu eesmärgi, käigu ja andmekaitsepõhimõtetega ning annan nõusoleku osaleda uuringus eelkirjeldatud viisil (katsetunnid, uurijapäevik, küsimustik)."
          />
          <Checkbox
            name="vaatlus"
            defaultChecked={details.vaatlus}
            label="Annan nõusoleku, et minu tundi vaatleb kolleeg ja/või ülikooli teadlane tunnivaatlusprotokolli alusel, ning olen ise nõus vaatlema kolleegi tundi."
          />
          <Checkbox
            name="intervjuu"
            defaultChecked={details.intervjuu}
            label="Annan nõusoleku osaleda veebipõhises rühmaintervjuus, mis salvestatakse (heli ja video) ning transkribeeritakse."
          />
          <div className="mt-6 flex items-center gap-3">
            <PrimaryButton type="submit">{hasConsent ? 'Uuenda nõusolekut' : 'Kinnita nõusolek'}</PrimaryButton>
            {hasConsent && (
              <SecondaryLinkButton href="/opetaja/nousolek/kinnitus">Laadi nõusolekuvorm alla</SecondaryLinkButton>
            )}
          </div>
        </form>

        {hasConsent && (
          <form action="/api/consent/opetaja" method="post" className="mt-4">
            <input type="hidden" name="action" value="withdraw" />
            <button type="submit" className="text-sm text-red-600 underline hover:no-underline">
              Võta nõusolek täielikult tagasi
            </button>
          </form>
        )}
      </FormShell>
    </>
  );
}
