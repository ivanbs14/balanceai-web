import type {
  ApiCardAggregateResponse,
  ApiDashboardMonthlyResponse,
  ApiFixedCostsResponse,
  ApiSummaryResponse,
  ApiTransaction,
} from "./api-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

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

export async function getDashboardApiPayload(
  userId: string,
  monthId: string,
): Promise<DashboardApiPayload> {
  const payload = await fetchDashboardResource<ApiDashboardMonthlyResponse>(
    `/transations/dashboard/${userId}/${monthId}`,
  );

  return payload;
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
