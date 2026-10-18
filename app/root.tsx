import React from 'react';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useRouteLoaderData,
  type MetaFunction,
} from '@remix-run/react';
import { json, type LinksFunction } from '@remix-run/node';
import '~/tailwind.css';
import { SiteFooter } from '~/components/SiteFooter';
import { SiteHeader } from '~/components/SiteHeader';
import { getMeta } from '~/lib/catalog.server';
import { MyListProvider } from '~/lib/myList';
import { PwaSupport } from '~/components/PwaSupport';
import { SITE_URL, STORE } from '~/shared/store';

export const meta: MetaFunction = () => [
  { title: STORE.name },
  { name: 'description', content: `${STORE.name} — گەڕان لە هەزاران کتێب، نرخ و بەردەستبوون. ${STORE.delivery}.` },
  { property: 'og:title', content: STORE.name },
  { property: 'og:image', content: `${SITE_URL}/images/AKlogo.png` },
  { property: 'og:url', content: SITE_URL },
];

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@500;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
    // CORS so the service worker can keep a copy for offline use.
    crossOrigin: 'anonymous',
  },
];

export function loader() {
  return json({ updatedAt: getMeta().received_at });
}

// Applied before first paint so dark mode never flashes.
const THEME_SCRIPT = `try{var t=localStorage.getItem('ak-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>('root');
  return (
    <html lang="ckb" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1F4D3F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ئەحمەد کۆیی" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col">
        <MyListProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter updatedAt={data?.updatedAt ?? null} />
          <PwaSupport />
        </MyListProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-primary/20">{notFound ? '٤٠٤' : '!'}</p>
      <h1 className="mt-4 text-2xl font-bold">{notFound ? 'ئەم پەڕەیە نەدۆزرایەوە' : 'هەڵەیەک ڕوویدا'}</h1>
      <p className="mt-2 text-muted-foreground">
        {notFound ? 'لەوانەیە کتێبەکە لابرابێت یان بەستەرەکە هەڵە بێت.' : 'تکایە دواتر هەوڵ بدەرەوە.'}
      </p>
      <Link to="/books" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-primary-foreground">
        بگەڕێوە بۆ کتێبەکان
      </Link>
    </div>
  );
}
