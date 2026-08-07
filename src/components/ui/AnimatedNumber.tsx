'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts toward a new value instead of snapping to it, so a customer sees
 * the protein number climb as they add chicken. Short enough not to lag.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  className = '',
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = from.current;
    const delta = value - start;

    if (delta === 0) return;

    const startedAt = performance.now();
    const duration = 320;

    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + delta * eased);

      if (t < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        from.current = value;
      }
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      from.current = value;
    };
  }, [value]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}
