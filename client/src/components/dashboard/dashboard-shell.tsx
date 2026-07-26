"use client";

import type { ReactNode } from "react";
import type { CurrentUser, TeamMember } from "@/features/dashboard/types";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ScrollToTop } from "./scroll-to-top";

type DashboardShellProps = {
  user: CurrentUser | null;
  manageableMembers: TeamMember[];
  pendingApprovalIds: Set<number>;
  pendingDeleteIds: Set<number>;
  onToggleApproval: (id: number, currentStatus: boolean) => void;
  onDeleteUser: (id: number) => void;
  onLogout: () => void;
  title: string;
  subtitle: string;
  logoSrc?: string;
  logoAlt?: string;
  children: ReactNode;
};

export function DashboardShell({
  user,
  manageableMembers,
  pendingApprovalIds,
  pendingDeleteIds,
  onToggleApproval,
  onDeleteUser,
  onLogout,
  title,
  subtitle,
  logoSrc = "/pink_logo_rgb.webp",
  logoAlt = "Extra team",
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen={false} className="bg-background font-sans text-foreground">
      <AppSidebar
        user={user}
        manageableMembers={manageableMembers}
        pendingApprovalIds={pendingApprovalIds}
        pendingDeleteIds={pendingDeleteIds}
        onToggleApproval={onToggleApproval}
        onDeleteUser={onDeleteUser}
        onLogout={onLogout}
      />
      <SidebarInset className="min-w-0 bg-background text-foreground">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-3 py-2.5 backdrop-blur-sm sm:px-6 sm:py-3">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <SidebarTrigger className="shrink-0 border-0 bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-foreground md:hidden" />
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={logoAlt}
                width={314}
                height={128}
                className="h-8 w-auto max-w-[4.75rem] shrink-0 object-contain object-left sm:h-11 sm:max-w-[8.5rem]"
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
            <h1 className="truncate bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-xl">
              {title}
            </h1>
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          </div>
        </header>
        <div className="overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">{children}</div>
        </div>
      </SidebarInset>
      <ScrollToTop />
    </SidebarProvider>
  );
}
