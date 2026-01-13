// Colors matching the web app exactly
// From apps/web/src/app/globals.css
// Dark mode is default

export const colors = {
  light: {
    background: "rgb(252, 251, 248)",
    foreground: "rgb(28, 25, 23)",
    card: "rgb(255, 255, 255)",
    cardForeground: "rgb(28, 25, 23)",
    border: "rgb(231, 229, 225)",
    muted: "rgb(245, 243, 239)",
    mutedForeground: "rgb(120, 113, 108)",
    accent: "rgb(168, 85, 247)",
    accentForeground: "rgb(255, 255, 255)",
    success: "rgb(34, 197, 94)",
    warning: "rgb(245, 158, 11)",
    destructive: "rgb(239, 68, 68)",
    primary: "rgb(99, 102, 241)",
    primaryForeground: "rgb(255, 255, 255)",
  },
  dark: {
    background: "rgb(15, 15, 15)",
    foreground: "rgb(250, 249, 246)",
    card: "rgb(24, 24, 24)",
    cardForeground: "rgb(250, 249, 246)",
    border: "rgb(45, 45, 45)",
    muted: "rgb(35, 35, 35)",
    mutedForeground: "rgb(163, 160, 154)",
    accent: "rgb(192, 132, 252)",
    accentForeground: "rgb(15, 15, 15)",
    success: "rgb(74, 222, 128)",
    warning: "rgb(251, 191, 36)",
    destructive: "rgb(248, 113, 113)",
    primary: "rgb(129, 140, 248)",
    primaryForeground: "rgb(15, 15, 15)",
  },
};

// Default to dark theme
export const theme = colors.dark;

// Category colors and emojis (using dark theme colors)
export const categoryConfig = {
  FINANCE: { emoji: "💰", label: "Finance", color: theme.success },
  LEGAL: { emoji: "📋", label: "Legal", color: theme.primary },
  HOME: { emoji: "🏠", label: "Home", color: theme.warning },
  HEALTH: { emoji: "🏥", label: "Health", color: theme.destructive },
  DIGITAL: { emoji: "💻", label: "Digital", color: theme.accent },
  OTHER: { emoji: "📌", label: "Other", color: theme.mutedForeground },
};

// Gradient colors for logo
export const gradientColors = {
  primary: theme.primary,
  accent: theme.accent,
};
