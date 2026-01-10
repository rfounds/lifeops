"use client";

import { useState } from "react";
import { Task, Category } from "@prisma/client";
import { getUserTasks } from "@/actions/tasks";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { DashboardStats, FilterType } from "@/components/DashboardStats";
import { differenceInDays, startOfDay, startOfWeek } from "date-fns";

type TaskWithUser = Task & {
  user: { id: string; name: string | null; email: string };
};

type DashboardClientProps = {
  initialTasks: TaskWithUser[];
  canCreate: boolean;
  taskCount: number;
  taskLimit: number | null;
  householdId: string | null;
  currentUserId: string;
};

const categories: { value: Category | "ALL"; label: string; emoji: string }[] = [
  { value: "ALL", label: "All", emoji: "" },
  { value: "FINANCE", label: "Finance", emoji: "💰" },
  { value: "LEGAL", label: "Legal", emoji: "📋" },
  { value: "HOME", label: "Home", emoji: "🏠" },
  { value: "HEALTH", label: "Health", emoji: "🏥" },
  { value: "DIGITAL", label: "Digital", emoji: "💻" },
  { value: "OTHER", label: "Other", emoji: "📌" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type ViewMode = "list" | "grid";

export function DashboardClient({
  initialTasks,
  canCreate,
  taskCount,
  taskLimit,
  householdId,
  currentUserId,
}: DashboardClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithUser | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statsFilter, setStatsFilter] = useState<FilterType>("all");

  async function refreshTasks() {
    const newTasks = await getUserTasks();
    setTasks(newTasks);
  }

  const today = startOfDay(new Date());

  // Calculate overdue for motivational message
  const overdueCount = tasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    return differenceInDays(dueDate, today) < 0;
  }).length;

  const getMotivationalMessage = () => {
    if (overdueCount === 0 && tasks.length > 0) {
      return "You're all caught up! Great job staying on top of things.";
    }
    if (overdueCount === 1) {
      return "You have 1 task that needs attention.";
    }
    if (overdueCount > 1) {
      return `You have ${overdueCount} tasks that need attention.`;
    }
    return `You have ${tasks.length} task${tasks.length === 1 ? "" : "s"} to manage.`;
  };

  const weekStart = startOfWeek(today);

  // Apply stats filter first
  const statsFilteredTasks = (() => {
    switch (statsFilter) {
      case "due-week":
        return tasks.filter((task) => {
          const dueDate = startOfDay(new Date(task.nextDueDate));
          const days = differenceInDays(dueDate, today);
          return days >= 0 && days <= 7;
        });
      case "overdue":
        return tasks.filter((task) => {
          const dueDate = startOfDay(new Date(task.nextDueDate));
          return differenceInDays(dueDate, today) < 0;
        });
      case "completed-week":
        return tasks.filter((task) => {
          if (!task.lastCompletedDate) return false;
          const completedDate = startOfDay(new Date(task.lastCompletedDate));
          return completedDate >= weekStart;
        });
      default:
        return tasks;
    }
  })();

  // Then filter by category
  const filteredTasks = selectedCategory === "ALL"
    ? statsFilteredTasks
    : statsFilteredTasks.filter((task) => task.category === selectedCategory);

  const overdueTasks = filteredTasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    return differenceInDays(dueDate, today) < 0;
  });

  const dueSoonTasks = filteredTasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    const days = differenceInDays(dueDate, today);
    return days >= 0 && days <= 30;
  });

  const laterTasks = filteredTasks.filter((task) => {
    const dueDate = startOfDay(new Date(task.nextDueDate));
    const days = differenceInDays(dueDate, today);
    return days > 30;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] bg-clip-text text-transparent">
            {getGreeting()}
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1 text-sm sm:text-base">
            {tasks.length === 0
              ? "Ready to get organized? Add your first task."
              : getMotivationalMessage()}
            {taskLimit !== null && (
              <span className="ml-2 text-sm opacity-60">
                ({taskCount}/{taskLimit} tasks)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!canCreate}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none font-medium transition-all duration-200 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Stats Section */}
      <DashboardStats
        tasks={tasks}
        activeFilter={statsFilter}
        onFilterClick={setStatsFilter}
      />

      {/* Category Filter & View Toggle */}
      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
            {categories.map((cat) => {
              const count = cat.value === "ALL"
                ? tasks.length
                : tasks.filter((t) => t.category === cat.value).length;

              if (cat.value !== "ALL" && count === 0) return null;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat.value
                      ? "bg-[rgb(var(--primary))] text-white border-transparent"
                      : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:scale-[1.02] text-[rgb(var(--foreground))]"
                  }`}
                >
                  {cat.emoji && <span>{cat.emoji}</span>}
                  {cat.label}
                  <span className={`${selectedCategory === cat.value ? "text-white/70" : "text-[rgb(var(--muted-foreground))]"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[rgb(var(--muted))] rounded-lg flex-shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm"
                  : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm"
                  : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              }`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!canCreate && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-xl mb-6 text-sm">
          You&apos;ve reached the free plan limit of 5 tasks.{" "}
          <a href="/pricing" className="underline font-medium hover:no-underline">
            Upgrade to Pro
          </a>{" "}
          for unlimited tasks.
        </div>
      )}

      <div className="space-y-8">
        {overdueTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Overdue ({overdueTasks.length})
            </h2>
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {overdueTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setShowForm(true);
                  }}
                  onComplete={refreshTasks}
                  viewMode={viewMode}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </section>
        )}

        {dueSoonTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-3">
              Due Soon ({dueSoonTasks.length})
            </h2>
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {dueSoonTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setShowForm(true);
                  }}
                  onComplete={refreshTasks}
                  viewMode={viewMode}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </section>
        )}

        {laterTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-3">
              Later ({laterTasks.length})
            </h2>
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {laterTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setShowForm(true);
                  }}
                  onComplete={refreshTasks}
                  viewMode={viewMode}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </section>
        )}

        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-12 animate-fade-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgb(var(--muted))] flex items-center justify-center">
              <svg className="w-8 h-8 text-[rgb(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
              </svg>
            </div>
            <p className="text-[rgb(var(--muted-foreground))] font-medium">
              No tasks in this category
            </p>
          </div>
        )}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16 sm:py-24 animate-fade-slide-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[rgb(var(--primary)_/_0.1)] to-[rgb(var(--accent)_/_0.1)] flex items-center justify-center">
            <svg className="w-12 h-12 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
            Start fresh, stay organized
          </h2>
          <p className="text-[rgb(var(--muted-foreground))] mb-8 max-w-md mx-auto">
            Add your first life admin task and never miss an important deadline again.
            We&apos;ll remind you when it&apos;s time.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add your first task
          </button>
          <div className="mt-10 pt-8 border-t border-[rgb(var(--border))] max-w-lg mx-auto">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
              Not sure where to start? Try these common tasks:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Insurance renewal", "Tax filing", "Doctor checkup", "Car registration"].map((suggestion) => (
                <span
                  key={suggestion}
                  className="px-3 py-1.5 bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] text-sm rounded-lg"
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSuccess={refreshTasks}
          canCreate={canCreate}
          householdId={householdId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
