import { NodeType } from "../models/Workflow";
import { NodeExecutor } from "./types";
import { triggerNode } from "./nodes/triggerNode";
import { actionNode } from "./nodes/actionNode";
import { conditionNode } from "./nodes/conditionNode";
import { webhookNode } from "./nodes/webhookNode";
import { delayNode } from "./nodes/delayNode";
import { loopNode } from "./nodes/loopNode";
import { apiRequestNode } from "./nodes/apiRequestNode";
import { databaseNode } from "./nodes/databaseNode";
import { aiDecisionNode } from "./nodes/aiDecisionNode";
import { emailNode } from "./nodes/emailNode";
import { slackNode } from "./nodes/slackNode";
import { whatsappNode } from "./nodes/whatsappNode";
import { invoiceNode } from "./nodes/invoiceNode";
import { paymentNode } from "./nodes/paymentNode";
import { approvalNode } from "./nodes/approvalNode";

// Central lookup table mapping each node type from the visual builder to its
// executor implementation. Adding a new node type = write an executor +
// register it here + add it to the frontend palette. Nothing else changes.
export const nodeRegistry: Record<NodeType, NodeExecutor> = {
  trigger: triggerNode,
  action: actionNode,
  condition: conditionNode,
  webhook: webhookNode,
  delay: delayNode,
  loop: loopNode,
  api_request: apiRequestNode,
  database: databaseNode,
  ai_decision: aiDecisionNode,
  email: emailNode,
  slack: slackNode,
  whatsapp: whatsappNode,
  invoice: invoiceNode,
  payment: paymentNode,
  approval: approvalNode,
};
