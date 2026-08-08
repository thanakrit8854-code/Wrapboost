import Link from 'next/link';
import { notFound } from 'next/navigation';

import { HeroWrap } from '@/components/art/HeroWrap';
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
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden">
      {/* warm backdrop */}
      <div className="wb-landing-bg absolute inset-0 -z-10" />

      <header className="px-6 pt-14 text-center">
        <p className="text-sun-700 text-[11px] font-semibold tracking-[0.26em] uppercase">
          {menu.store.airport_code} · Domestic Departure
        </p>
        <h1 className="text-leaf-700 mt-3 text-[3.25rem] leading-[1.05] font-bold tracking-tight">
          WrapBoost
        </h1>
        <p className="text-char-500 mx-auto mt-3 max-w-[19rem] text-[15px] leading-relaxed">
          แรปสดและเครื่องดื่มฟังก์ชัน สั่งตอนนี้ รับที่เคาน์เตอร์ ไม่ต้องต่อคิว
        </p>
      </header>

      <section className="mt-2 flex flex-1 items-center justify-center px-6">
        <HeroWrap />
      </section>

      <section className="px-6">
        <div className="flex items-center justify-center gap-6 rounded-[26px] border border-white/70 bg-white/75 px-5 py-4 shadow-[0_16px_38px_-22px_rgba(45,97,39,0.45)] backdrop-blur-xl">
          <div className="text-center">
            <p className="text-sun-600 text-2xl leading-none font-bold whitespace-nowrap">
              ต่ำกว่า 3 นาที
            </p>
            <p className="text-char-500 mt-1.5 text-xs">เวลาประกอบ</p>
          </div>
          <div className="bg-char-200 h-9 w-px" />
          <div className="text-center">
            <p className="text-leaf-700 text-2xl leading-none font-bold whitespace-nowrap">
              150–220฿
            </p>
            <p className="text-char-500 mt-1.5 text-xs">ต่อเซ็ตคอมโบ</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {[
            'โปรตีนและแคลอรีบอกครบทุกเมนู',
            'เครื่องดื่มฟังก์ชันเจ้าเดียวในเทอร์มินัล',
            isGate
              ? 'สแกนจากเกต — เลือกเฉพาะที่พร้อมเร็วสุด'
              : 'สั่งตั้งแต่เช็คอิน เดินมารับตามเวลา',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span className="bg-leaf-500 mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="text-char-800 text-sm leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="px-6 pt-7 pb-8">
        <Link
          href={`/menu?store=${storeSlug}${channel ? `&c=${channel}` : ''}`}
          role="button"
          className="bg-sun-500 active:bg-sun-600 wb-card-press flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-[0_14px_32px_-12px_rgba(239,140,63,0.8)] transition-colors"
        >
          ดูเมนู
        </Link>
        <p className="text-char-500 mt-3.5 text-center text-xs">
          {menu.store.terminal_zone ?? 'โถงผู้โดยสารขาออกในประเทศ'}
        </p>
      </div>
    </main>
  );
}
