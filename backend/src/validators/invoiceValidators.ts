import { z } from "zod";

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(0),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    customer: z.string().min(1),
    items: z.array(itemSchema).min(1),
    dueDate: z.string(),
    currency: z.string().default("INR"),
    notes: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
