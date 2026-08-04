import { z } from "zod";

const nodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "trigger", "action", "condition", "webhook", "delay", "loop",
    "api_request", "database", "ai_decision", "email", "slack",
    "whatsapp", "invoice", "payment", "approval",
  ]),
  label: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.record(z.any()).default({}),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  label: z.string().optional(),
});

export const saveWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["draft", "active", "paused", "archived"]).optional(),
    triggerType: z.enum(["manual", "event", "webhook", "schedule"]).optional(),
    triggerConfig: z.record(z.any()).optional(),
    nodes: z.array(nodeSchema).default([]),
    edges: z.array(edgeSchema).default([]),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const generateWorkflowSchema = z.object({
  body: z.object({ prompt: z.string().min(5) }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const triggerWorkflowSchema = z.object({
  body: z.object({ input: z.record(z.any()).default({}) }),
  params: z.object({ id: z.string() }),
  query: z.object({}).optional(),
});
