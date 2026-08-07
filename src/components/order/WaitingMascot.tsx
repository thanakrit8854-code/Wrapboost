'use client';

type Mood = 'waiting' | 'queued' | 'cooking' | 'ready' | 'collected';

const MOOD_BY_STATUS: Record<string, Mood> = {
  PENDING_PAYMENT: 'waiting',
  PAID: 'queued',
  QUEUED: 'queued',
  PREPARING: 'cooking',
  READY: 'ready',
  COLLECTED: 'collected',
};

const CAPTION: Record<Mood, string> = {
  waiting: 'รออยู่นะ สแกนจ่ายได้เลย',
  queued: 'ได้รับออร์เดอร์แล้ว รอคิวแป๊บนึง',
  cooking: 'กำลังม้วนแรปให้อยู่',
  ready: 'เสร็จแล้ว มารับได้เลย',
  collected: 'ขอบคุณที่อุดหนุน เดินทางปลอดภัยนะ',
};

/**
 * A small hand-drawn mascot. Pure SVG so it stays sharp, loads instantly,
 * and can change posture with the order status instead of looping one clip.
 */
export function WaitingMascot({ status }: { status: string }) {
  const mood = MOOD_BY_STATUS[status];
  if (!mood) return null;

  return (
    <figure className="wb-lift flex flex-col items-center gap-3 py-2">
      <svg viewBox="0 0 200 180" className="h-40 w-auto" role="img" aria-label={CAPTION[mood]}>
        {/* soft ground shadow */}
        <ellipse
          cx="100"
          cy="158"
          rx="40"
          ry="7"
          className={`fill-char-200 ${
            mood === 'ready'
              ? 'mascot-shadow-hop'
              : mood === 'collected'
                ? 'mascot-shadow-bow'
                : 'mascot-shadow'
          }`}
          opacity="0.5"
        />

        {mood === 'cooking' && (
          <g className="mascot-steam">
            <path
              d="M78 46c0-8 8-8 8-16s-8-8-8-16"
              className="stroke-char-200"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M100 40c0-8 8-8 8-16s-8-8-8-16"
              className="stroke-char-200"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              style={{ animationDelay: '0.4s' }}
            />
            <path
              d="M122 46c0-8 8-8 8-16s-8-8-8-16"
              className="stroke-char-200"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              style={{ animationDelay: '0.8s' }}
            />
          </g>
        )}

        {mood === 'collected' && (
          <g className="mascot-heart">
            <path
              d="M60 60c0-5 7-6 8-1 1-5 8-4 8 1 0 6-8 11-8 11s-8-5-8-11z"
              className="fill-red-300"
            />
            <path
              d="M132 52c0-4 5.5-4.8 6.4-0.8 0.8-4 6.4-3.2 6.4 0.8 0 4.8-6.4 8.8-6.4 8.8s-6.4-4-6.4-8.8z"
              className="fill-leaf-300"
              style={{ animationDelay: '0.9s' }}
            />
            <path
              d="M100 34c0-3.5 4.8-4.2 5.6-0.7 0.7-3.5 5.6-2.8 5.6 0.7 0 4.2-5.6 7.7-5.6 7.7s-5.6-3.5-5.6-7.7z"
              className="fill-red-300"
              style={{ animationDelay: '1.7s' }}
            />
          </g>
        )}

        {mood === 'ready' && (
          <g className="mascot-sparkle">
            <path d="M46 44l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" className="fill-leaf-500" />
            <path
              d="M156 54l2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5z"
              className="fill-leaf-300"
              style={{ animationDelay: '0.3s' }}
            />
            <path
              d="M150 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
              className="fill-leaf-500"
              style={{ animationDelay: '0.6s' }}
            />
          </g>
        )}

        {/* body group: the whole mascot moves as one */}
        <g className={`mascot-body mascot-${mood}`}>
          {/* wrap body */}
          <path
            d="M70 62h60c6 0 10 5 9 11l-8 62c-1 6-5 10-11 10H80c-6 0-10-4-11-10l-8-62c-1-6 3-11 9-11z"
            className="fill-amber-100"
          />
          {/* wrap fold lines */}
          <path
            d="M74 82h52M76 100h48M78 118h44"
            className="stroke-amber-200"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* green filling peeking out the top */}
          <path d="M68 62c8-9 20-13 32-13s24 4 32 13z" className="fill-leaf-500" />
          <circle cx="86" cy="55" r="4" className="fill-leaf-300" />
          <circle cx="100" cy="52" r="4.5" className="fill-leaf-300" />
          <circle cx="114" cy="55" r="4" className="fill-leaf-300" />

          {/* face */}
          <g className="mascot-face">
            <ellipse cx="86" cy="90" rx="4" ry="5" className="fill-char-900 mascot-blink" />
            <ellipse cx="114" cy="90" rx="4" ry="5" className="fill-char-900 mascot-blink" />
            {mood === 'collected' ? (
              <path
                d="M86 106q14 14 28 0"
                className="stroke-char-900"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : mood === 'ready' ? (
              <path
                d="M88 104q12 12 24 0"
                className="stroke-char-900"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M90 104q10 7 20 0"
                className="stroke-char-900"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
            <circle cx="74" cy="98" r="5" className="fill-red-300" opacity="0.55" />
            <circle cx="126" cy="98" r="5" className="fill-red-300" opacity="0.55" />
          </g>

          {/* arms */}
          {mood === 'cooking' ? (
            <g className="mascot-stir">
              <path
                d="M132 96q20 4 24 18"
                className="stroke-amber-200"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <rect x="148" y="108" width="26" height="7" rx="3.5" className="fill-char-500" />
            </g>
          ) : mood === 'waiting' ? (
            <path
              d="M132 96q18 -6 22 -18"
              className="mascot-wave stroke-amber-200"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M132 96q16 6 18 16"
              className="stroke-amber-200"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          )}
          <path
            d="M68 96q-16 6 -18 16"
            className="stroke-amber-200"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>

      <figcaption className="text-char-500 text-sm">{CAPTION[mood]}</figcaption>
    </figure>
  );
}
