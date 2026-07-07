import type {
  ApiCardAggregateResponse,
  ApiCardsResponse,
  ApiDashboardMonthlyResponse,
  ApiFixedCostsResponse,
  ApiSummaryResponse,
  ApiTransaction,
  CreateFixedCostPayload,
  CreateCardPayload,
} from "./api-types";
import { API_BASE_URL } from "../../shared/api-config";

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

async function fetchDashboardResource<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
  });

  return parseJsonResponse<T>(response);
}

export type DashboardApiPayload = {
  summary: ApiSummaryResponse;
  fixedCosts: ApiFixedCostsResponse;
  transactions: ApiTransaction[];
  creditCard: ApiCardAggregateResponse;
};

export type ApiFixedCostMonthlyStatus = "PAID" | "PENDING";
export type ApiTransationPaymentStatus = "PAID" | "PENDING";
export type ApiTransationType = "DEPOSIT" | "EXPENSE" | "INVESTMENT";
export type ApiTransationCategory =
  | "HOUSING"
  | "TRANSPORTION"
  | "FOOD"
  | "ENTERTAINMENT"
  | "HEALTH"
  | "UTILITY"
  | "SALARY"
  | "EDUCATION"
  | "OTHER";
export type ApiTransationPaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "Bank_Transfer"
  | "BANK_SLIP"
  | "CASH"
  | "PIX"
  | "OTHER";
export type ApiInstallmentGroupPaymentMethod = Extract<
  ApiTransationPaymentMethod,
  "CREDIT_CARD" | "PIX"
>;

export type CreateTransationPayload = {
  userId: string;
  name: string;
  type: ApiTransationType;
  amount: string;
  category: ApiTransationCategory;
  paymentMethod: ApiTransationPaymentMethod;
  installments?: number;
  nameCard?: string;
  cardId?: string;
  Date: string;
  isFixed?: boolean;
  withdrawal?: "DEPOSIT" | "INVESTMENT";
};

export async function getDashboardApiPayload(
  userId: string,
  monthId: string,
): Promise<DashboardApiPayload> {
  const payload = await fetchDashboardResource<ApiDashboardMonthlyResponse>(
    `/transations/dashboard/${userId}/${monthId}`,
  );

  return payload;
}

export async function getCardsByUserId(userId: string): Promise<ApiCardsResponse> {
  return fetchDashboardResource<ApiCardsResponse>(
    `/cards/user/${encodeURIComponent(userId)}`,
  );
}

export async function getTransactionsByCard(
  cardName: string,
): Promise<ApiTransaction[]> {
  return fetchDashboardResource<ApiTransaction[]>(
    `/transations/open-by-card/${encodeURIComponent(cardName)}`,
  );
}

export async function createCard(payload: CreateCardPayload) {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function createFixedCost(payload: CreateFixedCostPayload) {
  const response = await fetch(`${API_BASE_URL}/fixed-costs`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function updateFixedCostMonthlyStatus(params: {
  fixedCostId: string;
  monthId: string;
  status: ApiFixedCostMonthlyStatus;
}) {
  const response = await fetch(
    `${API_BASE_URL}/fixed-costs/${encodeURIComponent(params.fixedCostId)}/monthly/${encodeURIComponent(params.monthId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: params.status,
      }),
    },
  );

  await parseJsonResponse<unknown>(response);
}

export async function updateTransationPaymentStatus(params: {
  transationId: string;
  paymentStatus: ApiTransationPaymentStatus;
  paidAt?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/transations/${encodeURIComponent(params.transationId)}/payment-status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentStatus: params.paymentStatus,
        ...(params.paidAt ? { paidAt: params.paidAt } : {}),
      }),
    },
  );

  await parseJsonResponse<unknown>(response);
}

export async function updateTransation(params: {
  transationId: string;
  name: string;
  amount: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/transations/${encodeURIComponent(params.transationId)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: params.name,
        amount: params.amount,
      }),
    },
  );

  await parseJsonResponse<unknown>(response);
}

export async function updateInstallmentGroup(params: {
  transationId: string;
  name: string;
  amount: string;
  Date: string;
  installments: number;
  paymentMethod: ApiInstallmentGroupPaymentMethod;
  cardId?: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/transations/${encodeURIComponent(params.transationId)}/installment-group`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: params.name,
        amount: params.amount,
        Date: params.Date,
        installments: params.installments,
        paymentMethod: params.paymentMethod,
        ...(params.cardId ? { cardId: params.cardId } : {}),
      }),
    },
  );

  await parseJsonResponse<unknown>(response);
}

export async function deleteTransation(params: { transationId: string }) {
  const response = await fetch(
    `${API_BASE_URL}/transations/${encodeURIComponent(params.transationId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return parseJsonResponse<{
    deletedCount: number;
    deletedTransactionId?: string;
    preservedPaidCount: number;
  }>(response);
}

export async function createTransation(payload: CreateTransationPayload) {
  const response = await fetch(`${API_BASE_URL}/transations`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<ApiTransaction | ApiTransaction[]>(response);
}
