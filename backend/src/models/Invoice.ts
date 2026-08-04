import { Schema, model, Document, Types } from "mongoose";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percent, e.g. 18 for GST 18%
  amount: number; // quantity * unitPrice
}

export type InvoiceStatus = "draft" | "pending_approval" | "approved" | "sent" | "paid" | "overdue" | "cancelled";

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  customer: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date;
  issueDate: Date;
  notes?: string;
  pdfUrl?: string;
  approvedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0 },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
      index: true,
    },
    dueDate: { type: Date, required: true },
    issueDate: { type: Date, default: Date.now },
    notes: String,
    pdfUrl: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    aiSummary: String,
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);
