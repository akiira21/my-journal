import axios, { AxiosError, type AxiosRequestConfig } from "axios";

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
  try {
    const response = await axios.request<T>({
      url: toApiUrl(path),
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 429) {
        throw new Error(
          axiosError.response.data?.message ?? "Too many requests. Please try again later.",
        );
      }
    }
    throw error;
  }
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
    if (response.status === 429) {
      const body = await response.json().catch(() => ({} as { message?: string }));
      throw new Error(body.message ?? "Too many requests. Please try again later.");
    }

    throw new Error(`Streaming request failed (${response.status}) for ${path}`);
  }

  return response;
}
