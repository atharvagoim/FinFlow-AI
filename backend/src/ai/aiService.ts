import { completeJSON, completeText } from "./openaiClient";

// Every AI feature in the platform funnels through this module. Keeping
// prompts + fallbacks centralized makes it easy to swap models, add
// evaluation/telemetry later, or route different features to different
// providers without touching controllers or the workflow engine.

export async function categorizeExpense(description: string, amount: number) {
  return completeJSON(
    "You are a finance categorization assistant. Classify business expenses into one of: Travel, Meals, Software, Office Supplies, Utilities, Marketing, Payroll, Professional Services, Other. Respond with JSON: { category: string, confidence: number (0-1) }.",
    `Expense: "${description}", amount: ${amount}`,
    { category: "Other", confidence: 0 }
  );
}

export async function extractInvoiceInfo(rawText: string) {
  return completeJSON(
    "Extract structured invoice data from raw text (OCR output or email body). Respond with JSON: { vendor: string, invoiceNumber: string, amount: number, dueDate: string, currency: string }.",
    rawText,
    { vendor: "", invoiceNumber: "", amount: 0, dueDate: "", currency: "INR" }
  );
}

export async function summarizeInvoice(invoiceDetails: string) {
  return completeText(
    "Summarize this invoice in 2-3 concise sentences for a finance manager reviewing it quickly.",
    invoiceDetails,
    "Summary unavailable — AI not configured."
  );
}

export async function generatePaymentReminder(customerName: string, invoiceNumber: string, amount: number, daysOverdue: number) {
  return completeText(
    "Write a polite, professional payment reminder email body (no subject line) for an overdue invoice. Keep it under 120 words.",
    `Customer: ${customerName}, Invoice: ${invoiceNumber}, Amount: ${amount}, Days overdue: ${daysOverdue}`,
    `Dear ${customerName}, this is a reminder that invoice ${invoiceNumber} for ${amount} is ${daysOverdue} days overdue. Please arrange payment at your earliest convenience.`
  );
}

export async function classifyCustomerEmail(emailBody: string) {
  return completeJSON(
    "Classify this customer email into one of: Payment Query, Invoice Dispute, Refund Request, General Inquiry, Complaint, Other. Also extract sentiment (positive/neutral/negative) and urgency (low/medium/high). Respond as JSON: { category, sentiment, urgency }.",
    emailBody,
    { category: "Other", sentiment: "neutral", urgency: "low" }
  );
}

export async function detectDuplicateInvoice(candidate: { vendor: string; amount: number; date: string }, recent: Array<{ vendor: string; amount: number; date: string; invoiceNumber: string }>) {
  return completeJSON(
    "Given a candidate invoice and a list of recent invoices, determine if the candidate is likely a duplicate. Respond as JSON: { isDuplicate: boolean, matchedInvoiceNumber: string | null, reason: string }.",
    JSON.stringify({ candidate, recent }),
    { isDuplicate: false, matchedInvoiceNumber: null, reason: "AI not configured" }
  );
}

export async function detectFraud(expense: { description: string; amount: number; employee: string; category: string }) {
  return completeJSON(
    "Assess fraud risk for this expense claim on a 0-1 scale, considering unusual amounts, vague descriptions, or category mismatches. Respond as JSON: { fraudScore: number, riskLevel: 'low'|'medium'|'high', reasons: string[] }.",
    JSON.stringify(expense),
    { fraudScore: 0, riskLevel: "low", reasons: [] }
  );
}

export async function suggestApprovalDecision(context: { type: string; amount: number; requester: string; history?: string }) {
  return completeJSON(
    "You assist finance managers by suggesting approve/reject decisions for invoices or expenses. Consider amount and any provided history. Respond as JSON: { suggestion: 'approve'|'reject'|'escalate', confidence: number, reasoning: string }.",
    JSON.stringify(context),
    { suggestion: "escalate", confidence: 0, reasoning: "AI not configured" }
  );
}

export async function generateFinanceReport(data: Record<string, unknown>) {
  return completeText(
    "You are a finance analyst. Write a clear, structured executive summary report from the provided JSON metrics. Use short paragraphs, no markdown headers, plain prose.",
    JSON.stringify(data),
    "Report unavailable — AI not configured."
  );
}

// Powers the "AI Decision" workflow node: given a free-text prompt (already
// template-resolved with live execution data), returns a decision plus
// reasoning that the engine uses to branch true/false.
export async function getAIDecision(prompt: string, options?: string[]) {
  return completeJSON(
    `You make a single decision for an automated finance workflow. ${options ? `Choose one of: ${options.join(", ")}.` : "Answer true or false."} Respond as JSON: { decision: string, reasoning: string }.`,
    prompt,
    { decision: "false", reasoning: "AI not configured, defaulted to false" }
  );
}

// Natural-language workflow generation: "Whenever an invoice above ₹50,000
// is created, request manager approval and notify Slack." -> a Workflow
// nodes/edges graph the builder can render and the engine can execute.
export interface GeneratedWorkflow {
  name: string;
  description: string;
  triggerType: "manual" | "event" | "webhook" | "schedule";
  nodes: Array<{ id: string; type: string; label: string; position: { x: number; y: number }; config: Record<string, unknown> }>;
  edges: Array<{ id: string; source: string; target: string; sourceHandle?: string; label?: string }>;
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<GeneratedWorkflow> {
  const system = `You convert a plain-English finance automation request into a workflow graph for a Zapier-like builder.
Available node types: trigger, action, condition, webhook, delay, loop, api_request, database, ai_decision, email, slack, whatsapp, invoice, payment, approval.
Rules:
- Always start with exactly one "trigger" node.
- condition and approval nodes produce two outgoing edges with sourceHandle "true" and "false".
- Lay nodes out left-to-right: increment x by 260 for each step, keep y around 100-300.
- Respond ONLY as JSON matching: { name, description, triggerType, nodes: [{id, type, label, position:{x,y}, config}], edges: [{id, source, target, sourceHandle?, label?}] }.
- Use short unique ids like "n1", "n2".`;

  const fallback: GeneratedWorkflow = {
    name: "Untitled AI Workflow",
    description: prompt,
    triggerType: "event",
    nodes: [
      { id: "n1", type: "trigger", label: "Trigger", position: { x: 0, y: 150 }, config: {} },
    ],
    edges: [],
  };

  return completeJSON(system, prompt, fallback);
}
