import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <Header user={null} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 pt-16 pb-20 sm:pt-24 sm:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgb(var(--accent)_/_0.1)] border border-[rgb(var(--accent)_/_0.2)] text-sm text-[rgb(var(--accent))] mb-6">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--accent))] animate-pulse" />
              Never forget another renewal
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-[rgb(var(--foreground))] leading-[1.1]">
              Your life admin,
              <br />
              <span className="gradient-text">finally organized.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[rgb(var(--muted-foreground))] mb-10 max-w-2xl mx-auto leading-relaxed">
              The simple way to track insurance renewals, doctor visits, tax deadlines,
              and all those important things you only do once a year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.3)] hover:scale-[1.02] active:scale-[0.98] font-semibold transition-all duration-200 text-lg"
              >
                Start for free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center border border-[rgb(var(--border))] text-[rgb(var(--foreground))] px-8 py-4 rounded-xl hover:bg-[rgb(var(--muted))] hover:scale-[1.02] active:scale-[0.98] font-semibold transition-all duration-200 text-lg"
              >
                View pricing
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[rgb(var(--muted-foreground))]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/>
                </svg>
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/>
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/>
                </svg>
                Email reminders
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="px-4 py-16 sm:py-24 border-t border-[rgb(var(--border))]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
                Life is full of important deadlines
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto text-lg">
                We all have tasks that happen once a year (or less) but absolutely cannot be forgotten.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { emoji: "💰", label: "Finance", items: ["Insurance renewals", "Tax filing deadlines", "Investment reviews"] },
                { emoji: "🏥", label: "Health", items: ["Annual physicals", "Dental checkups", "Prescription refills"] },
                { emoji: "📋", label: "Legal", items: ["License renewals", "Contract reviews", "Document updates"] },
                { emoji: "🏠", label: "Home", items: ["Maintenance checks", "Filter replacements", "Safety inspections"] },
                { emoji: "💻", label: "Digital", items: ["Password updates", "Subscription reviews", "Backup checks"] },
                { emoji: "📌", label: "Personal", items: ["Vehicle registration", "Membership renewals", "Certifications"] },
              ].map((category) => (
                <div
                  key={category.label}
                  className="p-5 sm:p-6 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] hover:border-[rgb(var(--border))] hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-[rgb(var(--muted))] flex items-center justify-center mb-4 text-2xl">
                    {category.emoji}
                  </div>
                  <h3 className="font-semibold mb-3 text-[rgb(var(--foreground))]">{category.label}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item} className="text-[rgb(var(--muted-foreground))] text-sm flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[rgb(var(--muted-foreground))]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="px-4 py-16 sm:py-24 gradient-subtle">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
                Simple as 1, 2, 3
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto text-lg">
                Set it up once, then relax knowing LifeOps has your back.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
              {[
                {
                  step: "1",
                  title: "Add your tasks",
                  description: "Enter your recurring life admin tasks with their schedule. Yearly, quarterly, monthly - whatever you need.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ),
                },
                {
                  step: "2",
                  title: "Get reminded",
                  description: "We'll email you 7 days before, 1 day before, and on the due date. You'll never be caught off guard.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  ),
                },
                {
                  step: "3",
                  title: "Mark complete",
                  description: "One click to mark it done. The next occurrence is automatically scheduled. It just works.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <div key={item.step} className="text-center relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-[rgb(var(--border))]" />
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-[rgb(var(--primary)_/_0.2)]">
                    {item.icon}
                  </div>
                  <div className="text-sm font-semibold text-[rgb(var(--accent))] mb-2">Step {item.step}</div>
                  <h3 className="font-bold text-lg mb-2 text-[rgb(var(--foreground))]">{item.title}</h3>
                  <p className="text-[rgb(var(--muted-foreground))] text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-16 sm:py-24 border-t border-[rgb(var(--border))]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
                Built for peace of mind
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto text-lg">
                Everything you need to stay on top of life&apos;s recurring responsibilities.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Flexible scheduling",
                  description: "Set tasks to repeat every X days, weeks, months, or years. Handle any schedule with ease.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  ),
                },
                {
                  title: "Smart categories",
                  description: "Organize tasks by Finance, Health, Legal, Home, Digital, and more. Filter with one click.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  ),
                },
                {
                  title: "Life admin score",
                  description: "See your productivity at a glance. Stay motivated with a simple score that shows how on-track you are.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  ),
                },
                {
                  title: "Quick templates",
                  description: "Get started fast with pre-built templates for common life admin tasks. One click to add.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                    </svg>
                  ),
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] hover:border-[rgb(var(--primary)_/_0.3)] hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--primary)_/_0.1)] to-[rgb(var(--accent)_/_0.1)] flex items-center justify-center mb-4 text-[rgb(var(--primary))]">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-[rgb(var(--foreground))]">{feature.title}</h3>
                  <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="gradient-subtle rounded-3xl p-8 sm:p-12 border border-[rgb(var(--primary)_/_0.1)]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[rgb(var(--foreground))]">
                Ready to get organized?
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] mb-8 text-lg">
                Join thousands of people who never miss an important deadline.
                Start free today - no credit card required.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.3)] hover:scale-[1.02] active:scale-[0.98] font-semibold transition-all duration-200 text-lg"
              >
                Get started for free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgb(var(--border))] py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-bold text-lg gradient-text">LifeOps</div>
            <div className="text-[rgb(var(--muted-foreground))] text-sm">
              Keep your life on track
            </div>
            <div className="flex gap-6 text-sm text-[rgb(var(--muted-foreground))]">
              <Link href="/pricing" className="hover:text-[rgb(var(--foreground))] transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-[rgb(var(--foreground))] transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
