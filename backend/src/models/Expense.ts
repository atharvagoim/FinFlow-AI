import { Schema, model, Document, Types } from "mongoose";

export type ExpenseStatus = "submitted" | "pending_approval" | "approved" | "rejected" | "reimbursed";

export interface IExpense extends Document {
  _id: Types.ObjectId;
  employee: Types.ObjectId;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  receiptUrl?: string;
  ocrExtractedText?: string;
  status: ExpenseStatus;
  aiCategory?: string;
  aiFraudScore?: number;
  approvedBy?: Types.ObjectId;
  incurredAt: Date;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    description: String,
    receiptUrl: String,
    ocrExtractedText: String,
    status: {
      type: String,
      enum: ["submitted", "pending_approval", "approved", "rejected", "reimbursed"],
      default: "submitted",
    },
    aiCategory: String,
    aiFraudScore: Number,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    incurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Expense = model<IExpense>("Expense", expenseSchema);
