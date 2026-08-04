import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Badge, statusColor } from "../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "../components/ui/Table";
import { listPayments, refundPayment } from "../services/paymentService";
import { formatCurrency, formatDate } from "../utils/format";
import { RotateCcw } from "lucide-react";

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useQuery({ queryKey: ["payments"], queryFn: listPayments });

  const refundMutation = useMutation({
    mutationFn: (id: string) => refundPayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  return (
    <AppLayout title="Payments">
      <Card>
        <Table>
          <Thead>
            <Tr><Th>Invoice</Th><Th>Provider</Th><Th>Amount</Th><Th>Status</Th><Th>Date</Th><Th>Actions</Th></Tr>
          </Thead>
          <Tbody>
            {payments?.map((p) => (
              <Tr key={p._id}>
                <Td className="font-medium">{typeof p.invoice === "object" ? p.invoice.invoiceNumber : p.invoice}</Td>
                <Td className="capitalize">{p.provider}</Td>
                <Td>{formatCurrency(p.amount, p.currency)}</Td>
                <Td><Badge color={statusColor(p.status)}>{p.status.replace("_", " ")}</Badge></Td>
                <Td>{formatDate(p.createdAt)}</Td>
                <Td>
                  {p.status === "succeeded" && (
                    <button onClick={() => refundMutation.mutate(p._id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Refund">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {!isLoading && payments?.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No payments recorded yet.</p>}
      </Card>
    </AppLayout>
  );
}
