import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { Form, Link, useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BookGrid } from '~/components/BookCard';
import { getMeta, searchBooks, type Sort } from '~/lib/catalog.server';
import { formatPrice } from '~/lib/text';
import { cn } from '~/lib/utils';
import { STORE } from '~/shared/store';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'relevance', label: 'باشترین ئەنجام' },
  { value: 'newest', label: 'نوێترین' },
  { value: 'price_asc', label: 'هەرزانترین' },
  { value: 'price_desc', label: 'گرانترین' },
  { value: 'name', label: 'ناو (ئ-ی)' },
];

const PRICES = [
  { id: 'lt4', label: 'کەمتر لە ٤,٠٠٠', min: null, max: 3999 },
  { id: '4-6', label: '٤,٠٠٠ — ٦,٠٠٠', min: 4000, max: 6000 },
  { id: '6-10', label: '٦,٠٠٠ — ١٠,٠٠٠', min: 6001, max: 10000 },
  { id: 'gt10', label: 'زیاتر لە ١٠,٠٠٠', min: 10001, max: null },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const p = url.searchParams;
  const price = PRICES.find((x) => x.id === p.get('price'));
  const sortParam = p.get('sort') as Sort | null;

  const filters = {
    q: (p.get('q') ?? '').trim().slice(0, 120),
    category: Number(p.get('category')) || null,
    author: p.get('author')?.slice(0, 255) || null,
    available: p.get('available') === '1',
    price: price?.id ?? null,
    sort: SORTS.some((s) => s.value === sortParam) ? sortParam! : undefined,
  };

  const result = searchBooks({
    ...filters,
    minPrice: price?.min ?? null,
    maxPrice: price?.max ?? null,
    page: Number(p.get('page')) || 1,
  });

  return json({ filters, result, categories: getMeta().categories });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const f = data?.filters;
  const category = data?.categories.find((c) => c.id === f?.category)?.name;
  const title = f?.q ? `"${f.q}"` : f?.author ?? category ?? 'هەموو کتێبەکان';
  return [{ title: `${title} — ${STORE.name}` }];
};

function pageHref(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set('page', String(page));
  return `?${next}`;
}

