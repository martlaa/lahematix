import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { lisa4Eel, lisa4Jarel, lisa8 } from '@/lib/questionnaires';
import { getJournalDefinition } from '@/lib/journal';
import { test4to6, test7to9, test10to12 } from '@/lib/tests';

function StatusBadge({ done, label }: { done: boolean; label?: string }) {
  return (
    <span
      className={
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
        (done ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
      }
    >
      {label ?? (done ? 'Täidetud' : 'Täitmata')}
    </span>
  );
}

export default async function TeadurInstrumendidPage() {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') redirect('/login');

  const trials = await prisma.instrumentTrial.findMany({ where: { authorUserId: session.userId } });
  const byCode = new Map(trials.map((t) => [t.instrumentCode, t]));

  const sampleLessonPlanCount = await prisma.sampleLessonPlan.count({
    where: { authorUserId: session.userId, hidden: false },
  });
  const protocolTrialCount = trials.filter((t) => t.instrumentCode.startsWith('lisa6:')).length;

  const journal = getJournalDefinition();

  return (
    <>
      <Header userLabel={`${session.name} (teadur)`} />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <a href="/teadur" className="inline-block text-sm text-brand-600 underline hover:no-underline">
          ← Tagasi töölauale
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Uuringu andmekogumisinstrumendid</h1>
          <p className="text-sm text-slate-600">
            Siin saad kõiki uuringus kasutatavaid instrumente ise katsetada — täita neid ja (testide puhul)
            ka enda tulemusi hinnata. Katsetused ei mõjuta päris uuringuandmestikku.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Küsimustikud</h2>
          <ul className="divide-y divide-slate-100">
            {[lisa4Eel, lisa4Jarel, lisa8].map((def) => (
              <li key={def.code} className="py-3 flex items-center justify-between">
                <span className="text-sm text-slate-800">{def.title}</span>
                <span className="flex items-center gap-3">
                  <StatusBadge done={Boolean(byCode.get(def.code)?.submittedAt)} />
                  <a
                    href={`/teadur/instrumendid/kysimustik/${def.code}`}
                    className="text-sm text-brand-600 underline hover:no-underline"
                  >
                    Ava
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Uurijapäevik</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-800">{journal.title}</span>
            <span className="flex items-center gap-3">
              <StatusBadge done={Boolean(byCode.get('lisa7')?.submittedAt)} />
              <a href="/teadur/instrumendid/paevik" className="text-sm text-brand-600 underline hover:no-underline">
                Ava
              </a>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Matemaatilise probleemilahenduse testid</h2>
          <ul className="divide-y divide-slate-100">
            {[test4to6, test7to9, test10to12].map((def) => {
              const trial = byCode.get(def.code);
              return (
                <li key={def.code} className="py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-800">{def.title}</span>
                  <span className="flex items-center gap-3">
                    <StatusBadge
                      done={Boolean(trial?.gradedAt)}
                      label={trial?.gradedAt ? 'Hinnatud' : trial?.submittedAt ? 'Sooritatud' : 'Sooritamata'}
                    />
                    <a
                      href={`/teadur/instrumendid/test/${def.code}`}
                      className="text-sm text-brand-600 underline hover:no-underline"
                    >
                      Ava
                    </a>
                    {trial?.submittedAt && (
                      <a
                        href={`/teadur/instrumendid/test/${def.code}/hinda`}
                        className="text-sm text-brand-600 underline hover:no-underline"
                      >
                        Hinda
                      </a>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Tunnivaatlusprotokoll</h2>
          <p className="text-sm text-slate-600 mb-3">
            Checkpointid tulevad dünaamiliselt tunnikava osadest — vali katsetamiseks üks oma
            näidistunnikavadest ({sampleLessonPlanCount} olemas, {protocolTrialCount} katsetatud).
          </p>
          <a
            href="/teadur/instrumendid/vaatlusprotokoll"
            className="text-sm text-brand-600 underline hover:no-underline"
          >
            Ava
          </a>
        </div>
      </main>
    </>
  );
}
