import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormShell, Alert, Checkbox, PrimaryButton } from '@/components/ui';

export default async function LapsevanemNousolekPage({ params }: { params: { studentId: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== 'LAPSEVANEM') redirect('/login');

  const parent = await prisma.parent.findUnique({ where: { userId: session.userId } });
  if (!parent) redirect('/lapsevanem');

  const student = await prisma.student.findFirst({
    where: { id: params.studentId, parentId: parent!.id },
    include: { consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  if (!student) notFound();

  const latest = student.consentRecords[0];
  const hasConsent = latest?.status === 'ANTUD';

  return (
    <>
      <Header userLabel={`${session.name} (lapsevanem)`} />
      <FormShell
        title={`Nõusolek: õpilane ${student.pseudonymCode}`}
        subtitle="LAHEMATE projekt — infoleht ja nõusolekuvorm lapsevanemale ja lapsele (Lisa 3)"
      >
        {hasConsent && (
          <Alert kind="success">
            Nõusolek on antud {latest?.givenAt.toLocaleDateString('et-EE')}. Saad selle allpool igal ajal
            tagasi võtta.
          </Alert>
        )}

        <div className="prose prose-sm max-w-none text-slate-700 mb-6">
          <p>
            Teie lapse matemaatikaõpetaja osaleb vabatahtlikult LAHEMATE uuringus. Osalemine tähendab
            probleemilahendusoskuse testi täitmist kaks korda ning veebipõhist küsimustikku pärast
            katseperioodi lõppu. Täpne infoleht on lisatud käesolevale taotlusele (Lisa 3).
          </p>
          <p>
            Osalemine on vabatahtlik ega mõjuta lapse hindeid ega suhet õpetajaga. Nõusoleku võib igal
            ajal tagasi võtta.
          </p>
        </div>

        {!hasConsent ? (
          <form action="/api/consent/lapsevanem" method="post">
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="action" value="give" />
            <Checkbox
              name="loaOsaleda"
              required
              label="Annan loa oma lapsel uuringus osaleda ja tema isikuandmeid eelkirjeldatud viisil töödelda."
            />
            <Checkbox
              name="lapseleTutvustatud"
              required
              label="Lapsele on uuringut talle arusaadavalt tutvustatud ja laps on suuliselt kinnitanud, et on nõus osalema."
            />
            <div className="mt-6">
              <PrimaryButton type="submit">Kinnita nõusolek</PrimaryButton>
            </div>
          </form>
        ) : (
          <form action="/api/consent/lapsevanem" method="post">
            <input type="hidden" name="studentId" value={student.id} />
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
