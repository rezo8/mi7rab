import { env } from "@/lib/env";
import { ApiError } from "./errors";

type Options = RequestInit & { signal?: AbortSignal };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    // Send/receive the HttpOnly auth cookie (cross-origin in prod).
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => undefined)) as
      | { message?: string }
      | undefined;
    throw new ApiError(res.status, body?.message ?? res.statusText, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: Options) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Options) =>
    request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),
};
