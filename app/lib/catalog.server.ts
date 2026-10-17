import fs from 'node:fs';
import path from 'node:path';
import { normalizeText } from '~/lib/text';

/**
 * The public website keeps its own copy of the book list in one JSON file.
 * The shop laptop replaces the whole file once a day through POST /api/sync,
 * so the site keeps working on its own when the laptop is offline.
 */

export type Category = { id: number; name: string; count: number; available: number };

export type Book = {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  author: string | null;
  translator: string | null;
  publish_year: number | null;
  price: number;
  available: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type Catalog = {
  generated_at: string | null;
  received_at: string | null;
  categories: Category[];
  books: Book[];
};

type Indexed = Book & { _name: string; _author: string; _translator: string };

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'catalog.json');

let state: { mtime: number; catalog: Catalog; indexed: Indexed[]; byId: Map<number, Indexed> } | null = null;

const EMPTY: Catalog = { generated_at: null, received_at: null, categories: [], books: [] };

function build(catalog: Catalog, mtime: number) {
  const indexed = catalog.books.map((b) => ({
    ...b,
    _name: normalizeText(b.name),
    _author: normalizeText(b.author),
    _translator: normalizeText(b.translator),
  }));
  state = { mtime, catalog, indexed, byId: new Map(indexed.map((b) => [b.id, b])) };
  return state;
}

function current() {
  let mtime = 0;
  try {
    mtime = fs.statSync(FILE).mtimeMs;
  } catch {
    return state ?? build(EMPTY, 0);
  }
  if (state && state.mtime === mtime) return state;
  try {
    return build(JSON.parse(fs.readFileSync(FILE, 'utf8')) as Catalog, mtime);
  } catch (error) {
    console.error('Could not read catalog file, keeping the previous copy:', error);
    return state ?? build(EMPTY, 0);
  }
}

const str = (v: unknown, max = 4000) => (typeof v === 'string' && v.trim() !== '' ? v.trim().slice(0, max) : null);
const int = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : null);

/** Validate a sync payload and keep only the public fields, whatever the sender included. */
export function parseSyncPayload(raw: unknown): Catalog {
  if (!raw || typeof raw !== 'object') throw new Error('Body must be a JSON object.');
  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.books) || !Array.isArray(body.categories)) {
    throw new Error('Body must contain "books" and "categories" arrays.');
  }

  const books: Book[] = body.books.map((value, i) => {
    const b = value as Record<string, unknown>;
    const id = int(b.id);
    const name = str(b.name, 255);
    const price = int(b.price);
    const category_id = int(b.category_id);
    if (id === null || !name || price === null || category_id === null) {
      throw new Error(`Book #${i} is missing id, name, price or category_id.`);
    }
    return {
      id,
      name,
      description: str(b.description),
      category_id,
      author: str(b.author, 255),
      translator: str(b.translator, 255),
      publish_year: int(b.publish_year),
      price,
      available: b.available === true,
      created_at: str(b.created_at, 40),
      updated_at: str(b.updated_at, 40),
    };
  });

  const categories: Category[] = body.categories.map((value, i) => {
    const c = value as Record<string, unknown>;
    const id = int(c.id);
    const name = str(c.name, 255);
    if (id === null || !name) throw new Error(`Category #${i} is missing id or name.`);
    const inCategory = books.filter((b) => b.category_id === id);
    return { id, name, count: inCategory.length, available: inCategory.filter((b) => b.available).length };
  });

  return {
    generated_at: str(body.generated_at, 40),
    received_at: new Date().toISOString(),
    categories,
    books,
  };
}

/** Atomically replace the stored catalog. */
export function saveCatalog(catalog: Catalog) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(catalog));
  fs.renameSync(tmp, FILE);
  build(catalog, fs.statSync(FILE).mtimeMs);
}

export function getMeta() {
  const { catalog } = current();
  return {
    received_at: catalog.received_at,
    generated_at: catalog.generated_at,
    total: catalog.books.length,
    available: catalog.books.filter((b) => b.available).length,
    categories: catalog.categories,
  };
}

const strip = ({ _name, _author, _translator, ...book }: Indexed): Book => book;

export type Sort = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'name';

export type SearchParams = {
  q?: string;
  category?: number | null;
  author?: string | null;
  available?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: Sort;
  page?: number;
  perPage?: number;
};

export function searchBooks(params: SearchParams) {
  const { indexed } = current();
  const q = normalizeText(params.q);
  const words = q ? q.split(' ') : [];
  const author = params.author ? normalizeText(params.author) : '';

  let results: { book: Indexed; score: number }[] = [];
  for (const book of indexed) {
    if (params.category && book.category_id !== params.category) continue;
    if (params.available && !book.available) continue;
    if (params.minPrice != null && book.price < params.minPrice) continue;
    if (params.maxPrice != null && book.price > params.maxPrice) continue;
    if (author && book._author !== author) continue;

    let score = 0;
    if (words.length) {
      const haystack = `${book._name} ${book._author} ${book._translator}`;
      if (!words.every((w) => haystack.includes(w))) continue;
      if (book._name === q) score += 100;
      else if (book._name.startsWith(q)) score += 50;
      else if (book._name.includes(q)) score += 25;
      if (book._author.includes(q)) score += 15;
      if (book._translator.includes(q)) score += 5;
    }
    results.push({ book, score });
  }

  const sort: Sort = params.sort ?? (words.length ? 'relevance' : 'newest');
  const newest = (a: Indexed, b: Indexed) => (b.created_at ?? '').localeCompare(a.created_at ?? '') || b.id - a.id;
  const comparators: Record<Sort, (a: { book: Indexed; score: number }, b: { book: Indexed; score: number }) => number> = {
    relevance: (a, b) => b.score - a.score || Number(b.book.available) - Number(a.book.available) || newest(a.book, b.book),
    newest: (a, b) => newest(a.book, b.book),
    price_asc: (a, b) => a.book.price - b.book.price,
    price_desc: (a, b) => b.book.price - a.book.price,
    name: (a, b) => a.book.name.localeCompare(b.book.name, 'ckb'),
  };
  results = results.sort(comparators[sort]);

  const perPage = params.perPage ?? 24;
  const total = results.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, params.page ?? 1), lastPage);

  return {
    books: results.slice((page - 1) * perPage, page * perPage).map((r) => strip(r.book)),
    total,
    page,
    lastPage,
    sort,
  };
}

export function getBook(id: number) {
  const { byId } = current();
  const book = byId.get(id);
  return book ? strip(book) : null;
}

export function getRelated(book: Book, limit = 8) {
  const { indexed } = current();
  const author = normalizeText(book.author);
  const byAuthor = author
    ? indexed.filter((b) => b.id !== book.id && b._author === author).slice(0, limit)
    : [];
  const sameCategory = indexed
    .filter((b) => b.id !== book.id && b.category_id === book.category_id && b.available && b._author !== author)
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .slice(0, limit);
  return { byAuthor: byAuthor.map(strip), sameCategory: sameCategory.map(strip) };
}

export function getBooksByIds(ids: number[]) {
  const { byId } = current();
  return ids.map((id) => byId.get(id)).filter((b): b is Indexed => Boolean(b)).map(strip);
}

export function getAllIds() {
  return current().catalog.books.map((b) => ({ id: b.id, updated_at: b.updated_at }));
}
