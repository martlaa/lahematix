import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PublicNav } from '@/components/PublicNav';
import { getGalleryItems } from '@/lib/gallery';

const roleRedirect: Record<string, string> = {
  ADMIN: '/admin',
  TEADUR: '/teadur',
  OPETAJA: '/opetaja',
};

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
      <p className="text-3xl font-semibold text-brand-700">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  if (session.userId && session.role) {
    redirect(roleRedirect[session.role] ?? '/login');
  }

  const [schoolsCount, teachersCount, studentsConsented, lessonsCount, protocolsCount, galleryItems] =
    await Promise.all([
      prisma.school.count(),
      prisma.teacher.count(),
      prisma.student.count({ where: { consentRecords: { some: { status: 'ANTUD' } } } }),
      prisma.researchPlanEntry.count({ where: { hidden: false } }),
      prisma.observationProtocol.count({ where: { publishedAt: { not: null } } }),
      getGalleryItems(),
    ]);

  return (
    <>
      <PublicNav active="home" />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <circle cx="40" cy="260" r="70" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="360" cy="40" r="90" fill="none" stroke="white" strokeWidth="2" />
          <polygon points="200,20 260,120 140,120" fill="none" stroke="white" strokeWidth="2" />
          <line x1="0" y1="150" x2="400" y2="150" stroke="white" strokeWidth="1" />
          <line x1="150" y1="0" x2="150" y2="300" stroke="white" strokeWidth="1" />
          <line x1="280" y1="0" x2="280" y2="300" stroke="white" strokeWidth="1" />
        </svg>
        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Õppijakeskne matemaatiline probleemilahendus
          </h1>
          <p className="mt-5 text-lg text-brand-50 max-w-2xl mx-auto">
            LAHEMATE arendusuuring toob Eesti koolidesse tõenduspõhised matemaatika
            probleemilahenduse õpetamise meetodid — koos õpetajate-uurijate endi kogutud andmete ja
            avalikult jagatavate tunnikavadega.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/galerii"
              className="rounded-md bg-white text-brand-700 px-5 py-2.5 text-sm font-semibold hover:bg-brand-50"
            >
              Tutvu tunnikavade galeriiga →
            </a>
            <a
              href="/login"
              className="rounded-md border border-white/60 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Projekti liikmele: logi sisse
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto w-full px-4 py-12 space-y-12">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Projektist</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>LAHEMATE</strong> ("õppijakeskse matemaatilise probleemilahenduse õppemetoodika
              arendusuuring") kohandab Eesti õppekavale rahvusvaheliselt tõenduspõhised probleemilahenduse
              õpetamise metoodikad — <strong>Jo Boaler'i</strong> Mathematical Mindset,{' '}
              <strong>Peter Liljedahl'i</strong> Thinking Classroom ja <strong>Toh</strong> jt Mathematical
              Problem Solving for Everyone (MProSE) — ning katsetab neid koolides ja
              õpetajakoolituses.
            </p>
            <p>
              Projekti viivad koos läbi <strong>Tallinna Ülikooli digitehnoloogiate instituut</strong> ja{' '}
              <strong>Tartu Ülikooli matemaatika ja statistika instituut</strong>, rahastajaks Haridus- ja
              Teadusministeerium (rahastusotsus november 2024). Väljunditeks on käsiraamat õpetajatele ja
              koolitajatele, viis rakendusjuhtumit koos 20 õppestsenaariumiga eri kooliastmetele, tunnikavad,
              töölehed, ülesanded ja hindamisvahendid ning õpetajakoolituse kursused.
            </p>
            <p>
              Uuring kulgeb 2025.–2027. aastal viies etapis: kirjanduse analüüs ja kontseptsiooni loomine,
              prototüüpimine, piloteerimine kahe ülikooli õpetajakoolituses, täiemahuline metoodika
              rakendamine <strong>vähemalt 20 koolis ja 400 õpilasega</strong> kahe õpetajate-uurijate
              rühmaga (kummaski vähemalt 15 õpetajat), ning lõpuks tulemuste analüüs ja levitamine — sh
              ettekanne NORMA konverentsil juunis 2027.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">LAHEMATIX arvudes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard value={schoolsCount} label="Kooli" />
            <StatCard value={teachersCount} label="Õpetajat-uurijat" />
            <StatCard value={studentsConsented} label="Õpilast nõusolekuga" />
            <StatCard value={lessonsCount} label="Kavandatud katsetundi" />
            <StatCard value={protocolsCount} label="Avalikustatud tunnivaatlust" />
            <StatCard value={galleryItems.length} label="Tunnikava galeriis" />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tunnikavade galerii</h2>
            <p className="text-sm text-slate-600 mt-1">
              Uuringus osalevate teadurite ja õpetajate-uurijate tunnikavad, avalikult ja vabalt
              kasutatavad CC BY 4.0 litsentsi alusel — ilma kontota.
            </p>
          </div>
          <a
            href="/galerii"
            className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 whitespace-nowrap"
          >
            Ava galerii →
          </a>
        </section>
      </main>

      <footer className="border-t border-slate-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-xs text-slate-500 text-center">
          LAHEMATE projekt · Tallinna Ülikool ja Tartu Ülikool · Rahastaja: Haridus- ja Teadusministeerium
        </div>
      </footer>
    </>
  );
}
