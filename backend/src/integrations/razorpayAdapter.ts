import { env } from "../config/env";
import { logger } from "../utils/logger";

// Same pattern as the Stripe adapter, for Razorpay (common for Indian GST-
// registered businesses). Mock branch keeps the platform runnable without keys.
export async function createRazorpayOrder(amount: number, currency: string) {
  if (!env.integrations.razorpayKeyId) {
    logger.info(`[razorpayAdapter] Simulated order: ${amount} ${currency}`);
    return { id: `sim_rzp_${Date.now()}`, status: "succeeded" as const };
  }
  throw new Error("Real Razorpay integration not wired up in this environment");
}
