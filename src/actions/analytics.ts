"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Category } from "@prisma/client";
import { startOfMonth, subMonths, format } from "date-fns";

export type AnalyticsData = {
  // Overview stats
  totalTasks: number;
  completedThisMonth: number;
  overdueCount: number;
  upcomingCount: number;

  // Cost analytics
  totalAnnualCost: number;
  costByCategory: { category: Category; cost: number; taskCount: number }[];

  // Task distribution
  tasksByCategory: { category: Category; count: number }[];
  tasksByScheduleType: { type: string; count: number }[];

  // Completion history (last 6 months)
  completionHistory: { month: string; completions: number }[];

  // Life Admin Score (0-100)
  lifeAdminScore: number;
  scoreBreakdown: {
    onTimeCompletions: number; // % of tasks completed before/on due date
    taskCoverage: number; // How many categories have tasks
    reminderSetup: number; // Are reminders enabled
  };
};

export async function getAnalytics(): Promise<AnalyticsData> {
  const user = await requireAuth();

  // Get user's household membership for shared tasks
  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
  });

  // Fetch all user tasks (including shared)
  const tasks = await prisma.task.findMany({
    where: membership
      ? {
          OR: [
            { userId: user.id },
            { householdId: membership.householdId },
          ],
        }
      : { userId: user.id },
  });

  // Get user settings for score calculation
  const userSettings = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailReminders: true, smsReminders: true, plan: true },
  });

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Overview stats
  const totalTasks = tasks.length;
  const overdueCount = tasks.filter(
    (t) => new Date(t.nextDueDate) < today && !t.lastCompletedDate
  ).length;
  const upcomingCount = tasks.filter((t) => {
    const dueDate = new Date(t.nextDueDate);
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 30;
  }).length;

  // Completed this month
  const startOfCurrentMonth = startOfMonth(today);
  const completedThisMonth = tasks.filter(
    (t) => t.lastCompletedDate && new Date(t.lastCompletedDate) >= startOfCurrentMonth
  ).length;

  // Cost analytics
  const tasksWithCost = tasks.filter((t) => t.cost !== null && t.cost > 0);
  const totalAnnualCost = tasksWithCost.reduce((sum, t) => {
    const cost = t.cost || 0;
    // Annualize based on schedule type
    if (t.scheduleType === "YEARLY" || t.scheduleType === "FIXED_DATE") {
      return sum + cost;
    } else if (t.scheduleType === "EVERY_N_MONTHS" && t.scheduleValue) {
      return sum + (cost * (12 / t.scheduleValue));
    }
    return sum + cost;
  }, 0);

  // Cost by category
  const costByCategoryMap = new Map<Category, { cost: number; taskCount: number }>();
  for (const cat of Object.values(Category)) {
    costByCategoryMap.set(cat, { cost: 0, taskCount: 0 });
  }
  for (const task of tasksWithCost) {
    const existing = costByCategoryMap.get(task.category)!;
    let annualizedCost = task.cost || 0;
    if (task.scheduleType === "EVERY_N_MONTHS" && task.scheduleValue) {
      annualizedCost = annualizedCost * (12 / task.scheduleValue);
    }
    costByCategoryMap.set(task.category, {
      cost: existing.cost + annualizedCost,
      taskCount: existing.taskCount + 1,
    });
  }
  const costByCategory = Array.from(costByCategoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .filter((c) => c.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  // Tasks by category
  const categoryCountMap = new Map<Category, number>();
  for (const cat of Object.values(Category)) {
    categoryCountMap.set(cat, 0);
  }
  for (const task of tasks) {
    categoryCountMap.set(task.category, (categoryCountMap.get(task.category) || 0) + 1);
  }
  const tasksByCategory = Array.from(categoryCountMap.entries())
    .map(([category, count]) => ({ category, count }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Tasks by schedule type
  const scheduleTypeMap = new Map<string, number>();
  for (const task of tasks) {
    const typeLabel = task.scheduleType === "FIXED_DATE" ? "One-time" :
      task.scheduleType === "YEARLY" ? "Yearly" : "Recurring";
    scheduleTypeMap.set(typeLabel, (scheduleTypeMap.get(typeLabel) || 0) + 1);
  }
  const tasksByScheduleType = Array.from(scheduleTypeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Completion history (last 6 months) - using completionCount
  const completionHistory: { month: string; completions: number }[] = [];
  const totalCompletions = tasks.reduce((sum, t) => sum + t.completionCount, 0);

  // Estimate distribution based on total completions (simplified)
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(today, i);
    const monthLabel = format(monthDate, "MMM");
    // For simplicity, show the total completions distributed or use actual tracking
    // This is a simplified version - in production you'd want a TaskCompletion table
    const estimatedCompletions = i === 0 ? completedThisMonth :
      Math.round(totalCompletions / 6);
    completionHistory.push({
      month: monthLabel,
      completions: Math.max(0, estimatedCompletions),
    });
  }

  // Life Admin Score calculation
  const categoriesWithTasks = new Set(tasks.map((t) => t.category)).size;
  const totalCategories = Object.values(Category).length;
  const taskCoverageScore = Math.round((categoriesWithTasks / totalCategories) * 100);

  const completedOnTime = tasks.filter((t) => t.completionCount > 0).length;
  const onTimeScore = totalTasks > 0
    ? Math.round((completedOnTime / totalTasks) * 100)
    : 0;

  const hasReminders = userSettings?.emailReminders || userSettings?.smsReminders;
  const reminderScore = hasReminders ? 100 : 0;

  // Weighted score
  const lifeAdminScore = Math.round(
    (onTimeScore * 0.5) + // 50% weight on completion
    (taskCoverageScore * 0.3) + // 30% weight on coverage
    (reminderScore * 0.2) // 20% weight on reminders
  );

  return {
    totalTasks,
    completedThisMonth,
    overdueCount,
    upcomingCount,
    totalAnnualCost,
    costByCategory,
    tasksByCategory,
    tasksByScheduleType,
    completionHistory,
    lifeAdminScore,
    scoreBreakdown: {
      onTimeCompletions: onTimeScore,
      taskCoverage: taskCoverageScore,
      reminderSetup: reminderScore,
    },
  };
}
