import type { Order } from "@/types";
export type PaymentResult = { success: boolean; reference: string };
/**
 * Mock payment boundary.
 *
 * TODO(Paystack): Replace the delay below with a call to the store backend:
 *   POST /api/payments/paystack  { order, callbackUrl }
 * The backend should create a pending order and initialise a Paystack
 * transaction with: amount (pesewas), email, currency "GHS",
 * reference, callback_url, and metadata (customer phone, delivery details).
 * Then either open Paystack Inline with the returned access_code, or redirect
 * to authorization_url. Verify the transaction server-side via webhook or
 * GET /transaction/verify/:reference before confirming the order here.
 *
 * The `order` payload includes everything the integration needs:
 * line items (productId, variant, quantity, unit price), subtotal,
 * delivery fee, total, customer contact and delivery/pickup details.
 */
export async function initiatePayment(order: Order): Promise<PaymentResult> {
  void order;
  await new Promise(resolve => setTimeout(resolve, 1100));
  return { success: true, reference: `CC-${Date.now().toString(36).toUpperCase()}` };
}
