type Category = "FINANCE" | "LEGAL" | "HOME" | "HEALTH" | "DIGITAL" | "OTHER";
type ScheduleType = "FIXED_DATE" | "EVERY_N_MONTHS" | "YEARLY";
type Plan = "FREE" | "PRO";
type HouseholdRole = "OWNER" | "MEMBER";
interface User {
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
interface Task {
    id: string;
    userId: string;
    title: string;
    category: Category;
    scheduleType: ScheduleType;
    scheduleValue: number | null;
    nextDueDate: string;
    lastCompletedDate: string | null;
    notes: string | null;
    cost: number | null;
    completionCount: number;
    householdId: string | null;
    createdAt: string;
    updatedAt: string;
    user?: TaskUser;
}
interface TaskUser {
    id: string;
    name: string | null;
    email: string;
}
interface CreateTaskInput {
    title: string;
    category: Category;
    scheduleType: ScheduleType;
    scheduleValue: number | null;
    nextDueDate: string;
    notes?: string | null;
    cost?: number | null;
    shareWithHousehold?: boolean;
}
interface UpdateTaskInput extends CreateTaskInput {
    id: string;
}
interface Household {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    members?: HouseholdMember[];
    invites?: HouseholdInvite[];
}
interface HouseholdMember {
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
interface HouseholdInvite {
    id: string;
    householdId: string;
    email: string;
    invitedBy: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}
interface AnalyticsData {
    totalTasks: number;
    completedThisMonth: number;
    overdueCount: number;
    upcomingCount: number;
    totalAnnualCost: number;
    costByCategory: {
        category: Category;
        cost: number;
        taskCount: number;
    }[];
    tasksByCategory: {
        category: Category;
        count: number;
    }[];
    tasksByScheduleType: {
        type: string;
        count: number;
    }[];
    completionHistory: {
        month: string;
        completions: number;
    }[];
    lifeAdminScore: number;
    scoreBreakdown: {
        onTimeCompletions: number;
        taskCoverage: number;
        reminderSetup: number;
    };
}
interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    success: boolean;
}
interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
declare const FREE_TASK_LIMIT = 5;
declare const CATEGORIES: {
    value: Category;
    label: string;
    emoji: string;
}[];
declare const SCHEDULE_TYPES: {
    value: ScheduleType;
    label: string;
}[];

export { type AnalyticsData, type ApiResponse, type AuthResponse, CATEGORIES, type Category, type CreateTaskInput, FREE_TASK_LIMIT, type Household, type HouseholdInvite, type HouseholdMember, type HouseholdRole, type Plan, SCHEDULE_TYPES, type ScheduleType, type Task, type TaskUser, type UpdateTaskInput, type User };
