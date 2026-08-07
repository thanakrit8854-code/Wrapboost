'use client';

import { useCallback, useEffect, useState } from 'react';

interface KdsItem {
  name: string;
  qty: number;
  options: string[];
}

interface KdsOrder {
  id: string;
  orderCode: string;
  status: 'QUEUED' | 'PREPARING' | 'READY';
  pickupAt: string | null;
  paidAt: string | null;
  readyAt: string | null;
  flightNo: string | null;
  items: KdsItem[];
}

interface KdsBoard {
  queued: KdsOrder[];
  preparing: KdsOrder[];
  ready: KdsOrder[];
  stats: { openCount: number; medianAssemblySeconds: number | null; completedToday: number };
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function timeOnly(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
}

/** Counts up from paid_at so staff see how long each order has been waiting. */
function ElapsedTimer({ since }: { since: string | null }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!since) return;
    const tick = () =>
      setSeconds(Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [since]);

  if (!since) return null;

  const late = seconds > 180;

  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-sm font-bold ${
        late ? 'bg-red-100 text-red-700' : 'bg-char-100 text-char-800'
      }`}
    >
      {clock(seconds)}
    </span>
  );
}

function OrderCard({
  order,
  actionLabel,
  onAction,
  busy,
}: {
  order: KdsOrder;
  actionLabel: string;
  onAction: () => void;
  busy: boolean;
}) {
  return (
    <div className="border-char-200 rounded-xl border bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-char-900 font-mono text-xl font-bold">{order.orderCode}</p>
        <ElapsedTimer since={order.paidAt} />
      </div>

      <p className="text-char-500 mt-1 text-xs">
        รับ {timeOnly(order.pickupAt)}
        {order.flightNo && ` · ${order.flightNo}`}
      </p>

      <div className="mt-3 space-y-2">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-char-900 text-sm font-semibold">
              {item.qty > 1 && `${item.qty}× `}
              {item.name}
            </p>
            {item.options.length > 0 && (
              <p className="text-char-500 text-xs leading-relaxed">{item.options.join(' · ')}</p>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={busy}
        className="bg-leaf-600 active:bg-leaf-700 disabled:bg-char-200 mt-3 w-full rounded-lg py-3 text-sm font-semibold text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function KdsClient({ storeSlug }: { storeSlug: string }) {
  const [board, setBoard] = useState<KdsBoard | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/kds?store=${storeSlug}`, { cache: 'no-store' });
      if (res.ok) setBoard(await res.json());
    } catch {
      // keep the last board on screen rather than blanking the kitchen
    }
  }, [storeSlug]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  async function advance(orderId: string, toStatus: string) {
    setBusyId(orderId);
    try {
      await fetch('/api/kds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, toStatus }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (!board) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-char-500">กำลังโหลดจอครัว…</p>
      </main>
    );
  }

  const median = board.stats.medianAssemblySeconds;

  return (
    <main className="min-h-dvh px-4 py-4">
      <header className="border-char-200 mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-char-900 text-lg font-bold">จอครัว · WrapBoost</h1>
          <p className="text-char-500 text-sm">ออร์เดอร์ค้าง {board.stats.openCount} รายการ</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-char-500 text-xs">เวลาประกอบเฉลี่ยวันนี้</p>
            <p
              className={`text-2xl font-bold ${
                median !== null && median <= 180 ? 'text-leaf-700' : 'text-char-900'
              }`}
            >
              {median !== null ? clock(median) : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-char-500 text-xs">เสร็จแล้ววันนี้</p>
            <p className="text-char-900 text-2xl font-bold">{board.stats.completedToday}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <section>
          <h2 className="text-char-500 mb-2 text-sm font-semibold tracking-wide uppercase">
            เข้าใหม่ ({board.queued.length})
          </h2>
          <div className="space-y-3">
            {board.queued.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                actionLabel="เริ่มทำ"
                busy={busyId === o.id}
                onAction={() => advance(o.id, 'PREPARING')}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-char-500 mb-2 text-sm font-semibold tracking-wide uppercase">
            กำลังทำ ({board.preparing.length})
          </h2>
          <div className="space-y-3">
            {board.preparing.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                actionLabel="เสร็จแล้ว"
                busy={busyId === o.id}
                onAction={() => advance(o.id, 'READY')}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-char-500 mb-2 text-sm font-semibold tracking-wide uppercase">
            พร้อมรับ ({board.ready.length})
          </h2>
          <div className="space-y-3">
            {board.ready.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                actionLabel="ส่งมอบแล้ว"
                busy={busyId === o.id}
                onAction={() => advance(o.id, 'COLLECTED')}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
