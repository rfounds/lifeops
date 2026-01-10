"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCheckoutSession, devUpgradeToPro, devDowngradeToFree } from "@/actions/billing";

type PricingClientProps = {
  isPro: boolean;
  hasStripe: boolean;
  isDev: boolean;
  isLoggedIn: boolean;
};

export function PricingClient({ isPro, hasStripe, isDev, isLoggedIn }: PricingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);

    if (hasStripe) {
      const result = await createCheckoutSession();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Failed to start checkout");
        setLoading(false);
      }
    }
  }

  async function handleDevUpgrade() {
    setLoading(true);
    const result = await devUpgradeToPro();
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to upgrade");
    }
    setLoading(false);
  }

  async function handleDevDowngrade() {
    setLoading(true);
    const result = await devDowngradeToFree();
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to downgrade");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))]">Simple, transparent pricing</h1>
        <p className="text-[rgb(var(--muted-foreground))] mt-2 text-sm sm:text-base">
          {isLoggedIn ? "Choose the plan that works for you" : "Start free, upgrade when you need more"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className={`border rounded-2xl p-6 transition-all ${
          isLoggedIn && !isPro
            ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent)_/_0.05)]"
            : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
        }`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Free</h2>
            <p className="text-3xl font-bold mt-2 text-[rgb(var(--foreground))]">$0</p>
            <p className="text-[rgb(var(--muted-foreground))] text-sm">forever</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Up to 5 tasks
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All schedule types
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--muted-foreground))]">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No email/SMS reminders
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--muted-foreground))]">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No household sharing
            </li>
          </ul>

          {isLoggedIn && !isPro && (
            <div className="text-center text-sm text-[rgb(var(--accent))] font-medium py-2.5">
              Current plan
            </div>
          )}
          {!isLoggedIn && (
            <Link
              href="/register"
              className="block w-full text-center border border-[rgb(var(--border))] py-2.5 rounded-lg hover:bg-[rgb(var(--muted))] hover:scale-[1.02] active:scale-[0.98] text-[rgb(var(--foreground))] font-medium transition-all duration-200"
            >
              Get started
            </Link>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`border rounded-2xl p-6 relative transition-all ${
          isLoggedIn && isPro
            ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent)_/_0.05)]"
            : !isLoggedIn
              ? "border-2 border-[rgb(var(--accent))] bg-[rgb(var(--card))]"
              : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
        }`}>
          {!isLoggedIn && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[rgb(var(--accent))] text-white text-xs px-3 py-1 rounded-full font-medium">
              Most popular
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Pro</h2>
            <p className="text-3xl font-bold mt-2 text-[rgb(var(--foreground))]">$5</p>
            <p className="text-[rgb(var(--muted-foreground))] text-sm">per month</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <strong>Unlimited</strong>&nbsp;tasks
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <strong>Email reminders</strong>&nbsp;before due dates
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <strong>SMS reminders</strong>&nbsp;to your phone
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <strong>Household sharing</strong>&nbsp;with family
            </li>
            <li className="flex items-center text-sm text-[rgb(var(--foreground))]">
              <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Customizable reminder timing
            </li>
          </ul>

          {!isLoggedIn ? (
            <Link
              href="/register"
              className="block w-full text-center bg-[rgb(var(--foreground))] text-[rgb(var(--background))] py-2.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200"
            >
              Start free trial
            </Link>
          ) : isPro ? (
            <div className="text-center text-sm text-[rgb(var(--foreground))] font-medium py-2.5">
              Current plan
            </div>
          ) : hasStripe ? (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-[rgb(var(--foreground))] text-[rgb(var(--background))] py-2.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 font-medium transition-all duration-200"
            >
              {loading ? "Loading..." : "Upgrade to Pro"}
            </button>
          ) : (
            <div className="text-center text-sm text-[rgb(var(--muted-foreground))] py-2.5">
              Stripe not configured
            </div>
          )}
        </div>
      </div>

      {/* Dev mode buttons */}
      {isDev && isLoggedIn && (
        <div className="mt-8 sm:mt-12 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-xl mx-auto">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-3">
            Development Mode
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {!isPro ? (
              <button
                onClick={handleDevUpgrade}
                disabled={loading}
                className="px-4 py-2.5 sm:py-2 bg-amber-600 text-white rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 text-sm font-medium transition-all duration-200"
              >
                {loading ? "..." : "Dev: Upgrade to Pro"}
              </button>
            ) : (
              <button
                onClick={handleDevDowngrade}
                disabled={loading}
                className="px-4 py-2.5 sm:py-2 bg-[rgb(var(--muted-foreground))] text-white rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 text-sm font-medium transition-all duration-200"
              >
                {loading ? "..." : "Dev: Downgrade to Free"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
