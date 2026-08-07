import Link from 'next/link';
import { notFound } from 'next/navigation';

import { StatusBadge } from '@/components/order/StatusBadge';
import { WaitingMascot } from '@/components/order/WaitingMascot';
import { StatusWatcher } from '@/components/order/StatusWatcher';

import { formatTHBPlain } from '@/lib/money';
import { getOrderByCode } from '@/server/services/orderLookup';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { code } = await params;
  const { t: token } = await searchParams;

  if (!token) notFound();

  const order = await getOrderByCode(code, token);
  if (!order) notFound();

  const pickupTime = order.pickupAt
    ? new Date(order.pickupAt).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok',
      })
    : null;

  return (
    <main className="mx-auto min-h-dvh max-w-md pb-12">
      <StatusWatcher code={code} token={token} currentStatus={order.status} />
      <header className="bg-leaf-700 px-6 pt-14 pb-12 text-center text-white">
        <p className="text-leaf-100 text-xs tracking-[0.2em] uppercase">รหัสรับสินค้า</p>
        <p className="mt-2 text-5xl font-bold tracking-wider">{order.orderCode}</p>
        <div className="mt-5">
          <StatusBadge status={order.status} />
        </div>
      </header>

      <section className="px-4 pt-6">
        <WaitingMascot status={order.status} />
      </section>

      <section className="px-4">
        <div className="border-char-200 rounded-2xl border bg-white p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-char-500 text-sm">เวลารับ</span>
            <span className="text-char-900 text-2xl font-bold">{pickupTime ?? '—'}</span>
          </div>
          {order.flightNo && (
            <div className="border-char-200 mt-3 flex items-baseline justify-between border-t pt-3">
              <span className="text-char-500 text-sm">เที่ยวบิน</span>
              <span className="text-char-900 font-semibold">{order.flightNo}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 px-4">
        <h2 className="text-char-900 mb-3 font-semibold">รายการ</h2>
        <div className="border-char-200 divide-char-200 divide-y rounded-2xl border bg-white">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-char-900 font-medium">
                  {item.name} {item.qty > 1 && `× ${item.qty}`}
                </p>
                {item.options.length > 0 && (
                  <p className="text-char-500 mt-1 text-sm leading-relaxed">
                    {item.options.join(' · ')}
                  </p>
                )}
              </div>
              <p className="text-char-900 shrink-0 font-semibold">
                ฿{formatTHBPlain(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="bg-char-50 rounded-2xl p-5">
          <div className="mb-3 flex gap-2">
            <span className="bg-leaf-50 text-leaf-700 rounded-full px-2.5 py-1 text-xs font-semibold">
              โปรตีนรวม {order.totalProtein} g
            </span>
            <span className="text-char-500 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">
              {order.totalKcal} kcal
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-char-500">ยอดรวม</span>
            <span className="text-char-900 text-2xl font-bold">฿{formatTHBPlain(order.total)}</span>
          </div>
        </div>
      </section>

      {order.status === 'COLLECTED' ? (
        <section className="mt-8 px-4">
          <Link
            href="/s/cei-domestic"
            role="button"
            className="bg-leaf-600 active:bg-leaf-700 wb-lift flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors"
          >
            สั่งอีกครั้ง
          </Link>
          <p className="text-char-500 mt-4 text-center text-sm">
            ขอบคุณที่อุดหนุน แล้วพบกันเที่ยวบินหน้า
          </p>
        </section>
      ) : (
        <p className="text-char-500 mt-8 px-6 text-center text-sm leading-relaxed">
          แสดงรหัส <strong className="text-char-900">{order.orderCode}</strong>{' '}
          ที่เคาน์เตอร์เพื่อรับสินค้า
        </p>
      )}
    </main>
  );
}
