'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cartTotals, useCart } from '@/lib/cartStore';
import { formatTHBPlain } from '@/lib/money';

export function CartClient({ storeSlug }: { storeSlug: string }) {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.removeLine);

  // The cart lives in memory only, so render nothing until the client mounts.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const totals = cartTotals(lines);

  if (lines.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-char-500">ยังไม่มีรายการในตะกร้า</p>
        <Link
          href={`/menu?store=${storeSlug}`}
          role="button"
          className="bg-leaf-600 mt-6 rounded-xl px-6 py-3 font-semibold text-white"
        >
          กลับไปเลือกเมนู
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md pb-44">
      <header className="border-char-200 sticky top-0 z-10 border-b bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href={`/menu?store=${storeSlug}`}
            className="text-char-500 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="ย้อนกลับ"
          >
            ←
          </Link>
          <h1 className="text-char-900 font-semibold">ตะกร้า ({totals.count})</h1>
        </div>
      </header>

      <div className="space-y-3 px-4 pt-6">
        {lines.map((line) => (
          <div key={line.lineId} className="border-char-200 rounded-2xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-char-900 font-semibold">{line.productName}</p>
                {line.optionNames.length > 0 && (
                  <p className="text-char-500 mt-1 text-sm leading-relaxed">
                    {line.optionNames.join(' · ')}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <span className="bg-leaf-50 text-leaf-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    {line.previewProtein} g
                  </span>
                  <span className="bg-char-50 text-char-500 rounded-full px-2 py-0.5 text-xs font-medium">
                    {line.previewKcal} kcal
                  </span>
                </div>
              </div>
              <p className="text-char-900 shrink-0 font-bold">
                ฿{formatTHBPlain(line.previewPrice * line.qty)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="border-char-200 flex items-center gap-1 rounded-lg border">
                <button
                  type="button"
                  onClick={() => setQty(line.lineId, line.qty - 1)}
                  className="text-char-500 h-10 w-10 text-lg"
                  aria-label="ลดจำนวน"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{line.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(line.lineId, line.qty + 1)}
                  className="text-char-500 h-10 w-10 text-lg"
                  aria-label="เพิ่มจำนวน"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeLine(line.lineId)}
                className="text-char-500 px-2 text-sm"
              >
                ลบ
              </button>
            </div>
          </div>
        ))}

        <Link
          href={`/menu?store=${storeSlug}`}
          className="border-char-200 text-char-500 block rounded-xl border border-dashed py-3 text-center text-sm"
        >
          + เพิ่มรายการอื่น
        </Link>
      </div>

      <div className="border-char-200 fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="bg-leaf-50 text-leaf-700 rounded-full px-2.5 py-1 text-xs font-semibold">
                โปรตีนรวม {totals.protein} g
              </span>
              <span className="bg-char-50 text-char-500 rounded-full px-2.5 py-1 text-xs font-semibold">
                {totals.kcal} kcal
              </span>
            </div>
            <p className="text-char-900 text-2xl font-bold">฿{formatTHBPlain(totals.price)}</p>
          </div>

          <Link
            href={`/checkout?store=${storeSlug}`}
            role="button"
            className="bg-leaf-600 active:bg-leaf-700 flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-white"
          >
            เลือกเวลารับ
          </Link>
        </div>
      </div>
    </main>
  );
}
