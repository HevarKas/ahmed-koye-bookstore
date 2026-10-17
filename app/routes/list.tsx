import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { Link, useFetcher } from '@remix-run/react';
import { BookMarked, MessageCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AvailabilityBadge } from '~/components/BookCard';
import { BookCover } from '~/components/BookCover';
import { getBooksByIds, type Book } from '~/lib/catalog.server';
import { useMyList } from '~/lib/myList';
import { formatPrice } from '~/lib/text';
import { cn } from '~/lib/utils';
import { STORE, whatsappLink } from '~/shared/store';

export const meta: MetaFunction = () => [{ title: `لیستەکەم — ${STORE.name}` }, { name: 'robots', content: 'noindex' }];

// Returns current price and availability for the books saved in the browser.
export function loader({ request }: LoaderFunctionArgs) {
  const ids = (new URL(request.url).searchParams.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 200);
  return json({ books: getBooksByIds(ids) });
}

export default function MyList() {
  const list = useMyList();
  const fetcher = useFetcher<typeof loader>();
  const [form, setForm] = useState({ name: '', delivery: 'pickup', address: '', extra: '' });

  const ids = list.items.map((i) => i.id).join(',');
  useEffect(() => {
    if (list.ready && ids) fetcher.load(`/list?ids=${ids}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.ready, ids]);

  const fresh = useMemo(() => new Map<number, Book>((fetcher.data?.books ?? []).map((b) => [b.id, b])), [fetcher.data]);

  const rows = list.items.map((item) => {
    const book = fresh.get(item.id);
    return { ...item, price: book?.price ?? item.price, available: book ? book.available : null, categoryId: book?.category_id ?? 0, gone: Boolean(fetcher.data) && !book };
  });
  const total = rows.reduce((sum, r) => sum + r.price * r.qty, 0);
  const unavailable = rows.filter((r) => r.available === false).length;

  const message = [
    'سڵاو، دەمەوێت ئەم کتێبانە داوا بکەم:',
    '',
    ...rows.map((r, i) => `${i + 1}. «${r.name}»${r.author ? ` — ${r.author}` : ''}${r.qty > 1 ? ` × ${r.qty}` : ''} (${formatPrice(r.price * r.qty)} دینار)`),
    ...(rows.length ? ['', `کۆی گشتی: ${formatPrice(total)} دینار`] : []),
    ...(form.extra.trim() ? ['', 'کتێبی تر کە دەمەوێت:', form.extra.trim()] : []),
    '',
    form.delivery === 'delivery' ? `گەیاندن بۆ: ${form.address.trim() || '—'}` : 'خۆم دێم وەریدەگرم',
    ...(form.name.trim() ? [`ناو: ${form.name.trim()}`] : []),
  ].join('\n');

  const canSend = rows.length > 0 || form.extra.trim() !== '';

  if (!list.ready) return <div className="container-page min-h-[50vh] py-10" />;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">لیستەکەم</h1>
      <p className="mt-2 text-muted-foreground">کتێبەکان لێرە کۆبکەرەوە و بە یەک نامەی واتساپ بۆمانی بنێرە.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section>
          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-12 text-center">
              <BookMarked className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h2 className="mt-4 text-lg font-bold">لیستەکەت بەتاڵە</h2>
              <p className="mt-2 text-sm text-muted-foreground">لە پەڕەی هەر کتێبێک دوگمەی «زیادکردن بۆ لیست» دابگرە.</p>
              <Link to="/books" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-primary-foreground">
                گەڕان لە کتێبەکان
              </Link>
            </div>
          ) : (
            <ul className="divide-y rounded-3xl border bg-card">
              {rows.map((r) => (
                <li key={r.id} className={cn('flex gap-4 p-4', r.gone && 'opacity-60')}>
                  <Link to={`/books/${r.id}`} className="w-16 shrink-0">
                    <BookCover id={r.id} title={r.name} categoryId={r.categoryId} size="sm" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/books/${r.id}`} className="line-clamp-2 font-semibold hover:text-primary">{r.name}</Link>
                    {r.author && <p className="truncate text-sm text-muted-foreground">{r.author}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {r.available !== null && <AvailabilityBadge available={r.available} />}
                      {r.gone && <span className="text-xs text-destructive">ئەم کتێبە لە لیستی کتێبخانە لابراوە</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <p className="font-bold tabular-nums">{formatPrice(r.price * r.qty)}</p>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => list.setQty(r.id, r.qty - 1)} className="rounded-full border p-1.5 hover:bg-secondary" aria-label="کەمکردنەوە">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{r.qty}</span>
                      <button type="button" onClick={() => list.setQty(r.id, r.qty + 1)} className="rounded-full border p-1.5 hover:bg-secondary" aria-label="زیادکردن">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => list.remove(r.id)} className="mr-1 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="لابردن">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {rows.length > 0 && (
            <button type="button" onClick={list.clear} className="mt-4 text-sm text-muted-foreground hover:text-destructive">
              پاککردنەوەی هەموو لیستەکە
            </button>
          )}
        </section>

        <aside className="h-fit space-y-5 rounded-3xl border bg-card p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">کۆی گشتی</span>
            <span className="font-display text-2xl font-bold tabular-nums">
              {formatPrice(total)} <span className="text-sm font-normal text-muted-foreground">دینار</span>
            </span>
          </div>
          {unavailable > 0 && (
            <p className="rounded-xl bg-highlight/10 p-3 text-sm text-highlight">
              {unavailable} کتێب لە لیستەکەت ئێستا بەردەست نییە. دەتوانیت هەر بینێریت و پرسیار بکەیت.
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium">ناوت (ئارەزوومەندانە)</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3" />
          </label>

          <fieldset>
            <legend className="text-sm font-medium">وەرگرتن</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                ['pickup', 'خۆم دێم'],
                ['delivery', 'گەیاندن'],
              ].map(([value, label]) => (
                <label key={value} className={cn('chip cursor-pointer justify-center py-2.5', form.delivery === value && 'chip-active')}>
                  <input type="radio" name="delivery" value={value} checked={form.delivery === value} onChange={() => setForm({ ...form, delivery: value })} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {form.delivery === 'delivery' && (
            <label className="block">
              <span className="text-sm font-medium">شار و ناونیشان</span>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3" />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium">کتێبێکی ترت دەوێت کە لێرە نییە؟</span>
            <textarea
              value={form.extra}
              onChange={(e) => setForm({ ...form, extra: e.target.value })}
              rows={3}
              placeholder="ناوی کتێب و نووسەر..."
              className="mt-1.5 w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground"
            />
          </label>

          <a
            href={canSend ? whatsappLink(message) : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!canSend}
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f7a4d] font-semibold text-white hover:bg-[#19663f]',
              !canSend && 'pointer-events-none opacity-50',
            )}
          >
            <MessageCircle className="h-5 w-5" /> ناردن بە واتساپ
          </a>
          <p className="text-center text-xs text-muted-foreground">نامەکە لە واتساپ دەکرێتەوە، پێش ناردن دەتوانیت دەستکاری بکەیت.</p>
        </aside>
      </div>
    </div>
  );
}
