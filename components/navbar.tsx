import Link from "next/link";
import { getServerSession } from "next-auth";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { authOptions } from "@/lib/auth-options";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--accent)] text-xs font-bold text-white">
            J
          </span>
          Jotlinks
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="ms-btn-primary px-4 py-1.5 text-xs font-semibold"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="ms-btn-secondary px-4 py-1.5 text-xs font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="ms-btn-primary px-4 py-1.5 text-xs font-semibold"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
