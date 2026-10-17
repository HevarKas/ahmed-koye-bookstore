import { json, type MetaFunction } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { ArrowLeft, BookMarked, MapPin, MessageCircle, Search, Send, Truck } from 'lucide-react';
import AKlogo from '~/assets/AKlogo';
import { BookGrid } from '~/components/BookCard';
import { getMeta, searchBooks } from '~/lib/catalog.server';
import { formatPrice } from '~/lib/text';
import { STORE } from '~/shared/store';

export const meta: MetaFunction = () => [{ title: `${STORE.name} — گەڕان لە کتێبەکان` }];

export function loader() {
  const meta = getMeta();
  const newest = searchBooks({ available: true, sort: 'newest', perPage: 12 }).books;
  const topCategories = [...meta.categories].sort((a, b) => b.available - a.available).slice(0, 12);
  return json({ total: meta.total, available: meta.available, categoryCount: meta.categories.length, newest, topCategories });
}

export default function Home() {
  const { total, available, categoryCount, newest, topCategories } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="paper-texture relative overflow-hidden border-b">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {formatPrice(available)} کتێب ئێستا بەردەستە
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.35] sm:text-5xl">
              کتێبی داهاتووت
              <br />
              <span className="text-primary">لێرە دەدۆزیتەوە</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              بگەڕێ لەناو {formatPrice(total)} ناونیشان، بزانە کام بەردەستە، لیستێک دروست بکە و بە یەک کرتە بۆمانی بنێرە.
            </p>

            <Form action="/books" role="search" className="mt-8 flex max-w-xl gap-2">
              <label className="relative flex-1">
                <span className="sr-only">گەڕان</span>
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  autoComplete="off"
                  placeholder="ناوی کتێب، نووسەر یان وەرگێڕ..."
                  className="h-14 w-full rounded-2xl border-2 bg-card pr-12 pl-4 text-base shadow-sm placeholder:text-muted-foreground focus:border-primary"
                />
              </label>
              <button className="h-14 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
                بگەڕێ
              </button>
            </Form>

            <div className="mt-5 flex flex-wrap gap-2">
              {topCategories.slice(0, 6).map((c) => (
                <Link key={c.id} to={`/books?category=${c.id}`} className="chip">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm lg:block" aria-hidden="true">
            <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex items-end justify-center gap-3">
              {[
                ['#7A2E2E', '16rem'],
                ['#1F4D3F', '20rem'],
                ['#B5532E', '18rem'],
                ['#23395B', '15rem'],
                ['#8A6A1F', '17rem'],
              ].map(([color, height], i) => (
                <div
                  key={i}
                  className="w-14 rounded-t-md rounded-b-sm shadow-xl"
                  style={{ backgroundColor: color, height }}
                >
                  <div className="mx-auto mt-6 h-px w-8 bg-white/40" />
                  <div className="mx-auto mt-1.5 h-px w-8 bg-white/40" />
                </div>
              ))}
            </div>
            <div className="relative h-3 rounded-sm bg-foreground/80" />
            <div className="absolute -top-6 left-4 rounded-2xl border bg-card p-3 shadow-lg">
              <AKlogo className="h-14 w-14 text-foreground" />
            </div>
          </div>
        </div>

        <div className="container-page grid grid-cols-3 border-t py-5 text-center">
          <div>
            <p className="font-display text-2xl font-bold tabular-nums">{formatPrice(total)}</p>
            <p className="text-xs text-muted-foreground">ناونیشان</p>
          </div>
          <div className="border-x">
            <p className="font-display text-2xl font-bold tabular-nums text-success">{formatPrice(available)}</p>
            <p className="text-xs text-muted-foreground">بەردەست</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold tabular-nums">{categoryCount}</p>
            <p className="text-xs text-muted-foreground">بەش</p>
          </div>
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">تازە گەیشتووەکان</h2>
            <p className="mt-1 text-sm text-muted-foreground">دوایین کتێبەکان کە هاتوونەتە کتێبخانەکە</p>
          </div>
          <Link to="/books?available=1&sort=newest" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            هەمووی ببینە <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        {newest.length > 0 ? (
          <BookGrid books={newest} />
        ) : (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            لیستی کتێبەکان بەم زووانە نوێ دەکرێتەوە.
          </p>
        )}
      </section>

      <section className="container-page mt-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">بەشەکان</h2>
          <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            هەموو بەشەکان <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              to={`/books?category=${c.id}`}
              className="group rounded-2xl border bg-card p-4 transition-colors hover:border-primary"
            >
              <p className="font-semibold group-hover:text-primary">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatPrice(c.available)} کتێبی بەردەست</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">چۆن کتێب داوا دەکەیت؟</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Search, title: 'بگەڕێ', text: 'کتێبەکەت بدۆزەرەوە و ببینە ئایا بەردەستە.' },
              { icon: BookMarked, title: 'زیادی بکە بۆ لیست', text: 'هەر چەند کتێبێکت دەوێت بیخەرە لیستەکەت.' },
              { icon: Send, title: 'بە واتساپ بینێرە', text: 'لیستەکە بە یەک کرتە بۆمان بنێرە، ئێمە ئامادەی دەکەین.' },
            ].map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 font-display font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <Icon className="h-4 w-4 opacity-80" /> {title}
                  </p>
                  <p className="mt-1 text-sm leading-7 opacity-80">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 border-t border-primary-foreground/15 pt-6 text-sm">
            <span className="inline-flex items-center gap-2 opacity-90">
              <Truck className="h-4 w-4" /> {STORE.delivery}
            </span>
          </div>
        </div>
      </section>

      <section className="container-page mt-20 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-8">
          <MapPin className="h-6 w-6 text-highlight" />
          <h2 className="mt-4 text-xl font-bold">سەردانی کتێبخانەکەمان بکە</h2>
          <p className="mt-2 leading-7 text-muted-foreground">{STORE.address}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {STORE.hours} · {STORE.hoursNote}
          </p>
          <Link to="/visit" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium hover:border-primary hover:text-primary">
            نەخشە و ڕێنمایی <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-3xl border bg-card p-8">
          <MessageCircle className="h-6 w-6 text-highlight" />
          <h2 className="mt-4 text-xl font-bold">کتێبەکەت نەدۆزییەوە؟</h2>
          <p className="mt-2 leading-7 text-muted-foreground">
            پێمان بڵێ چ کتێبێکت دەوێت، هەوڵ دەدەین بۆتی دابین بکەین.
          </p>
          <Link to="/list" className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
            داواکردنی کتێب <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
