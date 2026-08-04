import { Payment } from "../models/Payment";
import { Invoice } from "../models/Invoice";
import { AppError } from "../utils/AppError";
import { createStripeCharge, refundStripeCharge } from "../integrations/stripeAdapter";
import { createRazorpayOrder } from "../integrations/razorpayAdapter";

export async function initiatePayment(invoiceId: string, provider: "stripe" | "razorpay" | "manual", source?: string) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw AppError.notFound("Invoice not found");

  let providerRef: string | undefined;
  let status: "pending" | "succeeded" = "pending";

  if (provider === "stripe") {
    const charge = await createStripeCharge(invoice.total, invoice.currency, source || "tok_visa");
    providerRef = charge.id;
    status = charge.status === "succeeded" ? "succeeded" : "pending";
  } else if (provider === "razorpay") {
    const order = await createRazorpayOrder(invoice.total, invoice.currency);
    providerRef = order.id;
    status = order.status === "succeeded" ? "succeeded" : "pending";
  } else {
    status = "succeeded"; // manual/offline payment recorded directly
  }

  const payment = await Payment.create({
    invoice: invoice._id,
    provider,
    providerRef,
    amount: invoice.total,
    currency: invoice.currency,
    status,
    paidAt: status === "succeeded" ? new Date() : undefined,
  });

  if (status === "succeeded") {
    invoice.status = "paid";
    await invoice.save();
  }

  return payment;
}

export async function listPayments(filter: Record<string, unknown> = {}) {
  return Payment.find(filter).populate("invoice", "invoiceNumber total status").sort({ createdAt: -1 });
}

export async function getPayment(id: string) {
  const payment = await Payment.findById(id).populate("invoice");
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
}

export async function refundPayment(id: string, amount?: number) {
  const payment = await getPayment(id);
  if (payment.status !== "succeeded") throw AppError.badRequest("Only succeeded payments can be refunded");

  if (payment.provider === "stripe" && payment.providerRef) {
    await refundStripeCharge(payment.providerRef, amount);
  }

  const refundAmount = amount ?? payment.amount;
  payment.refundedAmount += refundAmount;
  payment.status = payment.refundedAmount >= payment.amount ? "refunded" : "partially_refunded";
  await payment.save();
  return payment;
}
