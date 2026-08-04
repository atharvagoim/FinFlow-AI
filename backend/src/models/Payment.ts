import { Schema, model, Document, Types } from "mongoose";

export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded" | "partially_refunded";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  invoice: Types.ObjectId;
  provider: "stripe" | "razorpay" | "manual";
  providerRef?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  refundedAmount: number;
  method?: string;
  paidAt?: Date;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    provider: { type: String, enum: ["stripe", "razorpay", "manual"], default: "manual" },
    providerRef: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    refundedAmount: { type: Number, default: 0 },
    method: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
