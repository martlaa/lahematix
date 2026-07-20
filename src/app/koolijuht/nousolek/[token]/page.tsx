import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FormShell, Alert, PrimaryButton, SecondaryLinkButton } from '@/components/ui';
import { KoolijuhtConsentInfo } from '@/components/consentTexts';

export default async function KoolijuhtNousolekTokenPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const invite = await prisma.inviteToken.findUnique({
    where: { token: params.token },
    include: { school: { include: { teachers: { include: { user: true } } } } },
  });

  if (!invite || !invite.school || invite.expiresAt < new Date()) {
    notFound();
  }

  const school = invite.school!;

  return (
    <FormShell
      title={`Nõusolek: ${school.name}`}
      subtitle="LAHEMATE projekt — infokiri ja nõusolekuvorm koolijuhile (Lisa 1)"
    >
      {school.consentGiven ? (
        <Alert kind="success">
          Oled andnud nõusoleku {school.consentAt?.toLocaleDateString('et-EE')}. Vajadusel saad selle
          allpool tagasi võtta.
        </Alert>
      ) : (
        <Alert kind="info">Nõusolekut ei ole veel antud.</Alert>
      )}

      <div className="prose prose-sm max-w-none text-slate-700 mb-6 space-y-4">
        <KoolijuhtConsentInfo />
      </div>

      <h3 className="font-medium text-slate-900 mb-2">Kooli õpetajad-uurijad</h3>
      <ul className="text-sm text-slate-700 list-disc list-inside mb-6">
        {school.teachers.map((t) => (
          <li key={t.id}>
            {t.user.name} ({t.user.email})
          </li>
        ))}
        {school.teachers.length === 0 && <li className="text-slate-400 list-none">Veel pole õpetajaid lisatud</li>}
      </ul>

      {!school.consentGiven ? (
        <form action="/api/consent/koolijuht" method="post">
          <input type="hidden" name="token" value={invite.token} />
          <input type="hidden" name="action" value="give" />
          <label className="flex items-start gap-2 mb-4 text-sm text-slate-800">
            <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-slate-300" />
            <span>
              Kinnitan, et olen tutvunud eespool kirjeldatud uuringu eesmärgi, käigu ja
              andmekaitsepõhimõtetega ning annan nõusoleku, et meie koolis võivad osaleda need
              matemaatikaõpetajad, kes on ise selleks soovi avaldanud, koos oma õpilastega (nii katse-
              kui vajadusel võrdlusrühmas).
            </span>
          </label>
          <PrimaryButton type="submit">Kinnita nõusolek</PrimaryButton>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <form action="/api/consent/koolijuht" method="post">
            <input type="hidden" name="token" value={invite.token} />
            <input type="hidden" name="action" value="withdraw" />
            <button type="submit" className="text-sm text-red-600 underline hover:no-underline">
              Võta nõusolek tagasi
            </button>
          </form>
          <SecondaryLinkButton href={`/koolijuht/nousolek/${invite.token}/kinnitus`}>
            Laadi nõusolekuvorm alla
          </SecondaryLinkButton>
        </div>
      )}
    </FormShell>
  );
}
