"use client";

import { Task } from "@prisma/client";
import { differenceInDays, startOfDay, startOfWeek } from "date-fns";

export type FilterType = "all" | "due-week" | "overdue" | "completed-week";

type DashboardStatsProps = {
  tasks: Task[];
  activeFilter?: FilterType;
  onFilterClick?: (filter: FilterType) => void;
};

export function DashboardStats({ tasks, activeFilter = "all", onFilterClick }: DashboardStatsProps) {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);

  // Calculate stats
  const completedThisWeek = tasks.filter((task) => {
    if (!task.lastCompletedDate) return false;
    const completedDate = startOfDay(new Date(task.lastCompletedDate));
    return completedDate >= weekStart;
  }).length;

  const overdueTasks = tasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    return differenceInDays(dueDate, today) < 0;
  });

  const upcomingThisWeek = tasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    const days = differenceInDays(dueDate, today);
    return days >= 0 && days <= 7;
  });

  const overdueCount = overdueTasks.length;
  const totalTasks = tasks.length;

  if (tasks.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-slide-up">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Due This Week"
          value={upcomingThisWeek.length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          isActive={activeFilter === "due-week"}
          onClick={() => onFilterClick?.(activeFilter === "due-week" ? "all" : "due-week")}
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
          isActive={activeFilter === "overdue"}
          onClick={() => onFilterClick?.(activeFilter === "overdue" ? "all" : "overdue")}
        />
        <StatCard
          label="Done This Week"
          value={completedThisWeek}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          isActive={activeFilter === "completed-week"}
          onClick={() => onFilterClick?.(activeFilter === "completed-week" ? "all" : "completed-week")}
        />
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          }
          isActive={activeFilter === "all"}
          onClick={() => onFilterClick?.("all")}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-[rgb(var(--card))] border rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
        isActive
          ? "border-[rgb(var(--primary))] ring-2 ring-[rgb(var(--primary)_/_0.2)]"
          : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary)_/_0.3)]"
      }`}
    >
      <div className="w-10 h-10 rounded-lg text-[rgb(var(--primary))] bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{value}</p>
      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{label}</p>
    </button>
  );
}
