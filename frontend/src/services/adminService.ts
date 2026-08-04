import { apiClient } from "../api/client";

export async function listUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data.data;
}
export async function updateUserRole(id: string, role: string) {
  const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return data.data;
}
export async function listAuditLogs() {
  const { data } = await apiClient.get("/admin/audit-logs");
  return data.data;
}
export async function listAllExecutions() {
  const { data } = await apiClient.get("/admin/executions");
  return data.data;
}
