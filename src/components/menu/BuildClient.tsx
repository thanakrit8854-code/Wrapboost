'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { OptionGroupPicker } from '@/components/menu/OptionGroupPicker';
import { formatTHBPlain } from '@/lib/money';
import { priceSelection, validateSelection, type Selection } from '@/lib/pricing';
import type { MenuProduct } from '@/types/menu';

export function BuildClient({ product, storeSlug }: { product: MenuProduct; storeSlug: string }) {
  const [selection, setSelection] = useState<Selection>({});

  const priced = useMemo(() => priceSelection(product, selection), [product, selection]);
  const { valid, missing } = useMemo(
    () => validateSelection(product, selection),
    [product, selection],
  );

  function toggle(groupId: string, optionId: string) {
    setSelection((prev) => {
      const group = product.option_groups.find((g) => g.id === groupId);
      if (!group) return prev;

      const current = prev[groupId] ?? [];

      if (group.select_type === 'SINGLE') {
        return { ...prev, [groupId]: current.includes(optionId) ? [] : [optionId] };
      }

      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }

      if (current.length >= group.max_select) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md pb-40">
      <header className="border-char-200 sticky top-0 z-10 border-b bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href={`/menu?store=${storeSlug}`}
            className="text-char-500 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="ย้อนกลับ"
          >
            ←
          </Link>
          <h1 className="text-char-900 truncate font-semibold">{product.name_th}</h1>
        </div>
      </header>

      <div className="space-y-8 px-4 pt-6">
        {product.option_groups.map((group) => (
          <OptionGroupPicker
            key={group.id}
            group={group}
            selected={selection[group.id] ?? []}
            onToggle={(optionId) => toggle(group.id, optionId)}
          />
        ))}
      </div>

      <div className="border-char-200 fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="bg-leaf-50 text-leaf-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                โปรตีน {priced.protein} g
              </span>
              <span className="bg-char-50 text-char-500 rounded-full px-2.5 py-1 text-xs font-semibold">
                {priced.kcal} kcal
              </span>
            </div>
            <p className="text-char-900 text-2xl font-bold">฿{formatTHBPlain(priced.price)}</p>
          </div>

          <button
            type="button"
            disabled={!valid}
            className="bg-leaf-600 active:bg-leaf-700 disabled:bg-char-200 disabled:text-char-500 w-full rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors"
          >
            {valid ? 'เพิ่มลงตะกร้า' : `ยังต้องเลือก: ${missing.join(', ')}`}
          </button>
        </div>
      </div>
    </main>
  );
}
