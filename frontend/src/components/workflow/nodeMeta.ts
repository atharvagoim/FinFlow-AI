import {
  Zap, PlayCircle, GitFork, Webhook, Clock, Repeat, Globe, Database,
  BrainCircuit, Mail, Slack, MessageCircle, FileText, CreditCard, ShieldCheck,
} from "lucide-react";
import { NodeType } from "../../services/workflowService";

export const nodeMeta: Record<NodeType, { label: string; icon: typeof Zap; color: string; description: string }> = {
  trigger: { label: "Trigger", icon: Zap, color: "#6366f1", description: "Starts the workflow" },
  action: { label: "Action", icon: PlayCircle, color: "#8b5cf6", description: "Generic action step" },
  condition: { label: "Condition", icon: GitFork, color: "#f59e0b", description: "Branch true/false" },
  webhook: { label: "Webhook", icon: Webhook, color: "#0ea5e9", description: "Inbound/outbound webhook" },
  delay: { label: "Delay", icon: Clock, color: "#64748b", description: "Pause for a duration" },
  loop: { label: "Loop", icon: Repeat, color: "#14b8a6", description: "Iterate over items" },
  api_request: { label: "API Request", icon: Globe, color: "#3b82f6", description: "Call an external REST API" },
  database: { label: "Database", icon: Database, color: "#0891b2", description: "Read/update internal data" },
  ai_decision: { label: "AI Decision", icon: BrainCircuit, color: "#d946ef", description: "Let AI decide the branch" },
  email: { label: "Email", icon: Mail, color: "#ef4444", description: "Send an email" },
  slack: { label: "Slack", icon: Slack, color: "#22c55e", description: "Post to Slack" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "#16a34a", description: "Send a WhatsApp message" },
  invoice: { label: "Invoice", icon: FileText, color: "#4f46e5", description: "Invoice lifecycle action" },
  payment: { label: "Payment", icon: CreditCard, color: "#059669", description: "Verify/record a payment" },
  approval: { label: "Approval", icon: ShieldCheck, color: "#ea580c", description: "Human/AI approval gate" },
};

export const nodeTypesList = Object.keys(nodeMeta) as NodeType[];
export const branchingNodeTypes: NodeType[] = ["condition", "ai_decision", "approval"];
