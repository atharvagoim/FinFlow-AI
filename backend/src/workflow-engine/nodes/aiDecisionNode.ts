import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { getAIDecision } from "../../ai/aiService";

// Lets AI make an intelligent decision mid-workflow (e.g. "should this
// invoice be auto-approved?"). config.prompt is template-resolved with
// context, config.options is an optional list constraining the answer.
export const aiDecisionNode: NodeExecutor = async (node, ctx) => {
  const prompt = resolveValue(node.config.prompt ?? "", ctx) as string;
  const options = (node.config.options as string[]) ?? undefined;

  const decision = await getAIDecision(prompt, options);
  return { output: decision, branch: decision.decision === "true" || decision.decision === "yes" ? "true" : "false" };
};
