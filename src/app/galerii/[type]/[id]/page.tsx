import { notFound } from 'next/navigation';
import { getGalleryDetail, type GallerySourceType } from '@/lib/gallery';
import { LESSON_PART_TYPE_LABEL, MATERIAL_OPTIONS, type MaterialsAnswers } from '@/lib/lessonplan/types';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

const GRADE_BAND_LABEL: Record<string, string> = {
  '4-6': '4.–6. klass',
  '7-9': '7.–9. klass',
  '10-12': '10.–12. klass',
};

const TYPE_PARAM_MAP: Record<string, GallerySourceType> = {
  naidistund: 'NAIDISTUND',
  katsetund: 'KATSETUND',
};

export default async function GaleriiDetailPage({ params }: { params: { type: string; id: string } }) {
  const sourceType = TYPE_PARAM_MAP[params.type];
  if (!sourceType) notFound();

  const detail = await getGalleryDetail(sourceType, params.id);
  if (!detail) notFound();

  const materials: MaterialsAnswers = detail.materials;

  return (
    <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
      <a href="/galerii" className="inline-block text-sm text-brand-600 underline hover:no-underline">
        ← Tagasi galerii juurde
      </a>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900">{detail.topic ?? 'Tunnikava'}</h1>
        <p className="text-sm text-slate-600 mt-2">
          Vanuseaste: {detail.gradeBand ? GRADE_BAND_LABEL[detail.gradeBand] : '—'} <br />
          Meetod: {detail.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'} <br />
          Kestus: {detail.durationMin ? `${detail.durationMin} min` : '—'} <br />
          Autor: {detail.authorName} ({detail.authorRoleLabel}) <br />
          Tüüp: {detail.sourceType === 'NAIDISTUND' ? 'Näidistund' : 'Katsetund'}
        </p>
        <a
          href={`/api/galerii/docx/${params.type}/${params.id}`}
          className="inline-block mt-4 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
        >
          Laadi alla DOCX
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
        <h2 className="font-semibold text-slate-900 mb-3">Tunni osad</h2>
        {detail.parts.length === 0 ? (
          <p className="text-sm text-slate-400">Tunniosi pole lisatud.</p>
        ) : (
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-1 pr-2">#</th>
                <th className="py-1 pr-2">Osa nimetus</th>
                <th className="py-1 pr-2">Tüüp</th>
                <th className="py-1 pr-2">Kestus</th>
                <th className="py-1 pr-2">Lühikirjeldus</th>
              </tr>
            </thead>
            <tbody>
              {detail.parts.map((p) => (
                <tr key={p.order} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-2">{p.order}</td>
                  <td className="py-2 pr-2">{p.title}</td>
                  <td className="py-2 pr-2">{LESSON_PART_TYPE_LABEL[p.type as keyof typeof LESSON_PART_TYPE_LABEL]}</td>
                  <td className="py-2 pr-2">{p.durationMin} min</td>
                  <td className="py-2 pr-2">{p.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-3">Kasutatav õppevara ja kodutöö</h2>
        <ul className="text-sm text-slate-700 space-y-1">
          {MATERIAL_OPTIONS.filter((m) => m.key in materials).map((m) => (
            <li key={m.key}>
              {m.label}
              {materials[m.key] ? `: ${materials[m.key]}` : ''}
            </li>
          ))}
          {Object.keys(materials).length === 0 && <li className="text-slate-400">Õppevara pole märgitud.</li>}
        </ul>
        {detail.homeworkText && (
          <p className="text-sm text-slate-700 mt-3">
            Kodutöö: {detail.homeworkText}{' '}
            {detail.homeworkRelated && <span className="text-slate-500">(seotud tänase teemaga)</span>}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
        <svg viewBox="0 0 80 28" className="h-8 w-auto flex-shrink-0" aria-hidden="true">
          <rect width="80" height="28" rx="4" fill="#fff" stroke="#aab2ab" />
          <circle cx="14" cy="14" r="10" fill="none" stroke="#000" strokeWidth="1.2" />
          <text x="14" y="18" textAnchor="middle" fontSize="10" fontFamily="Georgia, serif" fill="#000">
            cc
          </text>
          <circle cx="38" cy="14" r="10" fill="none" stroke="#000" strokeWidth="1.2" />
          <text x="38" y="18" textAnchor="middle" fontSize="9" fontFamily="Georgia, serif" fill="#000">
            BY
          </text>
        </svg>
        <p className="text-xs text-slate-600">
          See tunnikava on avaldatud litsentsiga{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.et"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline hover:no-underline"
          >
            Creative Commons Autorile viitamine 4.0 (CC BY 4.0)
          </a>{' '}
          — vabalt kasutatav ja jagatav, tingimusel et autorile ({detail.authorName}) viidatakse.
        </p>
      </div>
    </main>
  );
}
