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

export async function apiFetchServer<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } },
): Promise<T> {
  const response = await fetch(toApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: {
      revalidate: 3600,
      ...(init?.next ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? "Too many requests. Please try again later.");
    }

    throw new Error(`Request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}
