'use client';

import { WrapBuilderArt } from '@/components/art/WrapBuilderArt';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { OptionGroupPicker } from '@/components/menu/OptionGroupPicker';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useCart } from '@/lib/cartStore';
import { formatTHBPlain } from '@/lib/money';
import { priceSelection, validateSelection, type Selection } from '@/lib/pricing';
import type { MenuProduct } from '@/types/menu';

export function BuildClient({ product, storeSlug }: { product: MenuProduct; storeSlug: string }) {
  const router = useRouter();
  const addLine = useCart((s) => s.addLine);
  const [selection, setSelection] = useState<Selection>({});

  const priced = useMemo(() => priceSelection(product, selection), [product, selection]);
  const layers = useMemo(() => {
    const names = priced.chosen.map((o) => o.name_th);
    return {
      base: names.find((n) => n.includes('แป้ง')) ?? null,
      protein:
        names.find((n) => n.includes('ไก่') || n.includes('ทูน่า') || n.includes('เต้าหู้')) ??
        null,
      veggies: names.filter((n) =>
        ['ผักกาด', 'มะเขือเทศ', 'แตงกวา', 'หอมแดง', 'แครอท'].some((v) => n.includes(v)),
      ),
      sauce:
        names.find(
          (n) =>
            n.includes('ซอส') ||
            n.includes('โยเกิร์ต') ||
            n.includes('งา') ||
            n.includes('พริกไทย'),
        ) ?? null,
    };
  }, [priced.chosen]);

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

  function handleAdd() {
    if (!valid) return;

    addLine(
      {
        productId: product.id,
        productName: product.name_th,
        optionIds: priced.chosen.map((o) => o.id),
        optionNames: priced.chosen.map((o) => o.name_th),
        qty: 1,
        previewPrice: priced.price,
        previewKcal: priced.kcal,
        previewProtein: priced.protein,
      },
      storeSlug,
    );

    router.push(`/cart?store=${storeSlug}`);
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

      <section className="flex justify-center pt-6">
        <div className="bg-sand-100 flex h-40 w-40 items-center justify-center rounded-3xl">
          <WrapBuilderArt layers={layers} />
        </div>
      </section>

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

      <div className="border-char-200 fixed inset-x-0 bottom-0 border-t bg-white/92 shadow-[0_-12px_36px_-18px_rgba(26,26,23,0.28)] backdrop-blur-xl">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-2">
              <span
                key={`p-${priced.protein}`}
                className="bg-leaf-50 text-leaf-700 wb-orbit rounded-full px-2.5 py-1 text-xs font-semibold"
              >
                โปรตีน <AnimatedNumber value={priced.protein} decimals={1} /> g
              </span>
              <span className="bg-char-50 text-char-500 rounded-full px-2.5 py-1 text-xs font-semibold">
                <AnimatedNumber value={priced.kcal} /> kcal
              </span>
            </div>
            <p key={priced.price} className="text-char-900 wb-roll text-2xl font-bold">
              ฿<AnimatedNumber value={priced.price / 100} />
            </p>
          </div>

          <button
            type="button"
            disabled={!valid}
            onClick={handleAdd}
            className="bg-leaf-600 active:bg-leaf-700 disabled:bg-char-200 disabled:text-char-500 w-full rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors"
          >
            {valid ? 'เพิ่มลงตะกร้า' : `ยังต้องเลือก: ${missing.join(', ')}`}
          </button>
        </div>
      </div>
    </main>
  );
}
