import axios, { type AxiosRequestConfig } from "axios";

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_URL ?? process.env.INTERNAL_API_URL ?? "http://localhost:8080";
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`/api/v1${normalizedPath}`, getApiBaseUrl()).toString();
}

export async function apiFetch<T>(path: string, init?: AxiosRequestConfig): Promise<T> {
  const response = await axios.request<T>({
    url: toApiUrl(path),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return response.data;
}

export async function apiStream(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(toApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Streaming request failed (${response.status}) for ${path}`);
  }

  return response;
}
