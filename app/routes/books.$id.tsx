import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ChevronLeft, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { AddToListButton, AvailabilityBadge, BookGrid } from '~/components/BookCard';
import { BookCover } from '~/components/BookCover';
import { getBook, getMeta, getRelated } from '~/lib/catalog.server';
import { formatPrice } from '~/lib/text';
import { SITE_URL, STORE, whatsappLink } from '~/shared/store';

export function loader({ params }: LoaderFunctionArgs) {
  const book = getBook(Number(params.id));
  if (!book) throw new Response('Not found', { status: 404 });
  const category = getMeta().categories.find((c) => c.id === book.category_id) ?? null;
  return json({ book, category, related: getRelated(book) });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [{ title: STORE.name }];
  const { book } = data;
  const description = [book.author && `نووسەر: ${book.author}`, book.translator && `وەرگێڕ: ${book.translator}`, `نرخ: ${formatPrice(book.price)} دینار`]
    .filter(Boolean)
    .join(' · ');
  return [
    { title: `${book.name} — ${STORE.name}` },
    { name: 'description', content: description },
    { property: 'og:title', content: book.name },
    { property: 'og:description', content: description },
    { property: 'og:url', content: `${SITE_URL}/books/${book.id}` },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: book.name,
        author: book.author ? { '@type': 'Person', name: book.author } : undefined,
        translator: book.translator ? { '@type': 'Person', name: book.translator } : undefined,
        datePublished: book.publish_year ? String(book.publish_year) : undefined,
        offers: {
          '@type': 'Offer',
          price: book.price,
          priceCurrency: 'IQD',
          availability: book.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      },
    },
  ];
};

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // the customer closed the share sheet
    }
  };
  return (
    <button type="button" onClick={share} className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm hover:border-primary">
      <Share2 className="h-4 w-4" /> {copied ? 'بەستەر کۆپی کرا' : 'هاوبەشکردن'}
    </button>
  );
}

export default function BookPage() {
  const { book, category, related } = useLoaderData<typeof loader>();

  const message = book.available
    ? `سڵاو، دەمەوێت ئەم کتێبە بکڕم:\n«${book.name}»${book.author ? ` — ${book.author}` : ''}\nنرخ: ${formatPrice(book.price)} دینار\n${SITE_URL}/books/${book.id}`
    : `سڵاو، کەی ئەم کتێبە دێتەوە؟\n«${book.name}»${book.author ? ` — ${book.author}` : ''}\n${SITE_URL}/books/${book.id}`;

  const details = [
    { label: 'نووسەر', value: book.author, href: book.author ? `/books?author=${encodeURIComponent(book.author)}` : null },
    { label: 'وەرگێڕ', value: book.translator, href: null },
    { label: 'بەش', value: category?.name, href: category ? `/books?category=${category.id}` : null },
    { label: 'ساڵی چاپ', value: book.publish_year ? String(book.publish_year) : null, href: null },
  ].filter((d) => d.value);

  return (
    <div className="container-page py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="ڕێڕەو">
        <Link to="/books" className="hover:text-foreground">کتێبەکان</Link>
        {category && (
          <>
            <ChevronLeft className="h-4 w-4" />
            <Link to={`/books?category=${category.id}`} className="hover:text-foreground">{category.name}</Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div className="mx-auto w-full max-w-[16rem] md:max-w-none">
          <BookCover id={book.id} title={book.name} author={book.author} categoryId={book.category_id} size="lg" />
        </div>

        <div>
          <AvailabilityBadge available={book.available} />
          <h1 className="mt-3 text-3xl font-extrabold leading-[1.4] sm:text-4xl">{book.name}</h1>
          {book.author && (
            <p className="mt-2 text-lg text-muted-foreground">
              <Link to={`/books?author=${encodeURIComponent(book.author)}`} className="hover:text-primary">{book.author}</Link>
            </p>
          )}

          <p className="mt-6 font-display text-3xl font-bold tabular-nums">
            {formatPrice(book.price)} <span className="text-base font-normal text-muted-foreground">دینار</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1f7a4d] px-6 font-semibold text-white hover:bg-[#19663f]"
            >
              <MessageCircle className="h-5 w-5" />
              {book.available ? 'داواکردن بە واتساپ' : 'پرسیار بکە کەی دێتەوە'}
            </a>
            <AddToListButton book={book} />
            <ShareButton title={book.name} />
          </div>

          <dl className="mt-10 divide-y rounded-2xl border bg-card">
            {details.map((d) => (
              <div key={d.label} className="flex gap-4 px-5 py-3.5">
                <dt className="w-24 shrink-0 text-sm text-muted-foreground">{d.label}</dt>
                <dd className="font-medium">
                  {d.href ? <Link to={d.href} className="hover:text-primary hover:underline">{d.value}</Link> : d.value}
                </dd>
              </div>
            ))}
          </dl>

          {book.description && <p className="mt-8 whitespace-pre-line leading-8 text-foreground/85">{book.description}</p>}

          <p className="mt-8 text-sm text-muted-foreground">{STORE.delivery}.</p>
        </div>
      </div>

      {related.byAuthor.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-bold">کتێبی تری {book.author}</h2>
          <BookGrid books={related.byAuthor} />
        </section>
      )}

      {related.sameCategory.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-bold">لە هەمان بەش</h2>
            {category && (
              <Link to={`/books?category=${category.id}&available=1`} className="text-sm font-medium text-primary hover:underline">
                هەمووی ببینە
              </Link>
            )}
          </div>
          <BookGrid books={related.sameCategory} />
        </section>
      )}
    </div>
  );
}
