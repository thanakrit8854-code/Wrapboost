import 'server-only';

import { getPaymentAdapter } from '@/lib/adapters/payment/MockPromptPayAdapter';
import { createAdminClient } from '@/lib/supabase/admin';

export interface PaymentView {
  orderCode: string;
  amount: number;
  qrPayload: string;
  status: string;
  expiresAt: string;
}

const PAYMENT_WINDOW_MS = 10 * 60 * 1000;

/** Creates (or reuses) the pending payment for an order and returns its QR. */
export async function getOrCreatePayment(code: string, token: string): Promise<PaymentView | null> {
  const db = createAdminClient();

  const { data: order } = await db
    .from('orders')
    .select('id, order_code, status, total, created_at')
    .eq('order_code', code)
    .eq('access_token', token)
    .maybeSingle();

  if (!order) return null;

  const { data: existing } = await db
    .from('payments')
    .select('id, qr_payload, status')
    .eq('order_id', order.id)
    .eq('status', 'PENDING')
    .maybeSingle();

  let qrPayload = existing?.qr_payload ?? null;

  if (!qrPayload) {
    const adapter = getPaymentAdapter();
    const intent = await adapter.createIntent(order.total, order.order_code);
    qrPayload = intent.qrPayload;

    await db.from('payments').insert({
      order_id: order.id,
      provider: intent.provider,
      amount: order.total,
      status: 'PENDING',
      qr_payload: intent.qrPayload,
      provider_ref: intent.reference,
      idempotency_key: `${order.id}:pending`,
    });
  }

  return {
    orderCode: order.order_code,
    amount: order.total,
    qrPayload,
    status: order.status,
    expiresAt: new Date(new Date(order.created_at).getTime() + PAYMENT_WINDOW_MS).toISOString(),
  };
}

/** Simulated settlement. A real gateway would call this from a signed webhook. */
export async function confirmPayment(
  code: string,
  token: string,
): Promise<{ ok: boolean; message?: string }> {
  const db = createAdminClient();

  const { data: order } = await db
    .from('orders')
    .select('id, status')
    .eq('order_code', code)
    .eq('access_token', token)
    .maybeSingle();

  if (!order) return { ok: false, message: 'ไม่พบออร์เดอร์' };

  if (order.status !== 'PENDING_PAYMENT') {
    return { ok: false, message: 'ออร์เดอร์นี้ชำระแล้วหรือถูกยกเลิกไปแล้ว' };
  }

  const now = new Date().toISOString();

  await db
    .from('payments')
    .update({ status: 'SUCCEEDED', paid_at: now })
    .eq('order_id', order.id)
    .eq('status', 'PENDING');

  await db.from('orders').update({ status: 'QUEUED', paid_at: now }).eq('id', order.id);

  await db.from('order_events').insert([
    { order_id: order.id, from_status: 'PENDING_PAYMENT', to_status: 'PAID', actor: 'SYSTEM' },
    { order_id: order.id, from_status: 'PAID', to_status: 'QUEUED', actor: 'SYSTEM' },
  ]);

  return { ok: true };
}
