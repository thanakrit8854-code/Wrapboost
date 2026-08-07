'use client';

import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';

import { formatTHBPlain } from '@/lib/money';

interface PaymentData {
  orderCode: string;
  amount: number;
  qrPayload: string;
  status: string;
  expiresAt: string;
}

export function PayClient({ code, token }: { code: string; token: string }) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/payments/${code}?t=${token}`)
      .then((r) => r.json())
      .then(async (data: PaymentData) => {
        setPayment(data);
        const image = await QRCode.toDataURL(data.qrPayload, { width: 640, margin: 1 });
        setQrImage(image);
      })
      .catch(() => setError('โหลดข้อมูลการชำระเงินไม่สำเร็จ'));
  }, [code, token]);

  useEffect(() => {
    if (!payment) return;

    const tick = () => {
      const remaining = Math.floor((new Date(payment.expiresAt).getTime() - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, remaining));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [payment]);

  const confirm = useCallback(async () => {
    if (confirming) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await fetch(`/api/payments/${code}?t=${token}`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? 'ยืนยันการชำระเงินไม่สำเร็จ');
        return;
      }

      router.push(`/order/${code}?t=${token}`);
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ');
    } finally {
      setConfirming(false);
    }
  }, [code, token, confirming, router]);

  if (error && !payment) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-6">
        <p className="text-char-500 text-center">{error}</p>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-6">
        <p className="text-char-500">กำลังโหลด…</p>
      </main>
    );
  }

  const expired = secondsLeft === 0;
  const minutes = Math.floor((secondsLeft ?? 0) / 60);
  const seconds = (secondsLeft ?? 0) % 60;

  return (
    <main className="mx-auto min-h-dvh max-w-md pb-40">
      <header className="bg-leaf-700 px-6 pt-14 pb-10 text-center text-white">
        <p className="text-leaf-100 text-xs tracking-[0.2em] uppercase">ชำระเงิน</p>
        <p className="mt-3 text-4xl font-bold">฿{formatTHBPlain(payment.amount)}</p>
        <p className="text-leaf-100 mt-2 text-sm">ออร์เดอร์ {payment.orderCode}</p>
      </header>

      <section className="-mt-6 px-4">
        <div className="border-char-200 rounded-2xl border bg-white p-6 text-center">
          {qrImage && !expired ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImage} alt="QR พร้อมเพย์" className="mx-auto w-full max-w-[260px]" />
              <p className="text-char-500 mt-4 text-sm">สแกนด้วยแอปธนาคารเพื่อชำระเงิน</p>
            </>
          ) : (
            <p className="text-char-500 py-16">QR หมดอายุแล้ว</p>
          )}

          {secondsLeft !== null && !expired && (
            <p className="text-char-900 mt-4 text-lg font-semibold">
              เหลือเวลา {minutes}:{String(seconds).padStart(2, '0')}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>โหมดทดสอบ</strong> — QR นี้เป็นรูปแบบพร้อมเพย์จริง
            แต่ระบบยังไม่ได้เชื่อมกับธนาคาร กดปุ่มด้านล่างเพื่อจำลองว่าชำระเงินสำเร็จ
          </p>
        </div>
      </section>

      {error && (
        <p className="mx-4 mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="border-char-200 fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-4">
          <button
            type="button"
            disabled={confirming || expired}
            onClick={confirm}
            className="bg-leaf-600 active:bg-leaf-700 disabled:bg-char-200 disabled:text-char-500 w-full rounded-xl px-6 py-4 text-base font-semibold text-white transition-colors"
          >
            {confirming ? 'กำลังยืนยัน…' : expired ? 'หมดเวลาชำระเงิน' : 'ยืนยันชำระเงิน (จำลอง)'}
          </button>
        </div>
      </div>
    </main>
  );
}
