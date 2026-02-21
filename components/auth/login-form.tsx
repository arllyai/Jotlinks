"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="ms-card w-full max-w-md p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Log in to continue building your resume.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            className="ms-input"
            placeholder="you@school.edu"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="ms-input"
            placeholder="At least 8 characters"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="ms-btn-primary w-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </form>

      {googleEnabled && (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="ms-btn-secondary mt-3 w-full px-4 py-2.5 text-sm font-medium"
        >
          Continue with Google
        </button>
      )}

      <p className="mt-5 text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/signup" className="font-medium text-[var(--accent)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
