"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { clearAuthUser, saveAuthUser } from "@/lib/auth/client";
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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginResponse = {
  user?: {
    isApproved?: boolean;
    id?: number;
    name?: string;
    email?: string;
    isAdmin?: boolean;
  };
  error?: string;
};

export default function Login() {
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => null)) as LoginResponse | null;
      if (!data) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (!data.user) {
        setError("Login succeeded but user data was missing.");
        return;
      }

      if (!data.user.isApproved) {
        clearAuthUser();
        router.push("/pending");
        return;
      }

      saveAuthUser({
        id: data.user.id ?? 0,
        name: data.user.name ?? "",
        email: data.user.email ?? values.email,
        isApproved: true,
        isAdmin: Boolean(data.user.isAdmin),
      });
      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error ? (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                {error}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="-mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full bg-indigo-500 text-white hover:bg-indigo-600 focus-visible:ring-indigo-500/50"
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
