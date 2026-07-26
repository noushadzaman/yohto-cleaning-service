import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function PendingApproval() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans selection:bg-indigo-500/30">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
        <div className="absolute -left-24 -top-24 h-48 w-48 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 animate-pulse rounded-full bg-cyan-500/10 blur-3xl delay-700" />

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Pending Approval
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Your account has been created successfully, but it requires administrator
            approval before you can access the dashboard.
          </p>

          <div className="mb-8 rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              We will notify you once your account is reviewed. Please check back later.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
