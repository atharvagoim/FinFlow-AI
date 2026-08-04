import { Schema, model, Document, Types } from "mongoose";

// Refresh tokens are stored (hashed value not required here since they're
// opaque JWTs already signed server-side) so they can be revoked individually
// on logout, and rotated on every refresh to limit replay-attack windows.
export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdByIp?: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    createdByIp: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);
