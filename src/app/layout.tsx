import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "LifeOps - Life Admin Made Simple",
    template: "%s | LifeOps",
  },
  description:
    "Track low-frequency, high-importance tasks. Never miss insurance renewals, annual checkups, tax deadlines, or important life admin again.",
  keywords: [
    "task manager",
    "life admin",
    "reminders",
    "renewals",
    "deadlines",
    "recurring tasks",
  ],
  authors: [{ name: "LifeOps" }],
  creator: "LifeOps",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lifeops.dev",
    siteName: "LifeOps",
    title: "LifeOps - Life Admin Made Simple",
    description:
      "Track low-frequency, high-importance tasks. Never miss insurance renewals, annual checkups, or tax deadlines again.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOps - Life Admin Made Simple",
    description:
      "Track low-frequency, high-importance tasks. Never miss insurance renewals, annual checkups, or tax deadlines again.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
