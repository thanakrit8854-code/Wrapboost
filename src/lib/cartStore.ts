'use client';

import { create } from 'zustand';

export interface CartLine {
  lineId: string;
  productId: string;
  productName: string;
  optionIds: string[];
  optionNames: string[];
  qty: number;
  /** Client-side preview only. The server recomputes every figure on submit. */
  previewPrice: number;
  previewKcal: number;
  previewProtein: number;
}

interface CartState {
  storeSlug: string | null;
  lines: CartLine[];
  addLine: (line: Omit<CartLine, 'lineId'>, storeSlug: string) => void;
  removeLine: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>((set) => ({
  storeSlug: null,
  lines: [],

  addLine: (line, storeSlug) =>
    set((state) => ({
      storeSlug,
      lines: [...state.lines, { ...line, lineId: crypto.randomUUID() }],
    })),

  removeLine: (lineId) =>
    set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) })),

  setQty: (lineId, qty) =>
    set((state) => ({
      lines:
        qty <= 0
          ? state.lines.filter((l) => l.lineId !== lineId)
          : state.lines.map((l) => (l.lineId === lineId ? { ...l, qty } : l)),
    })),

  clear: () => set({ lines: [], storeSlug: null }),
}));

export function cartTotals(lines: CartLine[]) {
  return lines.reduce(
    (acc, l) => ({
      price: acc.price + l.previewPrice * l.qty,
      kcal: acc.kcal + l.previewKcal * l.qty,
      protein: Number((acc.protein + l.previewProtein * l.qty).toFixed(1)),
      count: acc.count + l.qty,
    }),
    { price: 0, kcal: 0, protein: 0, count: 0 },
  );
}
