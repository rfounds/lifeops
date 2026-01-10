"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeProvider";
import { Logo } from "@/components/Logo";

type HeaderProps = {
  user?: {
    name?: string | null;
    email: string;
    plan: string;
  } | null;
  signOutAction?: () => Promise<void>;
};

export function Header({ user, signOutAction }: HeaderProps) {
  const currentPath = usePathname();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      currentPath === path
        ? "text-[rgb(var(--primary))] bg-[rgb(var(--primary)_/_0.1)]"
        : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)_/_0.1)]"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `block px-4 py-3 text-base font-medium transition-colors ${
      currentPath === path
        ? "text-[rgb(var(--primary))] bg-[rgb(var(--primary)_/_0.1)]"
        : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)_/_0.1)]"
    }`;

  return (
    <header className="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] sticky top-0 z-20 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Logo href={isLoggedIn ? "/dashboard" : "/"} />
          {isLoggedIn && (
            <nav className="hidden sm:flex gap-1">
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/pricing" className={navLinkClass("/pricing")}>
                Pricing
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn && (
            <Link
              href="/settings"
              className={`hidden sm:flex p-2 rounded-lg transition-all duration-200 ${
                currentPath === "/settings"
                  ? "text-[rgb(var(--primary))] bg-[rgb(var(--primary)_/_0.1)]"
                  : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)_/_0.1)]"
              }`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-[rgb(var(--border))]">
                <span className="text-sm text-[rgb(var(--muted-foreground))] max-w-[120px] truncate">
                  {user.name || user.email}
                </span>
                {user.plan === "PRO" && (
                  <span className="text-xs font-semibold bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                    PRO
                  </span>
                )}
              </div>
              <form action={signOutAction} className="hidden sm:block">
                <button
                  type="submit"
                  className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] px-3 py-1.5 rounded-lg hover:bg-[rgb(var(--muted))] hover:scale-105 transition-all duration-200"
                >
                  Sign out
                </button>
              </form>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] px-3 py-1.5 transition-all duration-200 hover:scale-105"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-[rgb(var(--foreground))] text-[rgb(var(--background))] px-4 py-1.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200 text-sm sm:text-base"
              >
                Get started
              </Link>
              {/* Mobile menu button for non-logged in */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <nav className="py-2">
            {isLoggedIn ? (
              <>
                <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {user.name || user.email}
                  </p>
                  {user.plan === "PRO" && (
                    <span className="inline-block mt-1 text-xs font-semibold bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-2.5 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  className={mobileNavLinkClass("/dashboard")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className={mobileNavLinkClass("/pricing")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/settings"
                  className={mobileNavLinkClass("/settings")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <form action={signOutAction} className="border-t border-[rgb(var(--border))] mt-2 pt-2">
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-3 text-base font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={mobileNavLinkClass("/login")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={mobileNavLinkClass("/register")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get started
                </Link>
                <Link
                  href="/pricing"
                  className={mobileNavLinkClass("/pricing")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
