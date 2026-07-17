import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert, PrimaryButton } from '@/components/ui';

export default async function KoolijuhtNousolekPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'KOOLIJUHT') redirect('/login');

  const school = await prisma.school.findUnique({
    where: { directorId: session.userId },
    include: { teachers: { include: { user: true } } },
  });

  if (!school) {
    return (
      <>
        <Header userLabel={session.name} />
        <FormShell title="Kool pole veel määratud">
          <Alert kind="info">
            Sinu kasutajaga pole veel ühtegi kooli seotud. Palun võta ühendust projekti meeskonnaga.
          </Alert>
        </FormShell>
      </>
    );
  }

  return (
    <>
      <Header userLabel={`${session.name} (koolijuht)`} />
      <FormShell
        title={`Nõusolek: ${school.name}`}
        subtitle="LAHEMATE projekt — infokiri ja nõusolekuvorm koolijuhile"
      >
        {school.consentGiven ? (
          <Alert kind="success">
            Oled andnud nõusoleku {school.consentAt?.toLocaleDateString('et-EE')}. Vajadusel saad selle
            allpool tagasi võtta.
          </Alert>
        ) : (
          <Alert kind="info">Nõusolekut ei ole veel antud.</Alert>
        )}

        <div className="prose prose-sm max-w-none text-slate-700 mb-6">
          <p>
            Tallinna Ülikool ja Tartu Ülikool viivad Haridus- ja Teadusministeeriumi tellimusel ning
            HARTA-LTM2 meetme toel aastatel 2025–2027 läbi arendusuuringut &bdquo;LAHEMATE: õppijakeskse
            matemaatilise probleemilahenduse õppemetoodika arendusuuring&ldquo;.
          </p>
          <p>
            Palume Teie nõusolekut, et Teie koolis võiksid osaleda need matemaatikaõpetajad, kes on
            avaldanud soovi uuringus osaleda. Täpne infokiri on lisatud käesolevale taotlusele (Lisa 1).
          </p>
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
            <input type="hidden" name="action" value="give" />
            <label className="flex items-start gap-2 mb-4 text-sm text-slate-800">
              <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-slate-300" />
              <span>
                Kinnitan, et olen tutvunud uuringu eesmärgi, käigu ja andmekaitsepõhimõtetega ning annan
                nõusoleku, et meie koolis võivad osaleda eespool loetletud õpetajad koos oma õpilastega.
              </span>
            </label>
            <PrimaryButton type="submit">Kinnita nõusolek</PrimaryButton>
          </form>
        ) : (
          <form action="/api/consent/koolijuht" method="post">
            <input type="hidden" name="action" value="withdraw" />
            <button type="submit" className="text-sm text-red-600 underline hover:no-underline">
              Võta nõusolek tagasi
            </button>
          </form>
        )}
      </FormShell>
    </>
  );
}
