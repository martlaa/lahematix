import { getTaskBankItems, type TaskBankItem } from '@/lib/taskbank';
import { PublicNav } from '@/components/PublicNav';
import { GRADE_BAND_LABEL, METHOD_LABEL } from '@/lib/tasks/types';

// Loeb andmebaasist elavat andmet — ei tohi ehitusajal staatiliselt eelrenderdada.
export const dynamic = 'force-dynamic';

type SortField = 'gradeBand' | 'method' | 'author' | 'downloadCount' | 'usageCount' | 'avgRating' | 'createdAt';

export default async function UlesandedPage(
  props: {
    searchParams: Promise<{
      gradeBand?: string;
      method?: string;
      author?: string;
      sort?: string;
      dir?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  let items = await getTaskBankItems();

  if (searchParams.gradeBand) {
    items = items.filter((i) => i.gradeBand === searchParams.gradeBand);
  }
  if (searchParams.method) {
    items = items.filter((i) => i.appliedMethods.includes(searchParams.method as (typeof i.appliedMethods)[number]));
  }
  if (searchParams.author) {
    const needle = searchParams.author.trim().toLowerCase();
    items = items.filter(
      (i) => i.authorName.toLowerCase().includes(needle) || (i.creditedAuthor ?? '').toLowerCase().includes(needle),
    );
  }

  const validSortFields: SortField[] = ['gradeBand', 'method', 'author', 'downloadCount', 'usageCount', 'avgRating', 'createdAt'];
  const sortField: SortField = validSortFields.includes(searchParams.sort as SortField)
    ? (searchParams.sort as SortField)
    : 'createdAt';
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
      case 'downloadCount':
        cmp = a.downloadCount - b.downloadCount;
        break;
      case 'usageCount':
        cmp = a.usageCount - b.usageCount;
        break;
      case 'avgRating':
        cmp = (a.avgRating ?? -1) - (b.avgRating ?? -1);
        break;
      default:
        cmp = a.createdAt.getTime() - b.createdAt.getTime();
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function sortLink(field: SortField): string {
    const nextDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    if (searchParams.gradeBand) params.set('gradeBand', searchParams.gradeBand);
    if (searchParams.method) params.set('method', searchParams.method);
    if (searchParams.author) params.set('author', searchParams.author);
    params.set('sort', field);
    params.set('dir', nextDir);
    return `/ulesanded?${params.toString()}`;
  }

  function sortIndicator(field: SortField): string {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  function ratingLabel(item: TaskBankItem): string {
    if (item.avgRating === null) return '—';
    return `${item.avgRating.toFixed(1)} (${item.ratingCount})`;
  }

  return (
    <>
      <PublicNav active="ulesanded" />
      <main className="max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Ülesannete pank</h1>
          <a
            href="/galerii"
            className="text-sm text-brand-600 underline hover:no-underline"
          >
            Tunnikavade galerii →
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-600">
            Siin on avalikult kättesaadavad matemaatikaülesanded ja töölehed, mida LAHEMATE projekti õpetajad-uurijad
            ja teadurid on jaganud. Ülesandeid saab oma tunnikavasse lisada otse tunnikava koostamise lehel.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form method="get" className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <input
              type="text"
              name="author"
              defaultValue={searchParams.author ?? ''}
              placeholder="Autori nimi"
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <button className="col-span-2 md:col-span-3 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Filtreeri
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Ühtegi ülesannet ei leitud.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-2">Pealkiri</th>
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
                  <th className="py-2 pr-2 text-right">
                    <a href={sortLink('downloadCount')} className="hover:text-slate-800 hover:underline">
                      Allalaadimisi{sortIndicator('downloadCount')}
                    </a>
                  </th>
                  <th className="py-2 pr-2 text-right">
                    <a href={sortLink('usageCount')} className="hover:text-slate-800 hover:underline">
                      Tunnikavades{sortIndicator('usageCount')}
                    </a>
                  </th>
                  <th className="py-2 pr-2 text-right">
                    <a href={sortLink('avgRating')} className="hover:text-slate-800 hover:underline">
                      Hinnang{sortIndicator('avgRating')}
                    </a>
                  </th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{item.title}</td>
                    <td className="py-2 pr-2">{item.gradeBand ? GRADE_BAND_LABEL[item.gradeBand] : '—'}</td>
                    <td className="py-2 pr-2">{item.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'}</td>
                    <td className="py-2 pr-2">{item.topic ?? '—'}</td>
                    <td className="py-2 pr-2">
                      {item.creditedAuthor ?? item.authorName}{' '}
                      <span className="text-slate-500">({item.authorRoleLabel})</span>
                    </td>
                    <td className="py-2 pr-2 text-right">{item.downloadCount}</td>
                    <td className="py-2 pr-2 text-right">{item.usageCount}</td>
                    <td className="py-2 pr-2 text-right">{ratingLabel(item)}</td>
                    <td className="py-2 pr-2">
                      <a href={`/ulesanded/${item.id}`} className="text-brand-600 underline hover:no-underline">
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
    </>
  );
}
