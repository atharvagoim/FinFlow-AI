import { resolveValue } from "../src/workflow-engine/resolveTemplate";
import { ExecutionContext } from "../src/workflow-engine/types";

describe("resolveValue", () => {
  const ctx: ExecutionContext = {
    executionId: "e1", workflowId: "w1",
    triggerInput: { invoiceId: "INV-1", total: 118000 },
    data: { n2: { verified: true } },
  };

  it("resolves trigger references", () => {
    expect(resolveValue("Invoice {{trigger.invoiceId}} totalling {{trigger.total}}", ctx)).toBe("Invoice INV-1 totalling 118000");
  });

  it("resolves node output references", () => {
    expect(resolveValue("{{n2.verified}}", ctx)).toBe("true");
  });

  it("resolves nested objects recursively", () => {
    expect(resolveValue({ to: "{{trigger.invoiceId}}", nested: ["{{trigger.total}}"] }, ctx)).toEqual({
      to: "INV-1",
      nested: ["118000"],
    });
  });
});
