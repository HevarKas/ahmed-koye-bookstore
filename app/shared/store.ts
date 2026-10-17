// Shop details shown on the website. Edit here to change them everywhere.

export const SITE_URL = 'https://ahmadkoye.com';

export const STORE = {
  name: 'کتێبخانەی ئەحمەد کۆیی',
  tagline: 'کتێب بۆ هەموو خوێنەرێک، لە دڵی کۆیەوە',
  phones: ['0770 158 0442', '0750 112 3555'],
  // International format without "+", used for WhatsApp links.
  whatsapp: '9647701580442',
  address: 'دووسایدی سەرەکی ناوبازار تەنیشت بیتوێن مۆڵ',
  hours: '٩:٠٠ بەیانی — تا بانگی ئێوارە',
  hoursNote: 'هەموو ڕۆژێک جگە لە هەینی',
  delivery: 'گەیاندنی کتێب بۆ هەموو ناوچەکانی کوردستان',
  map: { lat: 36.25563583877866, lng: 44.8832864024485 },
};

export function whatsappLink(message: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}
