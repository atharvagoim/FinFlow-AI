import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge, statusColor } from "../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "../components/ui/Table";
import { listInvoices, createInvoice, approveInvoice, generateInvoicePdf, listCustomers, InvoiceItem } from "../services/invoiceService";
import { formatCurrency, formatDate } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { Plus, FileDown, CheckCircle2 } from "lucide-react";

export default function InvoicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: invoices, isLoading } = useQuery({ queryKey: ["invoices"], queryFn: () => listInvoices() });
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: listCustomers });
  const [modalOpen, setModalOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }]);

  const canManage = user?.role === "admin" || user?.role === "finance_manager";

  const createMutation = useMutation({
    mutationFn: () => createInvoice({ customer, dueDate, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setModalOpen(false);
      setItems([{ description: "", quantity: 1, unitPrice: 0, taxRate: 18 }]);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const pdfMutation = useMutation({
    mutationFn: (id: string) => generateInvoicePdf(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  return (
    <AppLayout title="Invoices">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> New Invoice</Button>
      </div>

      <Card>
        <Table>
          <Thead>
            <Tr><Th>Invoice #</Th><Th>Customer</Th><Th>Total</Th><Th>Due Date</Th><Th>Status</Th><Th>Actions</Th></Tr>
          </Thead>
          <Tbody>
            {invoices?.map((inv) => (
              <Tr key={inv._id}>
                <Td className="font-medium">{inv.invoiceNumber}</Td>
                <Td>{typeof inv.customer === "object" ? inv.customer.name : inv.customer}</Td>
                <Td>{formatCurrency(inv.total, inv.currency)}</Td>
                <Td>{formatDate(inv.dueDate)}</Td>
                <Td><Badge color={statusColor(inv.status)}>{inv.status.replace("_", " ")}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    {canManage && inv.status === "draft" && (
                      <button onClick={() => approveMutation.mutate(inv._id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Approve">
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => pdfMutation.mutate(inv._id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Generate PDF">
                      <FileDown className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {!isLoading && invoices?.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No invoices yet.</p>}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Invoice">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Customer</label>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="input-base">
              <option value="">Select customer</option>
              {customers?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Line items</p>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input placeholder="Description" value={item.description} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))} className="input-base col-span-2 !py-2 text-xs" />
                <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, quantity: Number(e.target.value) } : it))} className="input-base !py-2 text-xs" />
                <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => setItems(items.map((it, idx) => idx === i ? { ...it, unitPrice: Number(e.target.value) } : it))} className="input-base !py-2 text-xs" />
              </div>
            ))}
            <button onClick={() => setItems([...items, { description: "", quantity: 1, unitPrice: 0, taxRate: 18 }])} className="text-xs font-medium text-brand-600 hover:underline">
              + Add line item
            </button>
          </div>

          <Button className="w-full" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!customer || !dueDate}>
            Create Invoice
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
