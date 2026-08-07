type Motion = 'breathe' | 'sizzle' | 'land' | 'none';

interface StatusConfig {
  text: string;
  tone: string;
  motion: Motion;
}

const CONFIG: Record<string, StatusConfig> = {
  PENDING_PAYMENT: { text: 'รอชำระเงิน', tone: 'bg-amber-50 text-amber-800', motion: 'breathe' },
  PAID: { text: 'ชำระแล้ว รอคิว', tone: 'bg-leaf-50 text-leaf-700', motion: 'breathe' },
  QUEUED: { text: 'อยู่ในคิว', tone: 'bg-leaf-50 text-leaf-700', motion: 'breathe' },
  PREPARING: { text: 'กำลังทำ', tone: 'bg-white text-leaf-700', motion: 'sizzle' },
  READY: { text: 'พร้อมรับแล้ว', tone: 'bg-white text-leaf-700', motion: 'land' },
  COLLECTED: { text: 'รับแล้ว', tone: 'bg-char-200 text-char-800', motion: 'none' },
  CANCELLED: { text: 'ยกเลิกแล้ว', tone: 'bg-red-50 text-red-700', motion: 'none' },
  EXPIRED: { text: 'หมดอายุ', tone: 'bg-red-50 text-red-700', motion: 'none' },
  NO_SHOW: { text: 'ไม่ได้มารับ', tone: 'bg-red-50 text-red-700', motion: 'none' },
};

function Dots() {
  return (
    <span className="flex items-end gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-leaf-500 wb-sizzle block h-2 w-1.5 rounded-full"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: StatusConfig = CONFIG[status] ?? {
    text: status,
    tone: 'bg-char-200 text-char-800',
    motion: 'none',
  };

  if (config.motion === 'sizzle') {
    return (
      <div className="relative inline-block">
        <span
          className={`wb-land relative z-10 inline-flex items-center gap-2.5 overflow-hidden rounded-full px-5 py-2 text-sm font-semibold shadow-sm ${config.tone}`}
        >
          <Dots />
          {config.text}
          <span className="pointer-events-none absolute inset-0">
            <span className="wb-sweep block h-full w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </span>
        </span>
      </div>
    );
  }

  if (config.motion === 'land') {
    return (
      <div className="relative inline-block">
        <span className="bg-leaf-300 wb-halo absolute inset-0 rounded-full" />
        <span
          className={`wb-land relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold shadow-sm ${config.tone}`}
        >
          <span className="bg-leaf-500 inline-block h-2 w-2 rounded-full" />
          {config.text}
        </span>
      </div>
    );
  }

  if (config.motion === 'breathe') {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${config.tone}`}
      >
        <span className="wb-breathe inline-block h-2 w-2 rounded-full bg-current" />
        {config.text}
      </span>
    );
  }

  return (
    <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${config.tone}`}>
      {config.text}
    </span>
  );
}
