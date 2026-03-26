'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CompareItem {
  id: string;
  name: string;
  brand?: string | null;
  image?: string | null;
}

interface CompareContextValue {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
  count: number;
}

const CompareContext = createContext<CompareContextValue>({
  items: [],
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  isSelected: () => false,
  isFull: false,
  count: 0,
});

const STORAGE_KEY = 'compario-compare';
const MAX = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const persist = (next: CompareItem[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  };

  const toggle = useCallback((item: CompareItem) => {
    setItems((prev) =>
      persist(
        prev.find((i) => i.id === item.id)
          ? prev.filter((i) => i.id !== item.id)
          : prev.length < MAX
          ? [...prev, item]
          : prev,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => persist(prev.filter((i) => i.id !== id)));
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setItems([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        items,
        toggle,
        remove,
        clear,
        isSelected: (id) => items.some((i) => i.id === id),
        isFull: items.length >= MAX,
        count: items.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
