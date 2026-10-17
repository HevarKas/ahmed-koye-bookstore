import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** "My list": books a customer wants, kept in their browser and sent to the shop on WhatsApp. */

export type ListItem = { id: number; name: string; author: string | null; price: number; qty: number };

type ListContext = {
  items: ListItem[];
  ready: boolean;
  has: (id: number) => boolean;
  toggle: (item: Omit<ListItem, 'qty'>) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const KEY = 'ak-my-list';
const Ctx = createContext<ListContext | null>(null);

function read(): ListItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.filter((i) => typeof i?.id === 'number') : [];
  } catch {
    return [];
  }
}

export function MyListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setItems(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const save = useCallback((next: ListItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private mode or storage blocked: the list still works until the page is closed.
    }
  }, []);

  const value = useMemo<ListContext>(
    () => ({
      items,
      ready,
      has: (id) => items.some((i) => i.id === id),
      toggle: (item) =>
        save(items.some((i) => i.id === item.id) ? items.filter((i) => i.id !== item.id) : [...items, { ...item, qty: 1 }]),
      setQty: (id, qty) => save(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i))),
      remove: (id) => save(items.filter((i) => i.id !== id)),
      clear: () => save([]),
    }),
    [items, ready, save],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMyList() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMyList must be used inside MyListProvider');
  return ctx;
}
