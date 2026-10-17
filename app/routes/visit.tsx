import type { MetaFunction } from '@remix-run/node';
import { Clock, MapPin, MessageCircle, Navigation, Phone, Truck } from 'lucide-react';
import { STORE, whatsappLink } from '~/shared/store';

export const meta: MetaFunction = () => [{ title: `سەردانمان بکە — ${STORE.name}` }];

export default function Visit() {
  const { lat, lng } = STORE.map;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">سەردانمان بکە</h1>
      <p className="mt-2 text-muted-foreground">بەخێربێیت بۆ کتێبخانەکەمان، شوێنێکی ئارام بۆ دۆزینەوەی کتێب.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="overflow-hidden rounded-3xl border bg-card">
          <iframe
            title="نەخشەی کتێبخانەکە"
            className="aspect-[4/3] w-full sm:aspect-video"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${lat},${lng}&hl=ckb&z=16&output=embed`}
          />
        </div>

        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'ناونیشان', body: STORE.address },
            { icon: Clock, title: 'کاتی کارکردن', body: `${STORE.hours} · ${STORE.hoursNote}` },
            { icon: Truck, title: 'گەیاندن', body: STORE.delivery },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 rounded-2xl border bg-card p-5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-highlight" />
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-0.5 font-medium leading-7">{body}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-4 rounded-2xl border bg-card p-5">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-highlight" />
            <div>
              <p className="text-sm text-muted-foreground">پەیوەندی</p>
              {STORE.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, '')}`} dir="ltr" className="block font-medium hover:text-primary">
                  {p}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground"
            >
              <Navigation className="h-4 w-4" /> ڕێگا
            </a>
            <a
              href={whatsappLink('سڵاو')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1f7a4d] font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" /> واتساپ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
