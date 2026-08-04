import { NodeExecutor } from "../types";

// Trigger nodes don't "do" anything at execution time — they represent the
// entry point. The engine starts traversal here; we just echo the input.
export const triggerNode: NodeExecutor = async (_node, ctx) => {
  return { output: ctx.triggerInput };
};
