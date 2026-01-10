"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2 text-[rgb(var(--foreground))]">
        Something went wrong
      </h2>
      <p className="text-[rgb(var(--muted-foreground))] mb-6">
        We couldn&apos;t load your dashboard. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-[rgb(var(--foreground))] text-[rgb(var(--background))] px-6 py-2.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200"
      >
        Try again
      </button>
    </div>
  );
}
