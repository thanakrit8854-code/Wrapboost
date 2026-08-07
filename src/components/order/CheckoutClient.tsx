'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cartTotals, useCart } from '@/lib/cartStore';
import { formatTHBPlain } from '@/lib/money';

interface Slot {
  id: string;
  slotStart: string;
  remaining: number;
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
}

export function CheckoutClient({ storeSlug, channel }: { storeSlug: string; channel?: string }) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [flightNo, setFlightNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch(`/api/slots?store=${storeSlug}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setError('โหลดเวลารับไม่สำเร็จ'));
  }, [storeSlug]);

  if (!mounted) return null;

  const totals = cartTotals(lines);

  if (lines.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-char-500">ตะกร้าว่าง</p>
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

  async function submit() {
    if (!slotId || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeSlug,
          slotId,
          channel: channel ?? 'QR_CHECKIN',
          flightNo: flightNo.trim() || null,
          lines: lines.map((l) => ({
            productId: l.productId,
            optionIds: l.optionIds,
            qty: l.qty,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? 'สั่งซื้อไม่สำเร็จ');
        if (data?.error?.code === 'SLOT_FULL') {
          setSlotId(null);
          const refreshed = await fetch(`/api/slots?store=${storeSlug}`).then((r) => r.json());
          setSlots(refreshed.slots ?? []);
        }
        return;
      }

      clear();
      router.push(`/order/${data.orderCode}?t=${data.accessToken}`);
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ ลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md pb-40">
      <header className="border-char-200 sticky top-0 z-10 border-b bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href={`/cart?store=${storeSlug}`}
            className="text-char-500 flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="ย้อนกลับ"
          >
            ←
          </Link>
          <h1 className="text-char-900 font-semibold">เลือกเวลารับ</h1>
        </div>
      </header>

      <section className="px-4 pt-6">
        <p className="text-char-500 mb-3 text-sm">
          เลือกเวลาที่จะเดินมารับที่เคาน์เตอร์ ออร์เดอร์จะพร้อมก่อนเวลานั้น
        </p>

        {slots.length === 0 ? (
          <p className="border-char-200 text-char-500 rounded-xl border border-dashed p-6 text-center text-sm">
            ไม่มีช่วงเวลาว่างในขณะนี้
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const active = slot.id === slotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  className={[
                    'rounded-xl border py-3 text-center transition-colors',
                    active ? 'border-leaf-500 bg-leaf-50' : 'border-char-200 bg-white',
                  ].join(' ')}
                >
                  <p className="text-char-900 text-sm font-semibold">
                    {formatSlotTime(slot.slotStart)}
                  </p>
                  <p className="text-char-500 text-xs">เหลือ {slot.remaining}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-4 pt-8">
        <label htmlFor="flight" className="text-char-900 mb-2 block font-semibold">
          เที่ยวบิน <span className="text-char-500 text-sm font-normal">(ไม่บังคับ)</span>
        </label>
        <input
          id="flight"
          value={flightNo}
          onChange={(e) => setFlightNo(e.target.value.toUpperCase())}
          placeholder="เช่น FD3216"
          maxLength={10}
          className="border-char-200 focus:border-leaf-500 w-full rounded-xl border px-4 py-3 outline-none"
        />
        <p className="text-char-500 mt-2 text-xs">
          ใส่ไว้เพื่อให้เราเตือนถ้าเวลารับใกล้เวลาขึ้นเครื่องเกินไป
        </p>
      </section>

      {error && (
        <p className="mx-4 mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="border-char-200 fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-char-500 text-sm">{totals.count} รายการ</span>
            <p className="text-char-900 text-2xl font-bold">฿{formatTHBPlain(totals.price)}</p>
          </div>

          <button
            type="button"
            disabled={!slotId || submitting}
            onClick={submit}
            className="bg-leaf-600 active:bg-leaf-700 disabled:bg-char-200 disabled:text-char-500 w-full rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors"
          >
            {submitting ? 'กำลังสั่ง…' : slotId ? 'ยืนยันคำสั่งซื้อ' : 'เลือกเวลารับก่อน'}
          </button>
        </div>
      </div>
    </main>
  );
}
