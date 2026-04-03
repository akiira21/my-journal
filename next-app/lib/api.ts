import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const apiClient = axios.create({
  baseURL: new URL("/api/v1", API_BASE_URL).toString(),
  headers: {
    "Content-Type": "application/json",
  },
});

function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`/api/v1${normalizedPath}`, API_BASE_URL).toString();
}

export async function apiFetch<T>(path: string, init?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>({
    url: path,
    ...init,
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
