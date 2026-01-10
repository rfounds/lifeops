// src/types.ts
var FREE_TASK_LIMIT = 5;
var CATEGORIES = [
  { value: "FINANCE", label: "Finance", emoji: "\u{1F4B0}" },
  { value: "LEGAL", label: "Legal", emoji: "\u{1F4CB}" },
  { value: "HOME", label: "Home", emoji: "\u{1F3E0}" },
  { value: "HEALTH", label: "Health", emoji: "\u{1F3E5}" },
  { value: "DIGITAL", label: "Digital", emoji: "\u{1F4BB}" },
  { value: "OTHER", label: "Other", emoji: "\u{1F4CC}" }
];
var SCHEDULE_TYPES = [
  { value: "FIXED_DATE", label: "One-time" },
  { value: "EVERY_N_MONTHS", label: "Every N months" },
  { value: "YEARLY", label: "Yearly on specific date" }
];

export {
  FREE_TASK_LIMIT,
  CATEGORIES,
  SCHEDULE_TYPES
};
