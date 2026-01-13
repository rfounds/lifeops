// Colors matching the web app exactly
// From apps/web/src/app/globals.css

export const colors = {
  light: {
    // RGB values from web CSS variables
    background: "rgb(252, 251, 248)",     // --background: 252 251 248
    foreground: "rgb(28, 25, 23)",        // --foreground: 28 25 23
    card: "rgb(255, 255, 255)",           // --card: 255 255 255
    cardForeground: "rgb(28, 25, 23)",    // --card-foreground: 28 25 23
    border: "rgb(231, 229, 225)",         // --border: 231 229 225
    muted: "rgb(245, 243, 239)",          // --muted: 245 243 239
    mutedForeground: "rgb(120, 113, 108)", // --muted-foreground: 120 113 108
    accent: "rgb(168, 85, 247)",          // --accent: 168 85 247
    accentForeground: "rgb(255, 255, 255)", // --accent-foreground: 255 255 255
    success: "rgb(34, 197, 94)",          // --success: 34 197 94
    warning: "rgb(245, 158, 11)",         // --warning: 245 158 11
    destructive: "rgb(239, 68, 68)",      // --destructive: 239 68 68
    primary: "rgb(99, 102, 241)",         // --primary: 99 102 241
    primaryForeground: "rgb(255, 255, 255)", // --primary-foreground: 255 255 255
  },
  dark: {
    background: "rgb(15, 15, 15)",        // --background: 15 15 15
    foreground: "rgb(250, 249, 246)",     // --foreground: 250 249 246
    card: "rgb(24, 24, 24)",              // --card: 24 24 24
    cardForeground: "rgb(250, 249, 246)", // --card-foreground: 250 249 246
    border: "rgb(45, 45, 45)",            // --border: 45 45 45
    muted: "rgb(35, 35, 35)",             // --muted: 35 35 35
    mutedForeground: "rgb(163, 160, 154)", // --muted-foreground: 163 160 154
    accent: "rgb(192, 132, 252)",         // --accent: 192 132 252
    accentForeground: "rgb(15, 15, 15)",  // --accent-foreground: 15 15 15
    success: "rgb(74, 222, 128)",         // --success: 74 222 128
    warning: "rgb(251, 191, 36)",         // --warning: 251 191 36
    destructive: "rgb(248, 113, 113)",    // --destructive: 248 113 113
    primary: "rgb(129, 140, 248)",        // --primary: 129 140 248
    primaryForeground: "rgb(15, 15, 15)", // --primary-foreground: 15 15 15
  },
};

// Category colors and emojis
export const categoryConfig = {
  FINANCE: { emoji: "💰", label: "Finance", color: colors.light.success },
  LEGAL: { emoji: "📋", label: "Legal", color: colors.light.primary },
  HOME: { emoji: "🏠", label: "Home", color: colors.light.warning },
  HEALTH: { emoji: "🏥", label: "Health", color: colors.light.destructive },
  DIGITAL: { emoji: "💻", label: "Digital", color: colors.light.accent },
  OTHER: { emoji: "📌", label: "Other", color: colors.light.mutedForeground },
};

// Gradient colors for logo
export const gradientColors = {
  primary: "rgb(99, 102, 241)",
  accent: "rgb(168, 85, 247)",
};
