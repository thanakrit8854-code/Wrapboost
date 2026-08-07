import { notFound } from 'next/navigation';

import { StatusWatcher } from '@/components/order/StatusWatcher';

import { formatTHBPlain } from '@/lib/money';
import { getOrderByCode } from '@/server/services/orderLookup';

const STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  PENDING_PAYMENT: { text: 'รอชำระเงิน', tone: 'bg-amber-50 text-amber-700' },
  PAID: { text: 'ชำระแล้ว รอคิว', tone: 'bg-leaf-50 text-leaf-700' },
  QUEUED: { text: 'อยู่ในคิว', tone: 'bg-leaf-50 text-leaf-700' },
  PREPARING: { text: 'กำลังทำ', tone: 'bg-leaf-50 text-leaf-700' },
  READY: { text: 'พร้อมรับแล้ว', tone: 'bg-leaf-500 text-white' },
  COLLECTED: { text: 'รับแล้ว', tone: 'bg-char-200 text-char-800' },
  CANCELLED: { text: 'ยกเลิกแล้ว', tone: 'bg-red-50 text-red-700' },
  EXPIRED: { text: 'หมดอายุ', tone: 'bg-red-50 text-red-700' },
};

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

  const status = STATUS_LABEL[order.status] ?? {
    text: order.status,
    tone: 'bg-char-200 text-char-800',
  };

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
        <span
          className={`mt-5 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${status.tone}`}
        >
          {status.text}
        </span>
      </header>

      <section className="-mt-6 px-4">
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

      <p className="text-char-500 mt-8 px-6 text-center text-sm leading-relaxed">
        แสดงรหัส <strong className="text-char-900">{order.orderCode}</strong>{' '}
        ที่เคาน์เตอร์เพื่อรับสินค้า
      </p>
    </main>
  );
}
