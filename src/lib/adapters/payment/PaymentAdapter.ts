export interface PaymentIntent {
  provider: string;
  amount: number;
  qrPayload: string;
  reference: string;
}

export interface PaymentAdapter {
  readonly name: string;
  createIntent(amount: number, reference: string): Promise<PaymentIntent>;
}
