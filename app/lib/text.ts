// Shared by server and browser.

/**
 * Makes Kurdish / Arabic / Persian spellings comparable so a search finds a book
 * whatever keyboard the customer used. Lenient on purpose: ڕ matches ر, ێ matches ی, etc.
 */
export function normalizeText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[ً-ٰٟـ​-‏]/g, '') // harakat, tatweel, zero-width chars
    .replace(/[يىێ]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ةەھه]/g, 'ه')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ؤۆ]/g, 'و')
    .replace(/ڕ/g, 'ر')
    .replace(/ڵ/g, 'ل')
    .replace(/ڤ/g, 'ف')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-US');
}

const KU_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toKurdishDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => KU_DIGITS[Number(d)]);
}
