import { apiClient } from "../api/client";

export async function sendChatMessage(message: string) {
  const { data } = await apiClient.post("/ai/chat", { message });
  return data.data as { reply: string; data: unknown; intent: string };
}
