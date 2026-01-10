import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <Header user={null} />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center">
            <span className="text-4xl font-bold text-[rgb(var(--muted-foreground))]">
              404
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[rgb(var(--foreground))]">
            Page not found
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-[rgb(var(--foreground))] text-[rgb(var(--background))] px-6 py-2.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200"
          >
            Go home
          </Link>
        </div>
      </main>
    </div>
  );
}
