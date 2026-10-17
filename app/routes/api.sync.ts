import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { json, type ActionFunctionArgs } from '@remix-run/node';
import { parseSyncPayload, saveCatalog } from '~/lib/catalog.server';

const MAX_COMPRESSED = 20 * 1024 * 1024;
const MAX_JSON = 100 * 1024 * 1024;

function tokenMatches(given: string, expected: string) {
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

// Receives the full public book list from the shop laptop (see `php artisan public:sync`).
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  const expected = process.env.SYNC_TOKEN;
  if (!expected) {
    return json({ ok: false, error: 'Sync is disabled: SYNC_TOKEN is not set on the server.' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!given || !tokenMatches(given, expected)) {
    return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body = Buffer.from(await request.arrayBuffer());
  if (body.length > MAX_COMPRESSED) {
    return json({ ok: false, error: 'Payload too large' }, { status: 413 });
  }

  try {
    if ((request.headers.get('content-encoding') ?? '').includes('gzip')) {
      body = zlib.gunzipSync(body, { maxOutputLength: MAX_JSON });
    }
    const catalog = parseSyncPayload(JSON.parse(body.toString('utf8')));
    saveCatalog(catalog);
    return json({ ok: true, books: catalog.books.length, categories: catalog.categories.length, received_at: catalog.received_at });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : 'Invalid payload' }, { status: 422 });
  }
}

export function loader() {
  return json({ ok: false, error: 'Use POST' }, { status: 405 });
}
