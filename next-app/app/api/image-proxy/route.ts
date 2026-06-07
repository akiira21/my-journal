import { NextRequest } from "next/server";

function isAllowedUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");
  if (!isAllowedUrl(targetUrl)) {
    return new Response("Invalid image URL", { status: 400 });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Failed to fetch image", { status: 502 });
  }
}
