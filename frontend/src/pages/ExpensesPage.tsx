import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge, statusColor } from "../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "../components/ui/Table";
import { listExpenses, createExpense, approveExpense } from "../services/expenseService";
import { formatCurrency, formatDate } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { Plus, Check, X, ShieldAlert } from "lucide-react";

export default function ExpensesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: expenses, isLoading } = useQuery({ queryKey: ["expenses"], queryFn: listExpenses });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: "Travel", amount: 0, description: "" });

  const canApprove = user?.role === "admin" || user?.role === "finance_manager";

  const createMutation = useMutation({
    mutationFn: () => createExpense(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expenses"] }); setModalOpen(false); },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => approveExpense(id, approve),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return (
    <AppLayout title="Expenses">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Submit Expense</Button>
      </div>

      <Card>
        <Table>
          <Thead>
            <Tr><Th>Employee</Th><Th>Category</Th><Th>Amount</Th><Th>AI Fraud Score</Th><Th>Status</Th>{canApprove && <Th>Actions</Th>}</Tr>
          </Thead>
          <Tbody>
            {expenses?.map((exp) => (
              <Tr key={exp._id}>
                <Td>{typeof exp.employee === "object" ? exp.employee.name : exp.employee}</Td>
                <Td>{exp.category} {exp.aiCategory && exp.aiCategory !== exp.category && <span className="text-xs text-slate-400">(AI: {exp.aiCategory})</span>}</Td>
                <Td>{formatCurrency(exp.amount)}</Td>
                <Td>
                  {exp.aiFraudScore !== undefined && (
                    <span className={`flex items-center gap-1 text-xs ${exp.aiFraudScore > 0.5 ? "text-red-500" : "text-slate-400"}`}>
                      {exp.aiFraudScore > 0.5 && <ShieldAlert className="h-3.5 w-3.5" />} {(exp.aiFraudScore * 100).toFixed(0)}%
                    </span>
                  )}
                </Td>
                <Td><Badge color={statusColor(exp.status)}>{exp.status.replace("_", " ")}</Badge></Td>
                {canApprove && (
                  <Td>
                    {exp.status === "submitted" || exp.status === "pending_approval" ? (
                      <div className="flex gap-2">
                        <button onClick={() => approveMutation.mutate({ id: exp._id, approve: true })} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Check className="h-4 w-4" /></button>
                        <button onClick={() => approveMutation.mutate({ id: exp._id, approve: false })} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
                      </div>
                    ) : null}
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
        {!isLoading && expenses?.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No expenses submitted yet.</p>}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Expense">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base">
              {["Travel", "Meals", "Software", "Office Supplies", "Utilities", "Marketing", "Payroll", "Professional Services", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button className="w-full" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!form.amount}>Submit</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
