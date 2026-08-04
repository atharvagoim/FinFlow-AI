import { apiClient } from "../api/client";

export interface Expense {
  _id: string; employee: { name: string; email: string } | string; category: string; amount: number;
  description?: string; status: string; aiCategory?: string; aiFraudScore?: number; createdAt: string;
}

export async function listExpenses(): Promise<Expense[]> {
  const { data } = await apiClient.get("/expenses");
  return data.data;
}
export async function createExpense(payload: { category: string; amount: number; description?: string }) {
  const { data } = await apiClient.post("/expenses", payload);
  return data.data as Expense;
}
export async function approveExpense(id: string, approve: boolean) {
  const { data } = await apiClient.post(`/expenses/${id}/approve`, { approve });
  return data.data as Expense;
}
