import { Schema, model, Document, Types } from "mongoose";

export interface INodeLog {
  nodeId: string;
  nodeType: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  retries: number;
}

export interface IWorkflowExecution extends Document {
  _id: Types.ObjectId;
  workflow: Types.ObjectId;
  triggeredBy: "manual" | "event" | "webhook" | "schedule";
  status: "queued" | "running" | "success" | "failed" | "partial";
  input: Record<string, unknown>;
  context: Record<string, unknown>;
  nodeLogs: INodeLog[];
  startedAt?: Date;
  finishedAt?: Date;
  durationMs?: number;
  error?: string;
  createdAt: Date;
}

const nodeLogSchema = new Schema<INodeLog>(
  {
    nodeId: String,
    nodeType: String,
    status: { type: String, enum: ["pending", "running", "success", "failed", "skipped"] },
    input: Schema.Types.Mixed,
    output: Schema.Types.Mixed,
    error: String,
    startedAt: Date,
    finishedAt: Date,
    retries: { type: Number, default: 0 },
  },
  { _id: false }
);

const executionSchema = new Schema<IWorkflowExecution>(
  {
    workflow: { type: Schema.Types.ObjectId, ref: "Workflow", required: true, index: true },
    triggeredBy: { type: String, enum: ["manual", "event", "webhook", "schedule"], default: "manual" },
    status: { type: String, enum: ["queued", "running", "success", "failed", "partial"], default: "queued" },
    input: { type: Schema.Types.Mixed, default: {} },
    context: { type: Schema.Types.Mixed, default: {} },
    nodeLogs: { type: [nodeLogSchema], default: [] },
    startedAt: Date,
    finishedAt: Date,
    durationMs: Number,
    error: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const WorkflowExecution = model<IWorkflowExecution>("WorkflowExecution", executionSchema);
