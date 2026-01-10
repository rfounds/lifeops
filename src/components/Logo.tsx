"use client";

import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({ href = "/", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-5 h-5", text: "text-lg" },
    md: { icon: "w-6 h-6", text: "text-xl" },
    lg: { icon: "w-8 h-8", text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5 group">
      {/* Geometric logo mark - stylized checkmark/progress indicator */}
      <div className={`${icon} relative`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--primary))" />
              <stop offset="100%" stopColor="rgb(var(--accent))" />
            </linearGradient>
          </defs>
          {/* Main square */}
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="2"
            fill="url(#logo-gradient)"
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
          {/* Bottom square */}
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#logo-gradient)"
            className="transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:translate-y-0.5"
          />
          {/* Right square - faded */}
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#logo-gradient)"
            className="opacity-40 transition-all duration-300 group-hover:opacity-70"
          />
        </svg>
      </div>
      {/* Text with gradient */}
      <span className={`${text} font-bold tracking-tight gradient-text`}>
        LifeOps
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
