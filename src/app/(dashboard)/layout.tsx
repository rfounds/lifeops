import { requireAuth } from "@/lib/auth-utils";
import { signOut } from "@/lib/auth";
import { Header } from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <Header
        user={{ name: user.name, email: user.email, plan: user.plan }}
        signOutAction={handleSignOut}
      />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
