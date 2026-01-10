"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/actions/auth";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await register(formData);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Registration failed");
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent transition-shadow text-[rgb(var(--foreground))]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[rgb(var(--background))]">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Logo href="/" size="lg" />
          </div>
          <h1 className="text-xl mt-8 font-medium text-[rgb(var(--foreground))]">Create an account</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">Start organizing your life admin</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className={inputClass}
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[rgb(var(--foreground))] text-[rgb(var(--background))] py-2.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium transition-all duration-200"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center mt-6 text-[rgb(var(--muted-foreground))]">
          Already have an account?{" "}
          <Link href="/login" className="text-[rgb(var(--accent))] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
