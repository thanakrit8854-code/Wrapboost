import { AirportScene } from '@/components/art/AirportScene';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getStoreMenu } from '@/server/services/menuService';

export default async function StoreLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { storeSlug } = await params;
  const { c: channel } = await searchParams;

  const menu = await getStoreMenu(storeSlug);
  if (!menu) notFound();

  const isGate = channel === 'QR_GATE';

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="bg-leaf-700 px-6 pt-14 pb-10 text-white">
        <p className="text-leaf-100 text-xs tracking-[0.2em] uppercase">
          {menu.store.airport_code} · Domestic Departure
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold">WrapBoost</h1>
        <p className="text-leaf-100 mt-2 text-sm">
          แรปสดและเครื่องดื่มฟังก์ชัน สั่งตอนนี้ รับที่เคาน์เตอร์ ไม่ต้องต่อคิว
        </p>
        <div className="-mx-6 mt-6 -mb-10">
          <AirportScene />
        </div>
      </header>

      <section className="-mt-6 px-4">
        <div className="border-char-200 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-char-500 text-sm">เวลาที่ใช้ประกอบ</span>
            <span className="text-sun-600 text-2xl font-bold">ต่ำกว่า 3 นาที</span>
          </div>
          <p className="text-char-500 mt-3 text-sm leading-relaxed">
            {isGate
              ? 'สแกนจากประตูขึ้นเครื่อง — เราจะแสดงเฉพาะรายการที่พร้อมรับได้เร็วที่สุด'
              : 'สั่งตั้งแต่เช็คอิน แล้วเดินมารับที่เคาน์เตอร์ตามเวลาที่เลือกไว้'}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-3 px-4">
        {[
          { label: 'โปรตีนและแคลอรีบอกครบทุกเมนู', detail: 'ตัดสินใจได้ใน 5 วินาที' },
          {
            label: 'เครื่องดื่มฟังก์ชันเจ้าเดียวในเทอร์มินัล',
            detail: 'เวย์ คอลลาเจน วิตามิน ไฟเบอร์',
          },
          { label: 'กินได้มือเดียวที่ประตูขึ้นเครื่อง', detail: 'ไม่ต้องใช้ช้อนส้อม ไม่หก' },
        ].map((item) => (
          <div key={item.label} className="flex gap-3">
            <div className="bg-leaf-500 mt-1.5 h-2 w-2 shrink-0 rounded-full" />
            <div>
              <p className="text-char-900 text-sm font-medium">{item.label}</p>
              <p className="text-char-500 text-sm">{item.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-auto px-4 pt-10 pb-8">
        <Link
          href={`/menu?store=${storeSlug}${channel ? `&c=${channel}` : ''}`}
          role="button"
          className="bg-sun-500 active:bg-sun-600 wb-card-press flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-white shadow-[0_10px_28px_-10px_rgba(239,140,63,0.7)] transition-colors"
        >
          ดูเมนู
        </Link>
        <p className="text-char-500 mt-4 text-center text-xs">
          {menu.store.terminal_zone ?? 'โถงผู้โดยสารขาออกในประเทศ'}
        </p>
      </div>
    </main>
  );
}
