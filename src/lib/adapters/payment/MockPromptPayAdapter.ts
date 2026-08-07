import 'server-only';

import generatePayload from 'promptpay-qr';

import type { PaymentAdapter, PaymentIntent } from './PaymentAdapter';

/**
 * Builds a genuine Thai QR payload so the code scans in a real banking app,
 * but no bank is contacted: settlement is simulated by an explicit button.
 * Swap this class for a gateway adapter and nothing else in the app changes.
 */
export class MockPromptPayAdapter implements PaymentAdapter {
  readonly name = 'MOCK_PROMPTPAY';

  constructor(private readonly promptPayId: string) {}

  async createIntent(amount: number, reference: string): Promise<PaymentIntent> {
    const baht = amount / 100;
    const qrPayload = generatePayload(this.promptPayId, { amount: baht });

    return {
      provider: this.name,
      amount,
      qrPayload,
      reference,
    };
  }
}

export function getPaymentAdapter(): PaymentAdapter {
  const id = process.env.PROMPTPAY_ID ?? '0000000000';
  return new MockPromptPayAdapter(id);
}
