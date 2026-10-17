import { Link } from '@remix-run/react';
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { STORE, whatsappLink } from '~/shared/store';

export function LastUpdated({ at }: { at: string | null }) {
  if (!at) return null;
  const date = new Date(at);
  const text = date.toLocaleDateString('en-GB', { timeZone: 'Asia/Baghdad', year: 'numeric', month: '2-digit', day: '2-digit' });
  return <span dir="ltr">{text}</span>;
}

export function SiteFooter({ updatedAt }: { updatedAt: string | null }) {
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <h2 className="font-display text-lg font-bold">{STORE.name}</h2>
          <p className="mt-2 max-w-xs text-sm leading-7 text-muted-foreground">{STORE.tagline}</p>
          <a
            href={whatsappLink('سڵاو، پرسیارێکم هەیە دەربارەی کتێبێک')}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#1f7a4d] px-4 text-sm font-medium text-white hover:bg-[#19663f]"
          >
            <MessageCircle className="h-4 w-4" />
            پرسیار لە واتساپ
          </a>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-highlight" />
            <span>{STORE.address}</span>
          </li>
          <li className="flex gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-highlight" />
            <span className="flex flex-wrap gap-x-3">
              {STORE.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, '')}`} dir="ltr" className="hover:text-primary">
                  {p}
                </a>
              ))}
            </span>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-highlight" />
            <span>
              {STORE.hours} <span className="text-muted-foreground">· {STORE.hoursNote}</span>
            </span>
          </li>
        </ul>
        <div className="text-sm">
          <ul className="space-y-2">
            <li><Link className="hover:text-primary" to="/books">هەموو کتێبەکان</Link></li>
            <li><Link className="hover:text-primary" to="/books?available=1&sort=newest">تازە گەیشتووەکان</Link></li>
            <li><Link className="hover:text-primary" to="/categories">بەشەکان</Link></li>
            <li><Link className="hover:text-primary" to="/visit">نەخشە و پەیوەندی</Link></li>
          </ul>
          {updatedAt && (
            <p className="mt-6 text-xs text-muted-foreground">
              دوایین نوێکردنەوەی لیستی کتێبەکان: <LastUpdated at={updatedAt} />
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
