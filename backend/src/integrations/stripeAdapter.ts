import { env } from "../config/env";
import { logger } from "../utils/logger";

// Thin adapter over Stripe. Falls back to a simulated success response when
// no API key is configured, so the payment flow is fully demoable without
// real credentials. Swap the mock branch for the real `stripe` SDK call in
// production and the rest of the app (Payment model, controllers) is unchanged.
export async function createStripeCharge(amount: number, currency: string, source: string) {
  if (!env.integrations.stripeSecretKey) {
    logger.info(`[stripeAdapter] Simulated charge: ${amount} ${currency}`);
    return { id: `sim_stripe_${Date.now()}`, status: "succeeded" as const };
  }
  // const stripe = new Stripe(env.integrations.stripeSecretKey);
  // const charge = await stripe.charges.create({ amount: amount * 100, currency, source });
  // return { id: charge.id, status: charge.status };
  throw new Error("Real Stripe integration not wired up in this environment");
}

export async function refundStripeCharge(chargeId: string, amount?: number) {
  if (!env.integrations.stripeSecretKey) {
    logger.info(`[stripeAdapter] Simulated refund for ${chargeId}`);
    return { id: `sim_refund_${Date.now()}`, status: "succeeded" as const, amount };
  }
  throw new Error("Real Stripe integration not wired up in this environment");
}
