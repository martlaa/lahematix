import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FormShell, Alert, Checkbox, PrimaryButton, SecondaryLinkButton } from '@/components/ui';
import { LapsevanemConsentInfo } from '@/components/consentTexts';

export default async function LapsevanemNousolekTokenPage({ params }: { params: { token: string } }) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: { student: { include: { consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 } } } },
  });

  if (!invite || !invite.student || invite.expiresAt < new Date()) {
    notFound();
  }

  const student = invite.student!;
  const latest = student.consentRecords[0];
  const hasConsent = latest?.status === 'ANTUD';
  const details = latest?.detailsJson ? JSON.parse(latest.detailsJson) : {};

  if (!hasConsent && !invite.firstViewedAt) {
    // Märgi ära, et link on avatud — annab õpetaja vaates "alustatud, kuid pooleli" signaali.
    await prisma.inviteToken.update({ where: { id: invite.id }, data: { firstViewedAt: new Date() } });
  }

  return (
    <FormShell
      title={`Nõusolek: ${student.name}`}
      subtitle="LAHEMATE projekt — infoleht ja nõusolekuvorm lapsevanemale ja lapsele (Lisa 3)"
    >
      {hasConsent && (
        <Alert kind="success">
          Nõusolek on antud {latest?.givenAt.toLocaleDateString('et-EE')}. Saad selle allpool igal ajal
          tagasi võtta.
        </Alert>
      )}

      <div className="prose prose-sm max-w-none text-slate-700 mb-6 space-y-4">
        <LapsevanemConsentInfo />
      </div>

      {!hasConsent ? (
        <form action="/api/consent/lapsevanem" method="post">
          <input type="hidden" name="token" value={invite.token} />
          <input type="hidden" name="action" value="give" />
          <Checkbox
            name="loaOsaleda"
            required
            defaultChecked={details.loaOsaleda}
            label="Annan loa oma lapsel uuringus osaleda ja tema isikuandmeid eelkirjeldatud viisil töödelda."
          />
          <Checkbox
            name="lapseleTutvustatud"
            required
            defaultChecked={details.lapseleTutvustatud}
            label="Lapsele on uuringut talle arusaadavalt tutvustatud eespool oleva selgituse abil ja laps on suuliselt kinnitanud, et on nõus osalema."
          />
          <div className="mt-6">
            <PrimaryButton type="submit">Kinnita nõusolek</PrimaryButton>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <form action="/api/consent/lapsevanem" method="post">
            <input type="hidden" name="token" value={invite.token} />
            <input type="hidden" name="action" value="withdraw" />
            <button type="submit" className="text-sm text-red-600 underline hover:no-underline">
              Võta nõusolek tagasi
            </button>
          </form>
          <SecondaryLinkButton href={`/lapsevanem/nousolek/${invite.token}/kinnitus`}>
            Laadi nõusolekuvorm alla
          </SecondaryLinkButton>
        </div>
      )}
    </FormShell>
  );
}
