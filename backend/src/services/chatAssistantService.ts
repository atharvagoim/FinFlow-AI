import { Invoice } from "../models/Invoice";
import { Expense } from "../models/Expense";
import { WorkflowExecution } from "../models/WorkflowExecution";
import { Payment } from "../models/Payment";
import { completeText } from "../ai/openaiClient";

// The embedded finance assistant. Rather than a generic RAG pipeline, this
// uses lightweight keyword routing to pull the *exact* structured data the
// question needs (overdue invoices, failed workflows, etc.) and hands that
// to the LLM purely to phrase a natural-language answer — keeping numbers
// accurate instead of letting the model guess at them.
export async function runChatAssistant(message: string, _userId: string) {
  const lower = message.toLowerCase();

  if (lower.includes("overdue")) {
    const invoices = await Invoice.find({ status: { $in: ["sent", "overdue"] }, dueDate: { $lt: new Date() } })
      .populate("customer", "name email")
      .limit(20)
      .lean();
    const summary = await completeText(
      "Summarize this list of overdue invoices for a finance manager in 2-4 sentences, mentioning total count and total amount.",
      JSON.stringify(invoices),
      `You have ${invoices.length} overdue invoice(s).`
    );
    return { reply: summary, data: invoices, intent: "overdue_invoices" };
  }

  if (lower.includes("revenue") && (lower.includes("report") || lower.includes("generate"))) {
    const paid = await Invoice.find({ status: "paid" }).lean();
    const total = paid.reduce((sum, inv) => sum + inv.total, 0);
    const summary = await completeText(
      "Write a short revenue report summary (3-5 sentences) from this paid invoice data.",
      JSON.stringify({ count: paid.length, total }),
      `Total revenue from ${paid.length} paid invoices: ${total}.`
    );
    return { reply: summary, data: { count: paid.length, total }, intent: "revenue_report" };
  }

  if (lower.includes("expense")) {
    const expenses = await Expense.find().sort({ createdAt: -1 }).limit(50).lean();
    const byCategory: Record<string, number> = {};
    for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    const summary = await completeText(
      "Summarize expense spend by category in a short paragraph.",
      JSON.stringify(byCategory),
      `Recent expenses across ${Object.keys(byCategory).length} categories.`
    );
    return { reply: summary, data: byCategory, intent: "expense_summary" };
  }

  if (lower.includes("duplicate")) {
    const payments = await Payment.find({ status: "succeeded" }).sort({ createdAt: -1 }).limit(100).lean();
    const seen = new Map<string, typeof payments>();
    for (const p of payments) {
      const key = `${p.invoice}-${p.amount}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(p);
    }
    const duplicates = [...seen.values()].filter((group) => group.length > 1).flat();
    return {
      reply: duplicates.length
        ? `Found ${duplicates.length} potentially duplicate payment(s) with matching invoice + amount.`
        : "No duplicate payments found in recent records.",
      data: duplicates,
      intent: "duplicate_payments",
    };
  }

  if (lower.includes("workflow") && lower.includes("fail")) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const failed = await WorkflowExecution.find({ status: { $in: ["failed", "partial"] }, createdAt: { $gte: startOfDay } })
      .populate("workflow", "name")
      .lean();
    return {
      reply: failed.length
        ? `${failed.length} workflow run(s) failed or partially failed today.`
        : "No failed workflow runs today.",
      data: failed,
      intent: "failed_workflows",
    };
  }

  // Fallback: general finance Q&A without specific DB grounding.
  const reply = await completeText(
    "You are FinFlow AI's embedded finance assistant. Answer concisely and helpfully. If you don't have live data access for this question, say so plainly.",
    message,
    "I can help with overdue invoices, revenue reports, expense summaries, duplicate payments, and failed workflows. Try asking about one of those, or configure OPENAI_API_KEY for open-ended questions."
  );
  return { reply, data: null, intent: "general" };
}