export default function Books() {
  const { filters, result, categories } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(filters.q);
  const [showFilters, setShowFilters] = useState(false);
  const loading = navigation.state === 'loading' && navigation.location.pathname === '/books';

  useEffect(() => setQuery(filters.q), [filters.q]);

  // Search while typing, after a short pause.
  useEffect(() => {
    if (query === filters.q) return;
    const t = setTimeout(() => formRef.current && submit(formRef.current, { replace: true, preventScrollReset: true }), 400);
    return () => clearTimeout(t);
  }, [query, filters.q, submit]);

  const autoSubmit = () => formRef.current && submit(formRef.current, { preventScrollReset: true });

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === true) params.set(k, '1');
    else if (v) params.set(k, String(v));
  });

  const activeCategory = categories.find((c) => c.id === filters.category);
  const hasFilters = Boolean(filters.q || filters.category || filters.author || filters.available || filters.price);

  const filterPanel = (
    <div className="space-y-7">
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <span>
          <span className="block font-semibold">تەنها بەردەستەکان</span>
          <span className="text-xs text-muted-foreground">کتێبە نەماوەکان پیشان مەدە</span>
        </span>
        <input type="checkbox" name="available" value="1" defaultChecked={filters.available} onChange={autoSubmit} className="h-5 w-5 accent-[hsl(var(--primary))]" />
      </label>

      <fieldset>
        <legend className="mb-3 font-semibold">نرخ (دینار)</legend>
        <div className="flex flex-wrap gap-2">
          <label className={cn('chip cursor-pointer', !filters.price && 'chip-active')}>
            <input type="radio" name="price" value="" defaultChecked={!filters.price} onChange={autoSubmit} className="sr-only" />
            هەموو
          </label>
          {PRICES.map((p) => (
            <label key={p.id} className={cn('chip cursor-pointer', filters.price === p.id && 'chip-active')}>
              <input type="radio" name="price" value={p.id} defaultChecked={filters.price === p.id} onChange={autoSubmit} className="sr-only" />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-semibold">بەش</legend>
        <select
          name="category"
          defaultValue={filters.category ?? ''}
          onChange={autoSubmit}
          className="h-11 w-full rounded-xl border bg-card px-3 text-sm"
        >
          <option value="">هەموو بەشەکان</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({formatPrice(c.count)})
            </option>
          ))}
        </select>
      </fieldset>
    </div>
  );

  return (
    <div className="container-page py-8">
      <Form ref={formRef} method="get" action="/books" role="search">
        {filters.author && <input type="hidden" name="author" value={filters.author} />}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">گەڕان</span>
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder="ناوی کتێب، نووسەر یان وەرگێڕ..."
              className="h-[3.25rem] w-full rounded-2xl border-2 bg-card pr-12 pl-10 text-base placeholder:text-muted-foreground focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
                aria-label="پاککردنەوە"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="sort">ڕیزکردن:</label>
            <select
              id="sort"
              name="sort"
              defaultValue={result.sort}
              key={result.sort}
              onChange={autoSubmit}
              className="h-11 rounded-xl border bg-card px-3 text-sm"
            >
              {SORTS.filter((s) => s.value !== 'relevance' || filters.q).map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
          <aside>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="flex w-full items-center gap-2 rounded-2xl border bg-card p-4 font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> فلتەرەکان
              {hasFilters && <span className="h-2 w-2 rounded-full bg-highlight" />}
            </button>
            <div className={cn('mt-4 lg:mt-0 lg:block', showFilters ? 'block' : 'hidden')}>{filterPanel}</div>
          </aside>

          <section aria-live="polite" className={cn('transition-opacity', loading && 'opacity-50')}>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <h1 className="ml-2 text-xl font-bold">
                {filters.author ? `کتێبەکانی ${filters.author}` : activeCategory?.name ?? (filters.q ? 'ئەنجامی گەڕان' : 'هەموو کتێبەکان')}
              </h1>
              <span className="text-sm text-muted-foreground">{formatPrice(result.total)} کتێب</span>
              {hasFilters && (
                <Link to="/books" className="mr-auto inline-flex items-center gap-1 text-sm text-highlight hover:underline">
                  <X className="h-3.5 w-3.5" /> لابردنی فلتەرەکان
                </Link>
              )}
            </div>

            {filters.author && (
              <p className="mb-6 text-sm">
                <Link to={`/books${filters.q ? `?q=${encodeURIComponent(filters.q)}` : ''}`} className="chip">
                  {filters.author} <X className="h-3.5 w-3.5" />
                </Link>
              </p>
            )}

            {result.books.length > 0 ? (
              <BookGrid books={result.books} />
            ) : (
              <div className="rounded-3xl border border-dashed p-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h2 className="mt-4 text-lg font-bold">هیچ کتێبێک نەدۆزرایەوە</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  وشەیەکی تر تاقی بکەرەوە، یان فلتەرەکان لابەرە. ئەگەر کتێبەکەت لای ئێمە نییە،{' '}
                  <Link to="/list" className="text-primary underline">داوای بکە</Link>.
                </p>
              </div>
            )}

            {result.lastPage > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="پەڕەکان">
                {result.page > 1 ? (
                  <Link to={pageHref(params, result.page - 1)} className="chip" rel="prev">
                    <ChevronRight className="h-4 w-4" /> پێشوو
                  </Link>
                ) : (
                  <span className="chip opacity-40"><ChevronRight className="h-4 w-4" /> پێشوو</span>
                )}
                <span className="px-3 text-sm tabular-nums text-muted-foreground">
                  {result.page} / {result.lastPage}
                </span>
                {result.page < result.lastPage ? (
                  <Link to={pageHref(params, result.page + 1)} className="chip" rel="next">
                    دواتر <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="chip opacity-40">دواتر <ChevronLeft className="h-4 w-4" /></span>
                )}
              </nav>
            )}
          </section>
        </div>
      </Form>
    </div>
  );
}
