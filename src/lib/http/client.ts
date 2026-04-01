// src/lib/http/client.ts

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}