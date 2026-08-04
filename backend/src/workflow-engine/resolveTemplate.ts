import { ExecutionContext } from "./types";

// Very small template resolver: replaces {{trigger.field}} or
// {{nodeId.field}} references inside strings/objects with values from the
// execution context. Keeps node config human-readable in the builder UI
// while still allowing data to flow between steps.
export function resolveValue(value: unknown, ctx: ExecutionContext): unknown {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
      const [root, ...rest] = path.split(".");
      const source = root === "trigger" ? ctx.triggerInput : ctx.data[root];
      const resolved = rest.reduce<unknown>((acc, key) => {
        if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
        return undefined;
      }, source);
      return resolved === undefined ? "" : String(resolved);
    });
  }
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, ctx));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveValue(v, ctx)]));
  }
  return value;
}
