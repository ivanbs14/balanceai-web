import { API_BASE_URL } from "../../shared/api-config";
import type { AIFeedbackResponse } from "./types";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : "Não foi possível concluir a requisição";
    throw new Error(message);
  }

  return data as T;
}

export async function generateAIFeedback(
  month: string
): Promise<AIFeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/ai-feedback/generate/${month}`, {
    method: "POST",
    credentials: "include",
  });

  return parseJsonResponse<AIFeedbackResponse>(response);
}

export async function getAIFeedback(
  month: string
): Promise<AIFeedbackResponse | null> {
  const response = await fetch(`${API_BASE_URL}/ai-feedback/${month}`, {
    credentials: "include",
  });

  if (response.status === 404) {
    return null;
  }

  return parseJsonResponse<AIFeedbackResponse>(response);
}
