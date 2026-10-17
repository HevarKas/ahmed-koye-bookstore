import { Form, Link, NavLink, useLocation, useSearchParams } from '@remix-run/react';
import { BookMarked, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import AKlogo from '~/assets/AKlogo';
import { useMyList } from '~/lib/myList';
import { cn } from '~/lib/utils';
import { STORE } from '~/shared/store';

const NAV = [
  { to: '/', label: 'سەرەکی', end: true },
  { to: '/books', label: 'کتێبەکان' },
  { to: '/categories', label: 'بەشەکان' },
  { to: '/visit', label: 'سەردانمان بکە' },
];

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('ak-theme', next ? 'dark' : 'light');
    } catch {
      // ignore
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      aria-label={dark ? 'ڕووناک' : 'تاریک'}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export function SiteHeader() {
  const list = useMyList();
  const location = useLocation();
  const [params] = useSearchParams();
  const count = list.ready ? list.items.length : 0;
  const showSearch = location.pathname !== '/' && location.pathname !== '/books';

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={STORE.name}>
          <AKlogo className="h-10 w-10 text-foreground" />
          <span className="hidden font-display text-[0.95rem] font-bold leading-tight sm:block">{STORE.name}</span>
        </Link>

        <nav className="mx-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm transition-colors',
                  isActive ? 'bg-secondary font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1">
          {showSearch && (
            <Form action="/books" className="relative ml-1 hidden w-full max-w-xs lg:block" role="search">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                key={params.get('q') ?? ''}
                name="q"
                defaultValue={params.get('q') ?? ''}
                placeholder="گەڕان بۆ کتێب یان نووسەر..."
                className="h-10 w-full rounded-full border bg-card pr-9 pl-4 text-sm placeholder:text-muted-foreground"
              />
            </Form>
          )}
          <Link
            to="/books"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="گەڕان"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <Link
            to="/list"
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <BookMarked className="h-4 w-4" />
            <span className="hidden sm:inline">لیستەکەم</span>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-highlight px-1.5 text-xs font-bold text-highlight-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="container-page scrollbar-none flex gap-1 overflow-x-auto pb-2 md:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn('chip py-1', isActive && 'chip-active')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
