import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FormShell, Alert, Checkbox, TextInput, Field, PrimaryButton, SecondaryLinkButton } from '@/components/ui';
import { OpilaneConsentInfo } from '@/components/consentTexts';

export default async function OpilaneNousolekPage({ params }: { params: { token: string } }) {
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

  return (
    <FormShell
      title="Nõusolek uuringus osalemiseks"
      subtitle="LAHEMATE projekt — infoleht ja nõusolekuvorm õpilasele (15-aastane ja vanem, Lisa 3b)"
    >
      {hasConsent ? (
        <Alert kind="success">Oled juba andnud nõusoleku {latest?.givenAt.toLocaleDateString('et-EE')}.</Alert>
      ) : (
        <div className="prose prose-sm max-w-none text-slate-700 mb-6 space-y-4">
          <OpilaneConsentInfo />
        </div>
      )}

      {!hasConsent && (
        <form action="/api/consent/opilane" method="post">
          <input type="hidden" name="token" value={invite.token} />
          <input type="hidden" name="action" value="give" />
          <Field label="Ees- ja perekonnanimi">
            <TextInput name="fullName" required />
          </Field>
          <Checkbox
            name="tutvunud"
            required
            label="Olen tutvunud eespool kirjeldatud uuringu eesmärgi, käigu ja andmekaitsepõhimõtetega."
          />
          <Checkbox name="soovin" required label="SOOVIN uuringus osaleda." />
          <Checkbox
            name="nousAndmetega"
            required
            label="OLEN NÕUS, et minu kohta kogutud andmeid analüüsitakse eespool kirjeldatud viisil."
          />
          <div className="mt-6">
            <PrimaryButton type="submit">Kinnita nõusolek</PrimaryButton>
          </div>
        </form>
      )}

      {hasConsent && (
        <div className="flex items-center gap-3">
          <form action="/api/consent/opilane" method="post">
            <input type="hidden" name="token" value={invite.token} />
            <input type="hidden" name="action" value="withdraw" />
            <button type="submit" className="text-sm text-red-600 underline hover:no-underline">
              Võta nõusolek tagasi
            </button>
          </form>
          <SecondaryLinkButton href={`/opilane/nousolek/${invite.token}/kinnitus`}>
            Laadi nõusolekuvorm alla
          </SecondaryLinkButton>
        </div>
      )}
    </FormShell>
  );
}
