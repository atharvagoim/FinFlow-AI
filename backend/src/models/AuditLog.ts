import { Schema, model, Document, Types } from "mongoose";

// Immutable audit trail for compliance: who did what, to which resource, when.
export interface IAuditLog extends Document {
  actor: Types.ObjectId;
  action: string; // e.g. "invoice.approve", "workflow.execute"
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: String,
    metadata: Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
