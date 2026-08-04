import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { Invoice } from "../../models/Invoice";
import { generateInvoicePdf } from "../../services/invoicePdfService";

// Automates invoice lifecycle actions inside a workflow: generate a receipt
// PDF, mark as paid/sent, etc. config.action selects the sub-operation.
export const invoiceNode: NodeExecutor = async (node, ctx) => {
  const invoiceId = resolveValue(node.config.invoiceId ?? "{{trigger.invoiceId}}", ctx) as string;
  const action = (node.config.action as string) ?? "generate_receipt";

  const invoice = await Invoice.findById(invoiceId).populate("customer");
  if (!invoice) return { output: { skipped: true, reason: "Invoice not found" } };

  if (action === "mark_paid") {
    invoice.status = "paid";
    await invoice.save();
    return { output: { invoiceId, status: "paid" } };
  }

  if (action === "generate_receipt") {
    const { url } = await generateInvoicePdf(invoice);
    invoice.pdfUrl = url;
    await invoice.save();
    return { output: { invoiceId, pdfUrl: url } };
  }

  return { output: { skipped: true, reason: `Unknown action ${action}` } };
};
