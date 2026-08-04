import { apiClient } from "../api/client";

export interface Payment {
  _id: string; invoice: { _id: string; invoiceNumber: string; total: number } | string;
  provider: string; amount: number; currency: string; status: string; refundedAmount: number; createdAt: string;
}

export async function listPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get("/payments");
  return data.data;
}
export async function refundPayment(id: string, amount?: number) {
  const { data } = await apiClient.post(`/payments/${id}/refund`, { amount });
  return data.data as Payment;
}
