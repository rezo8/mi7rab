import { env } from "@/lib/env";
import { ApiError } from "./errors";

type Options = RequestInit & { signal?: AbortSignal };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  // Only set a JSON Content-Type when there's a body, so GETs stay "simple"
  // requests and don't trigger a cross-origin CORS preflight. Normalize via
  // Headers so a caller-supplied Headers/tuple merges correctly.
  const headers = new Headers(options.headers);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    credentials: "include", // send/receive the HttpOnly auth cookie
    ...options,
    headers,
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
