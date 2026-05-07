import type {
  AnalyzeResponse,
  DataSyncRequest,
  DataSyncResponse,
  TrainModelRequest,
  TrainModelResponse,
} from "@/types/stock";

async function parseResponse<T>(response: Response): Promise<T> {
  const bodyText = await response.text();
  let payload: unknown = {};

  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      payload = { detail: bodyText };
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : `Request failed: ${response.status}`;
    throw new Error(detail);
  }

  return payload as T;
}

export async function syncData(input: DataSyncRequest): Promise<DataSyncResponse> {
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<DataSyncResponse>(response);
}

export async function uploadCsv(symbol: string, file: File): Promise<DataSyncResponse> {
  const form = new FormData();
  form.append("symbol", symbol);
  form.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  return parseResponse<DataSyncResponse>(response);
}

export async function trainModel(input: TrainModelRequest): Promise<TrainModelResponse> {
  const response = await fetch("/api/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<TrainModelResponse>(response);
}

export async function analyzeSymbol(symbol: string): Promise<AnalyzeResponse> {
  const response = await fetch(`/api/analyze/${symbol}`);
  return parseResponse<AnalyzeResponse>(response);
}
