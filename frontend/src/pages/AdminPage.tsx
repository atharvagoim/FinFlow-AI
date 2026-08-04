import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge, statusColor } from "../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "../components/ui/Table";
import { listUsers, updateUserRole, listAuditLogs, listAllExecutions } from "../services/adminService";
import { formatDate } from "../utils/format";

const TABS = ["Users", "Audit Logs", "Workflow Executions"] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Users");
  const queryClient = useQueryClient();

  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: listUsers, enabled: tab === "Users" });
  const { data: logs } = useQuery({ queryKey: ["admin-logs"], queryFn: listAuditLogs, enabled: tab === "Audit Logs" });
  const { data: executions } = useQuery({ queryKey: ["admin-executions"], queryFn: listAllExecutions, enabled: tab === "Workflow Executions" });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <AppLayout title="Admin Panel">
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-brand-600 text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Users" && (
        <Card>
          <CardHeader><CardTitle>Manage Users & Roles</CardTitle></CardHeader>
          <Table>
            <Thead><Tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th></Tr></Thead>
            <Tbody>
              {users?.map((u: any) => (
                <Tr key={u._id}>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <select value={u.role} onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })} className="input-base !w-40 !py-1.5 text-xs">
                      <option value="admin">Admin</option>
                      <option value="finance_manager">Finance Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </Td>
                  <Td><Badge color={u.isActive ? "green" : "red"}>{u.isActive ? "Active" : "Inactive"}</Badge></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}

      {tab === "Audit Logs" && (
        <Card>
          <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
          <Table>
            <Thead><Tr><Th>Actor</Th><Th>Action</Th><Th>Resource</Th><Th>Date</Th></Tr></Thead>
            <Tbody>
              {logs?.map((l: any) => (
                <Tr key={l._id}>
                  <Td>{l.actor?.name || "System"}</Td>
                  <Td>{l.action}</Td>
                  <Td>{l.resourceType}</Td>
                  <Td>{formatDate(l.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {logs?.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No audit logs yet.</p>}
        </Card>
      )}

      {tab === "Workflow Executions" && (
        <Card>
          <CardHeader><CardTitle>All Workflow Executions</CardTitle></CardHeader>
          <Table>
            <Thead><Tr><Th>Workflow</Th><Th>Status</Th><Th>Triggered By</Th><Th>Date</Th></Tr></Thead>
            <Tbody>
              {executions?.map((ex: any) => (
                <Tr key={ex._id}>
                  <Td>{ex.workflow?.name}</Td>
                  <Td><Badge color={statusColor(ex.status)}>{ex.status}</Badge></Td>
                  <Td className="capitalize">{ex.triggeredBy}</Td>
                  <Td>{formatDate(ex.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}
    </AppLayout>
  );
}
