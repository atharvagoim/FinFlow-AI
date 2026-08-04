import { conditionNode } from "../src/workflow-engine/nodes/conditionNode";
import { ExecutionContext } from "../src/workflow-engine/types";
import { IWorkflowNode } from "../src/models/Workflow";

function buildCtx(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return { executionId: "exec1", workflowId: "wf1", triggerInput: { amount: 75000 }, data: {}, ...overrides };
}

describe("conditionNode", () => {
  it("branches true when the condition passes", async () => {
    const node: IWorkflowNode = {
      id: "n1", type: "condition", label: "Amount check", position: { x: 0, y: 0 },
      config: { field: "{{trigger.amount}}", operator: "greater_than", value: 50000 },
    };
    const result = await conditionNode(node, buildCtx());
    expect(result.branch).toBe("true");
  });

  it("branches false when the condition fails", async () => {
    const node: IWorkflowNode = {
      id: "n1", type: "condition", label: "Amount check", position: { x: 0, y: 0 },
      config: { field: "{{trigger.amount}}", operator: "greater_than", value: 100000 },
    };
    const result = await conditionNode(node, buildCtx());
    expect(result.branch).toBe("false");
  });
});
