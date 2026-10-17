import { json } from '@remix-run/node';
import { getMeta } from '~/lib/catalog.server';

export function loader() {
  const { received_at, generated_at, total, available } = getMeta();
  return json({ received_at, generated_at, total, available });
}
