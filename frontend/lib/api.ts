import type { AnalysisResponse, TraceResponse } from "@/types/aegis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function analyzeRepository(path: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE}/api/repositories/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Repository analysis failed" }));
    throw new Error(payload.detail ?? "Repository analysis failed");
  }

  return response.json();
}

export async function traceFlow(query: string): Promise<TraceResponse> {
  const response = await fetch(`${API_BASE}/api/trace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error("Flow tracing failed");
  }

  return response.json();
}

