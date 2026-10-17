import { Link } from '@remix-run/react';
import { Check, Plus } from 'lucide-react';
import { BookCover } from '~/components/BookCover';
import { useMyList } from '~/lib/myList';
import { formatPrice } from '~/lib/text';
import { cn } from '~/lib/utils';

export type CardBook = {
  id: number;
  name: string;
  author: string | null;
  translator: string | null;
  price: number;
  available: boolean;
  category_id: number;
};

export function AvailabilityBadge({ available, className }: { available: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', available ? 'bg-success' : 'bg-muted-foreground/60')} />
      {available ? 'بەردەستە' : 'نەماوە'}
    </span>
  );
}

export function AddToListButton({ book, compact = false }: { book: CardBook; compact?: boolean }) {
  const list = useMyList();
  const inList = list.ready && list.has(book.id);

  return (
    <button
      type="button"
      onClick={() => list.toggle({ id: book.id, name: book.name, author: book.author, price: book.price })}
      aria-pressed={inList}
      aria-label={inList ? 'لابردن لە لیستەکەم' : 'زیادکردن بۆ لیستەکەم'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition-colors',
        compact ? 'h-9 w-9' : 'h-10 px-4',
        inList
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
      )}
    >
      {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {!compact && (inList ? 'لە لیستەکەمدایە' : 'زیادکردن بۆ لیست')}
    </button>
  );
}

export function BookCard({ book }: { book: CardBook }) {
  return (
    <article className="group flex h-full flex-col">
      <Link to={`/books/${book.id}`} prefetch="intent" className="block rounded-md" tabIndex={-1}>
        <BookCover
          id={book.id}
          title={book.name}
          author={book.author}
          categoryId={book.category_id}
          className={cn('transition-transform duration-300 group-hover:-translate-y-1', !book.available && 'opacity-60 saturate-50')}
        />
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        <h3 className="font-sans text-[0.95rem] font-semibold leading-snug">
          <Link to={`/books/${book.id}`} prefetch="intent" className="line-clamp-2 hover:text-primary">
            {book.name}
          </Link>
        </h3>
        {book.author && (
          <Link
            to={`/books?author=${encodeURIComponent(book.author)}`}
            className="mt-1 truncate text-sm text-muted-foreground hover:text-foreground"
          >
            {book.author}
          </Link>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-base font-bold tabular-nums">
              {formatPrice(book.price)} <span className="text-xs font-normal text-muted-foreground">دینار</span>
            </p>
            <AvailabilityBadge available={book.available} className="mt-1" />
          </div>
          <AddToListButton book={book} compact />
        </div>
      </div>
    </article>
  );
}

export function BookGrid({ books }: { books: CardBook[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
