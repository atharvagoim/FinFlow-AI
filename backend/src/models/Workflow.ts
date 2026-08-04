import { Schema, model, Document, Types } from "mongoose";

export type NodeType =
  | "trigger"
  | "action"
  | "condition"
  | "webhook"
  | "delay"
  | "loop"
  | "api_request"
  | "database"
  | "ai_decision"
  | "email"
  | "slack"
  | "whatsapp"
  | "invoice"
  | "payment"
  | "approval";

export interface IWorkflowNode {
  id: string; // React Flow node id (uuid)
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // e.g. "true" / "false" for condition nodes
  label?: string;
}

export interface IWorkflow extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  owner: Types.ObjectId;
  status: "draft" | "active" | "paused" | "archived";
  triggerType: "manual" | "event" | "webhook" | "schedule";
  triggerConfig: Record<string, unknown>;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  version: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const nodeSchema = new Schema<IWorkflowNode>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "trigger", "action", "condition", "webhook", "delay", "loop",
        "api_request", "database", "ai_decision", "email", "slack",
        "whatsapp", "invoice", "payment", "approval",
      ],
    },
    label: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const edgeSchema = new Schema<IWorkflowEdge>(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: { type: String },
    label: { type: String },
  },
  { _id: false }
);

const workflowSchema = new Schema<IWorkflow>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["draft", "active", "paused", "archived"], default: "draft" },
    triggerType: { type: String, enum: ["manual", "event", "webhook", "schedule"], default: "manual" },
    triggerConfig: { type: Schema.Types.Mixed, default: {} },
    nodes: { type: [nodeSchema], default: [] },
    edges: { type: [edgeSchema], default: [] },
    version: { type: Number, default: 1 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Workflow = model<IWorkflow>("Workflow", workflowSchema);
