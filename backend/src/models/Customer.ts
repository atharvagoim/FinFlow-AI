import { Schema, model, Document, Types } from "mongoose";

export interface ICustomer extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  billingAddress?: string;
  gstin?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: String,
    company: String,
    billingAddress: String,
    gstin: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Customer = model<ICustomer>("Customer", customerSchema);
