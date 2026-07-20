import { getGalleryItems, type GalleryItem } from '@/lib/gallery';

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

const SOURCE_TYPE_LABEL: Record<string, string> = {
  NAIDISTUND: 'Näidistund',
  KATSETUND: 'Katsetund',
};

type SortField = 'gradeBand' | 'method' | 'author' | 'sourceType' | 'publishedAt';

export default async function GaleriiPage({
  searchParams,
}: {
  searchParams: {
    gradeBand?: string;
    method?: string;
    sourceType?: string;
    author?: string;
    sort?: string;
    dir?: string;
  };
}) {
  let items = await getGalleryItems();

  if (searchParams.gradeBand) {
    items = items.filter((i) => i.gradeBand === searchParams.gradeBand);
  }
  if (searchParams.method) {
    items = items.filter((i) => i.appliedMethods.includes(searchParams.method as any));
  }
  if (searchParams.sourceType) {
    items = items.filter((i) => i.sourceType === searchParams.sourceType);
  }
  if (searchParams.author) {
    const needle = searchParams.author.trim().toLowerCase();
    items = items.filter((i) => i.authorName.toLowerCase().includes(needle));
  }

  const validSortFields: SortField[] = ['gradeBand', 'method', 'author', 'sourceType', 'publishedAt'];
  const sortField: SortField = validSortFields.includes(searchParams.sort as SortField)
    ? (searchParams.sort as SortField)
    : 'publishedAt';
  const sortDir: 'asc' | 'desc' = searchParams.dir === 'asc' ? 'asc' : 'desc';

  items.sort((a, b) => {
    let cmp: number;
    switch (sortField) {
      case 'gradeBand':
        cmp = (a.gradeBand ?? '').localeCompare(b.gradeBand ?? '');
        break;
      case 'method':
        cmp = a.appliedMethods.join(',').localeCompare(b.appliedMethods.join(','));
        break;
      case 'author':
        cmp = a.authorName.localeCompare(b.authorName, 'et');
        break;
      case 'sourceType':
        cmp = a.sourceType.localeCompare(b.sourceType);
        break;
      default:
        cmp = a.publishedAt.getTime() - b.publishedAt.getTime();
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function sortLink(field: SortField): string {
    const nextDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    if (searchParams.gradeBand) params.set('gradeBand', searchParams.gradeBand);
    if (searchParams.method) params.set('method', searchParams.method);
    if (searchParams.sourceType) params.set('sourceType', searchParams.sourceType);
    if (searchParams.author) params.set('author', searchParams.author);
    params.set('sort', field);
    params.set('dir', nextDir);
    return `/galerii?${params.toString()}`;
  }

  function sortIndicator(field: SortField): string {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  function detailHref(item: GalleryItem): string {
    return `/galerii/${item.sourceType === 'NAIDISTUND' ? 'naidistund' : 'katsetund'}/${item.refId}`;
  }

  return (
    <main className="max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">LAHEMATIX tunnikavade galerii</h1>
        <a href="/login" className="text-sm text-brand-600 underline hover:no-underline">
          Logi sisse →
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-sm text-slate-600">
          Siin on avalikult kättesaadavad matemaatika tunnikavad, mida LAHEMATE projekti teadurid ja
          õpetajad-uurijad on jaganud <strong>CC BY 4.0</strong> litsentsi alusel — vabalt kasutatavad ja
          jagatavad, tingimusel et algallikale viidatakse.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form method="get" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select name="gradeBand" defaultValue={searchParams.gradeBand ?? ''} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Kõik vanuseastmed</option>
            <option value="4-6">4.–6. klass</option>
            <option value="7-9">7.–9. klass</option>
            <option value="10-12">10.–12. klass</option>
          </select>
          <select name="method" defaultValue={searchParams.method ?? ''} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Kõik meetodid</option>
            <option value="BOALER">Boaler</option>
            <option value="LILJEDAHL">Liljedahl</option>
            <option value="TOH">Toh</option>
          </select>
          <select name="sourceType" defaultValue={searchParams.sourceType ?? ''} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Näidistunnid ja katsetunnid</option>
            <option value="NAIDISTUND">Ainult näidistunnid</option>
            <option value="KATSETUND">Ainult katsetunnid</option>
          </select>
          <input
            type="text"
            name="author"
            defaultValue={searchParams.author ?? ''}
            placeholder="Autori nimi"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <button className="col-span-2 md:col-span-4 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
            Filtreeri
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">Ühtegi tunnikava ei leitud.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-2">
                  <a href={sortLink('sourceType')} className="hover:text-slate-800 hover:underline">
                    Tüüp{sortIndicator('sourceType')}
                  </a>
                </th>
                <th className="py-2 pr-2">
                  <a href={sortLink('gradeBand')} className="hover:text-slate-800 hover:underline">
                    Vanuseaste{sortIndicator('gradeBand')}
                  </a>
                </th>
                <th className="py-2 pr-2">
                  <a href={sortLink('method')} className="hover:text-slate-800 hover:underline">
                    Meetod{sortIndicator('method')}
                  </a>
                </th>
                <th className="py-2 pr-2">Teema</th>
                <th className="py-2 pr-2">
                  <a href={sortLink('author')} className="hover:text-slate-800 hover:underline">
                    Autor{sortIndicator('author')}
                  </a>
                </th>
                <th className="py-2 pr-2 text-right">Tunniosi</th>
                <th className="py-2 pr-2">
                  <a href={sortLink('publishedAt')} className="hover:text-slate-800 hover:underline">
                    Avaldatud{sortIndicator('publishedAt')}
                  </a>
                </th>
                <th className="py-2 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2">
                    <span
                      className={
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium ' +
                        (item.sourceType === 'NAIDISTUND'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700')
                      }
                    >
                      {SOURCE_TYPE_LABEL[item.sourceType]}
                    </span>
                  </td>
                  <td className="py-2 pr-2">{item.gradeBand ? GRADE_BAND_LABEL[item.gradeBand] : '—'}</td>
                  <td className="py-2 pr-2">
                    {item.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'}
                  </td>
                  <td className="py-2 pr-2">{item.topic ?? '—'}</td>
                  <td className="py-2 pr-2">
                    {item.authorName} <span className="text-slate-400">({item.authorRoleLabel})</span>
                  </td>
                  <td className="py-2 pr-2 text-right">{item.partsCount}</td>
                  <td className="py-2 pr-2">{item.publishedAt.toLocaleDateString('et-EE')}</td>
                  <td className="py-2 pr-2">
                    <a href={detailHref(item)} className="text-brand-600 underline hover:no-underline">
                      Vaata
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
