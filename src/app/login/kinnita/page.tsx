import { prisma } from '@/lib/prisma';
import { FormShell, Alert, PrimaryButton } from '@/components/ui';

// See leht loeb tokeni olekut ainult (findUnique — ei muuda midagi), et olla
// kahjutu ka siis, kui mõni e-posti turvasüsteem selle automaatselt avab.
// Tokeni tegelik tarbimine ja sessiooni loomine toimub alles allpool oleva
// "Kinnita sisselogimine" nupu POST-päringuga (vt /api/auth/verify).
export default async function LoginKinnitaPage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token ?? '';

  const loginToken = token
    ? await prisma.loginToken.findUnique({ where: { token }, include: { user: true } })
    : null;

  const valid =
    !!loginToken &&
    !loginToken.usedAt &&
    loginToken.expiresAt > new Date() &&
    loginToken.user.status !== 'DISABLED';

  if (!valid) {
    return (
      <FormShell title="Sisselogimine">
        <Alert kind="error">
          Link on aegunud, juba kasutatud või vale.{' '}
          <a href="/login" className="underline hover:no-underline">
            Taotle uut linki
          </a>
          .
        </Alert>
      </FormShell>
    );
  }

  return (
    <FormShell title="Sisselogimine" subtitle={`Tere, ${loginToken!.user.name}!`}>
      <p className="text-sm text-slate-600 mb-6">
        Vajuta allolevat nuppu, et sisse logida. See kinnitussamm on lisatud, kuna mõne kasutaja
        e-posti turvasüsteem (nt "Safe Links") avab kirjas olevaid linke automaatselt juba enne
        sinu enda klõpsu — see nupp tagab, et sisse logib ikka Sina ise, mitte turvasüsteem sinu eest.
      </p>
      <form action="/api/auth/verify" method="post">
        <input type="hidden" name="token" value={token} />
        <PrimaryButton type="submit">Kinnita sisselogimine</PrimaryButton>
      </form>
    </FormShell>
  );
}
