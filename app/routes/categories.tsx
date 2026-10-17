import { json, type MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getMeta } from '~/lib/catalog.server';
import { formatPrice } from '~/lib/text';
import { STORE } from '~/shared/store';

export const meta: MetaFunction = () => [{ title: `بەشەکان — ${STORE.name}` }];

export function loader() {
  const categories = [...getMeta().categories].filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
  return json({ categories });
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>();
  const max = Math.max(1, ...categories.map((c) => c.count));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">بەشەکان</h1>
      <p className="mt-2 text-muted-foreground">کتێبەکان بەپێی بابەت. بەشێک هەڵبژێرە بۆ بینینی کتێبەکانی.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} to={`/books?category=${c.id}`} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-sans text-lg font-semibold group-hover:text-primary">{c.name}</h2>
              <span className="text-sm tabular-nums text-muted-foreground">{formatPrice(c.count)}</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${(c.count / max) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatPrice(c.available)} بەردەست</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
