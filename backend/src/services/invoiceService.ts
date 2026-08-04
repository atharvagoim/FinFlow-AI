import { Invoice, IInvoiceItem } from "../models/Invoice";
import { AppError } from "../utils/AppError";
import { generateInvoicePdf } from "./invoicePdfService";
import { summarizeInvoice } from "../ai/aiService";

function computeTotals(items: IInvoiceItem[]) {
  let subtotal = 0;
  let taxTotal = 0;
  const computedItems = items.map((item) => {
    const amount = item.quantity * item.unitPrice;
    const tax = amount * ((item.taxRate || 0) / 100);
    subtotal += amount;
    taxTotal += tax;
    return { ...item, amount };
  });
  return { computedItems, subtotal, taxTotal, total: subtotal + taxTotal };
}

async function nextInvoiceNumber() {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function createInvoice(createdBy: string, payload: {
  customer: string; items: IInvoiceItem[]; dueDate: string; currency?: string; notes?: string;
}) {
  const { computedItems, subtotal, taxTotal, total } = computeTotals(payload.items);
  const invoiceNumber = await nextInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    customer: payload.customer,
    items: computedItems,
    subtotal,
    taxTotal,
    total,
    currency: payload.currency || "INR",
    dueDate: new Date(payload.dueDate),
    notes: payload.notes,
    createdBy,
    status: "draft",
  });

  return invoice;
}

export async function listInvoices(filter: Record<string, unknown> = {}) {
  return Invoice.find(filter).populate("customer", "name email company").sort({ createdAt: -1 });
}

export async function getInvoice(id: string) {
  const invoice = await Invoice.findById(id).populate("customer");
  if (!invoice) throw AppError.notFound("Invoice not found");
  return invoice;
}

export async function updateInvoice(id: string, payload: Partial<{ items: IInvoiceItem[]; dueDate: string; notes: string }>) {
  const invoice = await getInvoice(id);
  if (payload.items) {
    const { computedItems, subtotal, taxTotal, total } = computeTotals(payload.items);
    invoice.items = computedItems;
    invoice.subtotal = subtotal;
    invoice.taxTotal = taxTotal;
    invoice.total = total;
  }
  if (payload.dueDate) invoice.dueDate = new Date(payload.dueDate);
  if (payload.notes !== undefined) invoice.notes = payload.notes;
  await invoice.save();
  return invoice;
}

export async function deleteInvoice(id: string) {
  const result = await Invoice.findByIdAndDelete(id);
  if (!result) throw AppError.notFound("Invoice not found");
}

export async function approveInvoice(id: string, approverId: string) {
  const invoice = await getInvoice(id);
  invoice.status = "approved";
  invoice.approvedBy = approverId as any;
  await invoice.save();
  return invoice;
}

export async function generatePdfForInvoice(id: string) {
  const invoice = await getInvoice(id);
  const summary = await summarizeInvoice(
    `Invoice ${invoice.invoiceNumber} for ${(invoice.customer as any).name}, total ${invoice.total} ${invoice.currency}, due ${invoice.dueDate}`
  );
  invoice.aiSummary = summary;
  const { url } = await generateInvoicePdf(invoice as any);
  invoice.pdfUrl = url;
  invoice.status = invoice.status === "draft" ? "sent" : invoice.status;
  await invoice.save();
  return invoice;
}
