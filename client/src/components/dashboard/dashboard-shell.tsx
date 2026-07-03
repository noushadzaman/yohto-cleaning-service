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
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="shrink-0 border-0 bg-transparent text-muted-foreground shadow-none hover:bg-accent hover:text-foreground md:hidden" />
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
              {title}
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">{children}</div>
        </div>
      </SidebarInset>
      <ScrollToTop />
    </SidebarProvider>
  );
}
