import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverApiUrl } from "@/env";
import { authCookieOptions } from "@/lib/auth/cookies";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
} from "@/lib/auth/constants";

type RefreshResponse = {
  token?: string;
  refreshToken?: string;
};

/** Refresh the access token using the httpOnly refresh cookie and update session cookies. */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const upstream = await fetch(serverApiUrl("/api/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = (await upstream.json().catch(() => null)) as RefreshResponse | null;
    const accessToken = data?.token?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: "Invalid refresh response" }, { status: 502 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      AUTH_COOKIE_NAME,
      accessToken,
      authCookieOptions(request, AUTH_COOKIE_MAX_AGE_SECONDS)
    );

    const nextRefresh = data?.refreshToken?.trim();
    if (nextRefresh) {
      response.cookies.set(
        REFRESH_COOKIE_NAME,
        nextRefresh,
        authCookieOptions(request, REFRESH_COOKIE_MAX_AGE_SECONDS)
      );
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Refresh service unavailable" }, { status: 502 });
  }
}
