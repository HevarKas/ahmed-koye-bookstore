import { STORE } from '~/shared/store';

// Lets phones and computers install the site as an app ("Add to Home Screen").
export function loader() {
  const manifest = {
    id: '/',
    name: STORE.name,
    short_name: 'ئەحمەد کۆیی',
    description: `${STORE.name} — گەڕان لە کتێبەکان، نرخ و بەردەستبوون`,
    lang: 'ckb',
    dir: 'rtl',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF6EE',
    theme_color: '#1F4D3F',
    categories: ['books', 'shopping'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'گەڕان لە کتێبەکان', url: '/books', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'لیستەکەم', url: '/list', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
