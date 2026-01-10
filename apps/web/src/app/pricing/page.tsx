import { getCurrentUser } from "@/lib/auth-utils";
import { PricingClient } from "./PricingClient";
import { Header } from "@/components/Header";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const isPro = user?.plan === "PRO" || false;
  const hasStripe = !!process.env.STRIPE_SECRET_KEY;
  const isDev = process.env.NODE_ENV === "development";
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <Header
        user={user ? { name: user.name, email: user.email, plan: user.plan } : null}
      />

      <main className="flex-1 py-8 sm:py-16 px-4">
        <PricingClient
          isPro={isPro}
          hasStripe={hasStripe}
          isDev={isDev}
          isLoggedIn={isLoggedIn}
        />
      </main>

      <footer className="border-t border-[rgb(var(--border))] py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-[rgb(var(--muted-foreground))] text-sm">
          LifeOps - Keep your life on track
        </div>
      </footer>
    </div>
  );
}
