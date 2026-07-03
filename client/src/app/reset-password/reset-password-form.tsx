"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError("");

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Could not reset your password. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 font-sans selection:bg-indigo-500/30">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Reset Password
          </h1>
          <p className="mt-2 text-muted-foreground">Choose a new password</p>
        </div>

        {!token ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              This reset link is invalid or incomplete. Please request a new one.
            </div>
            <Link
              href="/forgot-password"
              className="block text-center text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Request a new link
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-400">
              Your password has been reset. Redirecting you to sign in...
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="mt-2 h-11 w-full bg-indigo-500 text-white hover:bg-indigo-600 focus-visible:ring-indigo-500/50"
              >
                {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
