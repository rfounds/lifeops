"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteByToken } from "@/actions/household";

type InviteClientProps = {
  token: string;
  householdName: string;
  invitedBy: string;
};

export function InviteClient({ token, householdName, invitedBy }: InviteClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setLoading(true);
    setError("");

    const result = await acceptInviteByToken(token);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to join household");
      setLoading(false);
    }
  }

  function handleDecline() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
          Join Household
        </h1>

        <p className="text-[rgb(var(--muted-foreground))] mb-6">
          <strong>{invitedBy}</strong> has invited you to join
        </p>

        <div className="bg-[rgb(var(--muted)_/_0.3)] rounded-xl p-4 mb-6">
          <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
            {householdName}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-[rgb(var(--border))] rounded-xl hover:bg-[rgb(var(--muted))] transition-colors font-medium text-[rgb(var(--foreground))] disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] transition-all font-medium disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Joining...
              </span>
            ) : (
              "Join Household"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
