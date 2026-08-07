'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const FINAL = ['COLLECTED', 'CANCELLED', 'EXPIRED', 'NO_SHOW', 'REFUNDED'];

/**
 * Polls for status changes and refreshes the server component when one lands.
 * Polling beats websockets here: it survives flaky airport wifi and needs no
 * extra RLS policy on the orders table.
 */
export function StatusWatcher({
  code,
  token,
  currentStatus,
}: {
  code: string;
  token: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const known = useRef(currentStatus);

  useEffect(() => {
    known.current = currentStatus;
  }, [currentStatus]);

  useEffect(() => {
    if (FINAL.includes(currentStatus)) return;

    const check = async () => {
      try {
        const res = await fetch(`/api/orders/${code}?t=${token}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status && data.status !== known.current) {
          known.current = data.status;
          router.refresh();
        }
      } catch {
        // A dropped poll is fine; the next tick will catch up.
      }
    };

    const timer = setInterval(check, 5000);
    return () => clearInterval(timer);
  }, [code, token, currentStatus, router]);

  return null;
}
