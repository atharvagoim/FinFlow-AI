import { apiClient } from "../api/client";

export interface InvoiceItem { description: string; quantity: number; unitPrice: number; taxRate: number; amount?: number; }
export interface Invoice {
  _id: string; invoiceNumber: string; customer: { _id: string; name: string; email: string } | string;
  items: InvoiceItem[]; subtotal: number; taxTotal: number; total: number; currency: string;
  status: string; dueDate: string; issueDate: string; pdfUrl?: string; aiSummary?: string;
}

export async function listInvoices(status?: string): Promise<Invoice[]> {
  const { data } = await apiClient.get("/invoices", { params: { status } });
  return data.data;
}
export async function createInvoice(payload: { customer: string; items: InvoiceItem[]; dueDate: string; notes?: string }) {
  const { data } = await apiClient.post("/invoices", payload);
  return data.data as Invoice;
}
export async function approveInvoice(id: string) {
  const { data } = await apiClient.post(`/invoices/${id}/approve`);
  return data.data as Invoice;
}
export async function generateInvoicePdf(id: string) {
  const { data } = await apiClient.post(`/invoices/${id}/generate-pdf`);
  return data.data as Invoice;
}
export async function listCustomers() {
  const { data } = await apiClient.get("/customers");
  return data.data as { _id: string; name: string; email: string }[];
}
