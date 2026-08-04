import { Model } from "mongoose";
import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { Invoice } from "../../models/Invoice";
import { Payment } from "../../models/Payment";
import { Expense } from "../../models/Expense";
import { AppError } from "../../utils/AppError";

// Typed as a plain string-keyed map of generic Mongoose models rather than a
// union of the three concrete model types — a union of overloaded `.find()`
// signatures isn't callable as a single function, which is what TS was
// rejecting here. This node is inherently dynamic (collection picked at
// workflow-config time), so we intentionally trade static per-model typing
// for a callable, generic `Model<any>` here.
const collections: Record<string, Model<any>> = { invoice: Invoice, payment: Payment, expense: Expense };

// Lets a workflow read or update internal collections without a bespoke
// node — e.g. "update invoice status to paid" as part of an automation.
export const databaseNode: NodeExecutor = async (node, ctx) => {
  const collectionName = node.config.collection as string;
  const operation = node.config.operation as "find" | "update";
  const model = collections[collectionName];
  if (!model) throw AppError.badRequest(`Unknown database collection: ${collectionName}`);

  const filter = resolveValue(node.config.filter ?? {}, ctx) as Record<string, unknown>;

  if (operation === "update") {
    const update = resolveValue(node.config.update ?? {}, ctx) as Record<string, unknown>;
    const result = await model.updateMany(filter, { $set: update });
    return { output: { matched: result.matchedCount, modified: result.modifiedCount } };
  }

  const docs = await model.find(filter).limit(50).lean();
  return { output: { count: docs.length, docs } };
};
