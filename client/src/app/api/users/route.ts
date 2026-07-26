import { NextResponse } from "next/server";
import { serverApiUrl } from "@/env";
import { getServerAuthHeaders } from "@/lib/auth/server";

export async function GET(request: Request) {
  const authHeaders = await getServerAuthHeaders(request);
  if (!authHeaders.Authorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const approved = searchParams.get("approved");
  const query =
    approved === "true" ? "?approved=true" : approved === "false" ? "?approved=false" : "";

  try {
    const upstream = await fetch(serverApiUrl(`/api/users${query}`), {
      headers: authHeaders,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Users service is unavailable" }, { status: 502 });
  }
}
