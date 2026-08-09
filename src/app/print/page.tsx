import Image from 'next/image';

const POSTERS = [
  {
    file: 'qr-checkin',
    place: 'จุดเช็คอิน',
    headline: 'สั่งตอนนี้ รับตอนผ่านจุดตรวจ',
    sub: 'ไม่ต้องต่อคิว ไม่เสียเวลาก่อนขึ้นเครื่อง',
  },
  {
    file: 'qr-gate',
    place: 'หน้าประตูขึ้นเครื่อง',
    headline: 'ยังไม่ได้กินข้าว?',
    sub: 'สแกนสั่ง พร้อมรับใน 3 นาที',
  },
  {
    file: 'qr-counter',
    place: 'หน้าเคาน์เตอร์',
    headline: 'สแกนสั่งเองได้เลย',
    sub: 'เลือกวัตถุดิบ เห็นโปรตีนทุกเมนู',
  },
];

export const metadata = { title: 'WrapBoost — โปสเตอร์ QR' };

export default function PrintPage() {
  return (
    <main className="bg-white">
      <p className="bg-sun-50 text-sun-700 px-6 py-3 text-center text-sm print:hidden">
        กด Cmd + P เพื่อพิมพ์ · เลือกกระดาษ A4 แนวตั้ง · ปิด &ldquo;Headers and footers&rdquo;
      </p>

      {POSTERS.map((poster) => (
        <section
          key={poster.file}
          className="flex h-[297mm] w-[210mm] break-after-page flex-col items-center justify-between px-16 py-20"
        >
          <header className="text-center">
            <p className="text-sun-600 text-sm font-semibold tracking-[0.3em] uppercase">
              CEI · Domestic Departure
            </p>
            <h1 className="text-leaf-700 mt-4 text-7xl font-bold tracking-tight">WrapBoost</h1>
            <p className="text-char-500 mt-4 text-2xl">แรปสด · เครื่องดื่มฟังก์ชัน</p>
          </header>

          <div className="text-center">
            <h2 className="text-char-900 text-4xl leading-snug font-bold">{poster.headline}</h2>
            <p className="text-char-500 mt-3 text-xl">{poster.sub}</p>

            <div className="border-char-200 mx-auto mt-10 w-fit rounded-3xl border-4 p-6">
              <Image
                src={`/qr/${poster.file}.svg`}
                alt="สแกนเพื่อสั่งอาหาร"
                width={340}
                height={340}
                unoptimized
              />
            </div>

            <p className="text-char-900 mt-6 text-2xl font-semibold">สแกนเพื่อสั่ง</p>
          </div>

          <footer className="w-full text-center">
            <div className="border-char-200 flex justify-center gap-12 border-t pt-8">
              <div>
                <p className="text-sun-600 text-3xl font-bold">ต่ำกว่า 3 นาที</p>
                <p className="text-char-500 mt-1 text-sm">เวลาประกอบ</p>
              </div>
              <div>
                <p className="text-leaf-700 text-3xl font-bold">150–220฿</p>
                <p className="text-char-500 mt-1 text-sm">ต่อเซ็ตคอมโบ</p>
              </div>
            </div>
            <p className="text-char-500 mt-6 text-xs">{poster.place}</p>
          </footer>
        </section>
      ))}
    </main>
  );
}
