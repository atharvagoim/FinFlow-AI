import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";

type Operator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains";

function evaluate(field: unknown, operator: Operator, value: unknown): boolean {
  switch (operator) {
    case "equals": return field == value;
    case "not_equals": return field != value;
    case "greater_than": return Number(field) > Number(value);
    case "less_than": return Number(field) < Number(value);
    case "contains": return String(field).includes(String(value));
    default: return false;
  }
}

// Branches the workflow. config: { field: "trigger.amount", operator, value }.
// Result.branch is "true" or "false" and must match an edge's sourceHandle.
export const conditionNode: NodeExecutor = async (node, ctx) => {
  const field = resolveValue(node.config.field ?? "", ctx);
  const operator = (node.config.operator as Operator) ?? "equals";
  const value = node.config.value;
  const result = evaluate(field, operator, value);
  return { output: { field, operator, value, result }, branch: result ? "true" : "false" };
};
