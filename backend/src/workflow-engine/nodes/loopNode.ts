import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";

// Loop nodes iterate config.items (or a template reference resolving to an
// array) and expose the collection as this node's output; the engine's
// executor handles actually re-running the loop's downstream branch per item.
export const loopNode: NodeExecutor = async (node, ctx) => {
  const raw = node.config.items ?? [];
  const resolved = Array.isArray(raw) ? raw.map((i) => resolveValue(i, ctx)) : resolveValue(raw, ctx);
  const items = Array.isArray(resolved) ? resolved : [];
  return { output: { items, count: items.length } };
};
