import { formatTHBPlain } from '@/lib/money';
import { getDailyReport } from '@/server/services/reportService';

const CHANNEL_LABEL: Record<string, string> = {
  QR_CHECKIN: 'QR เช็คอิน',
  QR_GATE: 'QR หน้าเกต',
  QR_COUNTER: 'QR เคาน์เตอร์',
  WALK_IN: 'เดินมาสั่ง',
};

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'good';
}) {
  return (
    <div className="border-char-200 rounded-2xl border bg-white p-5">
      <p className="text-char-500 text-sm">{label}</p>
      <p
        className={`mt-1 text-3xl font-bold ${tone === 'good' ? 'text-leaf-700' : 'text-char-900'}`}
      >
        {value}
      </p>
      {hint && <p className="text-char-500 mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; date?: string }>;
}) {
  const { store: storeSlug = 'cei-domestic', date } = await searchParams;
  const report = await getDailyReport(storeSlug, date);

  if (!report) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-char-500">ไม่พบร้าน</p>
      </main>
    );
  }

  const peakHour = report.byHour.reduce(
    (best, h) => (h.orders > (best?.orders ?? 0) ? h : best),
    report.byHour[0],
  );

  const maxHourOrders = Math.max(1, ...report.byHour.map((h) => h.orders));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-char-900 text-2xl font-bold">รายงานประจำวัน</h1>
        <p className="text-char-500 mt-1 text-sm">WrapBoost CEI Domestic · {report.date}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="ยอดขาย"
          value={`฿${formatTHBPlain(report.revenue)}`}
          hint={`${report.orderCount} ออร์เดอร์`}
        />
        <Stat
          label="ยอดเฉลี่ยต่อบิล"
          value={`฿${formatTHBPlain(report.avgTicket)}`}
          hint="กรอบเป้าหมาย 150–220"
          tone={report.avgTicket >= 15000 && report.avgTicket <= 22000 ? 'good' : undefined}
        />
        <Stat
          label="เวลาประกอบเฉลี่ย"
          value={report.medianAssemblySeconds !== null ? clock(report.medianAssemblySeconds) : '—'}
          hint="ค่ามัธยฐาน จ่ายเงิน → พร้อมรับ"
          tone={
            report.medianAssemblySeconds !== null && report.medianAssemblySeconds <= 180
              ? 'good'
              : undefined
          }
        />
        <Stat
          label="ทำได้ใน 3 นาที"
          value={report.under3MinRate !== null ? `${report.under3MinRate}%` : '—'}
          hint="สัดส่วนออร์เดอร์ที่เข้าเป้า"
          tone={report.under3MinRate !== null && report.under3MinRate >= 80 ? 'good' : undefined}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border-char-200 rounded-2xl border bg-white p-5">
          <h2 className="text-char-900 mb-4 font-semibold">ออร์เดอร์ตามชั่วโมง</h2>
          {report.byHour.length === 0 ? (
            <p className="text-char-500 text-sm">ยังไม่มีข้อมูลวันนี้</p>
          ) : (
            <div className="space-y-2">
              {report.byHour.map((h) => (
                <div key={h.hour} className="flex items-center gap-3">
                  <span className="text-char-500 w-12 shrink-0 text-sm">
                    {String(h.hour).padStart(2, '0')}:00
                  </span>
                  <div className="bg-char-100 h-6 flex-1 overflow-hidden rounded">
                    <div
                      className="bg-leaf-500 h-full"
                      style={{ width: `${(h.orders / maxHourOrders) * 100}%` }}
                    />
                  </div>
                  <span className="text-char-900 w-8 shrink-0 text-right text-sm font-semibold">
                    {h.orders}
                  </span>
                </div>
              ))}
              {peakHour && (
                <p className="text-char-500 pt-2 text-xs">
                  ชั่วโมงที่ขายดีที่สุด {String(peakHour.hour).padStart(2, '0')}:00 —{' '}
                  {peakHour.orders} ออร์เดอร์
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-char-200 rounded-2xl border bg-white p-5">
          <h2 className="text-char-900 mb-4 font-semibold">จุดที่ลูกค้าสแกน QR</h2>
          {report.byChannel.length === 0 ? (
            <p className="text-char-500 text-sm">ยังไม่มีข้อมูลวันนี้</p>
          ) : (
            <div className="space-y-3">
              {report.byChannel.map((c) => (
                <div key={c.channel} className="flex items-center justify-between">
                  <span className="text-char-900 text-sm">
                    {CHANNEL_LABEL[c.channel] ?? c.channel}
                  </span>
                  <span className="text-char-900 font-semibold">{c.orders}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="border-char-200 rounded-2xl border bg-white p-5">
          <h2 className="text-char-900 mb-4 font-semibold">วัตถุดิบที่ถูกเลือกมากที่สุด</h2>
          {report.topOptions.length === 0 ? (
            <p className="text-char-500 text-sm">ยังไม่มีข้อมูลวันนี้</p>
          ) : (
            <div className="space-y-2">
              {report.topOptions.map((o) => (
                <div key={o.name} className="flex items-center justify-between">
                  <span className="text-char-900 text-sm">{o.name}</span>
                  <span className="text-char-500 text-sm">{o.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-leaf-50 rounded-2xl p-5">
          <h2 className="text-leaf-700 mb-2 font-semibold">โปรตีนที่ส่งมอบวันนี้</h2>
          <p className="text-leaf-700 text-4xl font-bold">{report.totalProtein} g</p>
          <p className="text-leaf-700 mt-3 text-sm leading-relaxed">
            รวมโปรตีนจากทุกออร์เดอร์ที่ชำระเงินแล้ว
            ตัวเลขนี้คือสิ่งที่ร้านอาหารในเทอร์มินัลรายอื่นวัดไม่ได้
          </p>
          {report.noShowCount > 0 && (
            <p className="text-char-500 mt-4 text-xs">ไม่มารับ {report.noShowCount} ออร์เดอร์</p>
          )}
        </div>
      </section>

      <p className="text-char-500 mt-10 text-center text-xs">
        ค่าโภชนาการเป็นค่าประมาณเบื้องต้น รอผลตรวจวิเคราะห์จากห้องปฏิบัติการ
      </p>
    </main>
  );
}
