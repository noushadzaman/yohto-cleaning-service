import 'server-only';

import { cookies } from 'next/headers';
import { serverApiUrl } from '@/env';
import { authCookieOptions } from '@/lib/auth/cookies';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
} from './constants';
import type { AuthUser } from './types';

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

async function refreshAccessToken(
  refreshToken: string,
  request?: Request
): Promise<string | null> {
  try {
    const response = await fetch(serverApiUrl('/api/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as {
      token?: string;
      refreshToken?: string;
    } | null;
    const accessToken = data?.token?.trim();
    if (!accessToken) {
      return null;
    }

    if (request) {
      const cookieStore = await cookies();
      cookieStore.set(
        AUTH_COOKIE_NAME,
        accessToken,
        authCookieOptions(request, AUTH_COOKIE_MAX_AGE_SECONDS)
      );
      const nextRefresh = data?.refreshToken?.trim();
      if (nextRefresh) {
        cookieStore.set(
          REFRESH_COOKIE_NAME,
          nextRefresh,
          authCookieOptions(request, REFRESH_COOKIE_MAX_AGE_SECONDS)
        );
      }
    }

    return accessToken;
  } catch {
    return null;
  }
}

export async function getServerAuthHeaders(
  request?: Request
): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (token && !isTokenExpired(token)) {
    return { Authorization: `Bearer ${token}` };
  }

  if (!refreshToken) {
    return {};
  }

  const accessToken = await refreshAccessToken(refreshToken, request);
  if (!accessToken) {
    return {};
  }

  return { Authorization: `Bearer ${accessToken}` };
}

export async function getServerAuthUser(): Promise<AuthUser | null> {
  const authHeaders = await getServerAuthHeaders();
  if (!authHeaders.Authorization) {
    return null;
  }

  try {
    const response = await fetch(serverApiUrl('/api/auth/me'), {
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as { user?: AuthUser } | null;
    return data?.user ?? null;
  } catch {
    return null;
  }
}
