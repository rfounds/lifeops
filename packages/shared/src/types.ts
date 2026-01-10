// Core enums (matching Prisma schema)
export type Category = "FINANCE" | "LEGAL" | "HOME" | "HEALTH" | "DIGITAL" | "OTHER";
export type ScheduleType = "FIXED_DATE" | "EVERY_N_MONTHS" | "YEARLY";
export type Plan = "FREE" | "PRO";
export type HouseholdRole = "OWNER" | "MEMBER";

// User type
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  emailReminders?: boolean;
  smsReminders?: boolean;
  phoneNumber?: string | null;
  reminderDays?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Task type
export interface Task {
  id: string;
  userId: string;
  title: string;
  category: Category;
  scheduleType: ScheduleType;
  scheduleValue: number | null;
  nextDueDate: string; // ISO date string
  lastCompletedDate: string | null;
  notes: string | null;
  cost: number | null;
  completionCount: number;
  householdId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: TaskUser;
}

export interface TaskUser {
  id: string;
  name: string | null;
  email: string;
}

// Task input types
export interface CreateTaskInput {
  title: string;
  category: Category;
  scheduleType: ScheduleType;
  scheduleValue: number | null;
  nextDueDate: string;
  notes?: string | null;
  cost?: number | null;
  shareWithHousehold?: boolean;
}

export interface UpdateTaskInput extends CreateTaskInput {
  id: string;
}

// Household types
export interface Household {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members?: HouseholdMember[];
  invites?: HouseholdInvite[];
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: HouseholdRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface HouseholdInvite {
  id: string;
  householdId: string;
  email: string;
  invitedBy: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// Analytics types
export interface AnalyticsData {
  totalTasks: number;
  completedThisMonth: number;
  overdueCount: number;
  upcomingCount: number;
  totalAnnualCost: number;
  costByCategory: { category: Category; cost: number; taskCount: number }[];
  tasksByCategory: { category: Category; count: number }[];
  tasksByScheduleType: { type: string; count: number }[];
  completionHistory: { month: string; completions: number }[];
  lifeAdminScore: number;
  scoreBreakdown: {
    onTimeCompletions: number;
    taskCoverage: number;
    reminderSetup: number;
  };
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Constants
export const FREE_TASK_LIMIT = 5;

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "FINANCE", label: "Finance", emoji: "💰" },
  { value: "LEGAL", label: "Legal", emoji: "📋" },
  { value: "HOME", label: "Home", emoji: "🏠" },
  { value: "HEALTH", label: "Health", emoji: "🏥" },
  { value: "DIGITAL", label: "Digital", emoji: "💻" },
  { value: "OTHER", label: "Other", emoji: "📌" },
];

export const SCHEDULE_TYPES: { value: ScheduleType; label: string }[] = [
  { value: "FIXED_DATE", label: "One-time" },
  { value: "EVERY_N_MONTHS", label: "Every N months" },
  { value: "YEARLY", label: "Yearly on specific date" },
];
