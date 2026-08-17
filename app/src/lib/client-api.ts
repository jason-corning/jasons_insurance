// Browser-side API client: thin fetch wrappers around the site's REST API.
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type ApiError = { code: string; message: string };

export class RequestError extends Error {
  code: string;
  status: number;
  constructor(status: number, error: ApiError) {
    super(error.message);
    this.code = error.code;
    this.status = status;
  }
}

// OAuth-aware fetch wrapper. Access tokens are short-lived (15 min) and ride
// an httpOnly cookie; on a 401 we run the refresh_token grant once (the
// refresh token is also cookie-borne) and retry the original request.
export async function api<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: init?.body ? { "content-type": "application/json" } : undefined,
    ...init,
  });
  if (response.status === 401 && !retried && !path.startsWith("/api/oauth/") && !path.startsWith("/api/auth/")) {
    const refreshed = await fetch("/api/oauth/token", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token" }),
    });
    if (refreshed.ok) return api<T>(path, init, true);
  }
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON error body
  }
  if (!response.ok) {
    const err = (data as { error?: ApiError } | null)?.error ?? {
      code: "request_failed",
      message: `Request failed (${response.status})`,
    };
    throw new RequestError(response.status, err);
  }
  return data as T;
}

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  address: { street: string | null; city: string | null; state: string | null; zip: string | null };
  communicationPreferences: { email: boolean; sms: boolean; mail: boolean; paperless: boolean };
  memberSince: string;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ ok: boolean; user: CurrentUser | null }>("/api/auth/me").then((r) => r.user),
    staleTime: 30_000,
  });
}

export function useAuthActions() {
  const queryClient = useQueryClient();
  return {
    async logout() {
      await api("/api/auth/logout", { method: "POST" });
      await queryClient.invalidateQueries();
    },
    async refresh() {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  };
}

export type Plan = {
  id: number;
  planType: string;
  tier: string;
  name: string;
  carrier: string;
  monthlyPremium: number;
  deductible: number;
  outOfPocketMax: number;
  network: string;
  hsaEligible: boolean;
  features: string[];
  description: string;
};

export type Enrollment = {
  id: number;
  planId: number;
  planName: string | null;
  carrier: string | null;
  planType: string | null;
  tier: string | null;
  status: string;
  effectiveDate: string;
  monthlyPremium: number;
  members: number;
  createdAt: string;
  activatedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  reinstatedAt: string | null;
};

export type PaymentRecord = {
  id: number;
  amount: number;
  kind: string;
  cardBrand: string;
  cardLast4: string;
  status: string;
  paidAt: string;
};

export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  active: "Active",
  cancelled: "Cancelled",
  terminated: "Terminated",
};

export const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-claysoft text-clay",
  active: "bg-sagesoft text-leaf",
  cancelled: "bg-paper text-ink/60",
  terminated: "bg-claysoft text-clay",
};
