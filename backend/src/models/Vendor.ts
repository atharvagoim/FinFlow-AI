import { Schema, model, Document, Types } from "mongoose";

export interface IVendor extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  bankDetails?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    category: String,
    bankDetails: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Vendor = model<IVendor>("Vendor", vendorSchema);
