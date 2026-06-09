import { AuthSessionResponse } from "./types";
import { API_BASE_URL } from "../../shared/api-config";

export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/auth/google`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : "Nao foi possivel concluir a requisicao";
    throw new Error(message);
  }

  return data as T;
}

export async function waitForAuthApiReady() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: "no-store",
    credentials: "include",
  });

  if (response.ok || response.status === 401) {
    return;
  }

  throw new Error("Nao foi possivel acordar a API para o login");
}

export async function getSession() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  return parseJsonResponse<AuthSessionResponse>(response);
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  return parseJsonResponse<AuthSessionResponse>(response);
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return parseJsonResponse<{ success: boolean }>(response);
}
