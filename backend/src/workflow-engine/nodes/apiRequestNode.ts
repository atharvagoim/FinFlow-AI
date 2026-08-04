import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { logger } from "../../utils/logger";

// Generic outbound HTTP call node used for arbitrary REST integrations
// (QuickBooks, Google Sheets, custom APIs) that don't have a dedicated node.
export const apiRequestNode: NodeExecutor = async (node, ctx) => {
  const url = resolveValue(node.config.url ?? "", ctx) as string;
  const method = (node.config.method as string) ?? "GET";
  const headers = (resolveValue(node.config.headers ?? {}, ctx) as Record<string, string>) ?? {};
  const body = node.config.body ? resolveValue(node.config.body, ctx) : undefined;

  if (!url) return { output: { skipped: true, reason: "No URL configured" } };

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();
    return { output: { status: res.status, ok: res.ok, data } };
  } catch (err) {
    logger.warn(`[apiRequestNode] request to ${url} failed: ${(err as Error).message}`);
    throw err;
  }
};
