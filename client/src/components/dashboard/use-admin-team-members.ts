"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthUser } from "@/lib/auth/client";
import type { TeamMember } from "@/features/dashboard/types";

const REFRESH_MS = 15_000;

async function refreshSession(): Promise<"ok" | "missing" | "failed"> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (response.ok) return "ok";
    if (response.status === 404) return "missing";
    return "failed";
  } catch {
    return "failed";
  }
}

async function fetchTeamMembersClient(
  authUnavailableRef: { current: boolean }
): Promise<TeamMember[] | null> {
  if (authUnavailableRef.current) {
    return null;
  }

  const load = () =>
    fetch("/api/users", {
      cache: "no-store",
      credentials: "same-origin",
    });

  try {
    let response = await load();
    if (response.status === 401) {
      const refreshResult = await refreshSession();
      if (refreshResult !== "ok") {
        if (refreshResult === "missing" || response.status === 401) {
          authUnavailableRef.current = true;
        }
        return null;
      }
      response = await load();
    }
    if (response.status === 404) {
      authUnavailableRef.current = true;
      return null;
    }
    if (!response.ok) {
      if (response.status === 401) {
        authUnavailableRef.current = true;
      }
      return null;
    }
    return (await response.json()) as TeamMember[];
  } catch {
    return null;
  }
}

export function useAdminTeamMembers(
  initialTeamMembers: TeamMember[],
  pendingMutation: boolean
) {
  const isAdmin = Boolean(getAuthUser()?.isAdmin);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const hasClientDataRef = useRef(false);
  const authUnavailableRef = useRef(false);

  const refetchTeamMembers = useCallback(async () => {
    if (!isAdmin || authUnavailableRef.current) return;
    const members = await fetchTeamMembersClient(authUnavailableRef);
    if (members !== null) {
      hasClientDataRef.current = true;
      setTeamMembers(members);
    }
  }, [isAdmin]);

  // Seed from SSR only until the first successful client fetch.
  useEffect(() => {
    if (pendingMutation || hasClientDataRef.current) return;
    setTeamMembers(initialTeamMembers);
  }, [initialTeamMembers, pendingMutation]);

  useEffect(() => {
    if (!isAdmin) return;

    void refetchTeamMembers();

    const interval = window.setInterval(() => {
      void refetchTeamMembers();
    }, REFRESH_MS);

    const onFocus = () => {
      void refetchTeamMembers();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refetchTeamMembers();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAdmin, refetchTeamMembers]);

  return { teamMembers, setTeamMembers, refetchTeamMembers };
}
