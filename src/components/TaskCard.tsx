"use client";

import { useState } from "react";
import { format, differenceInDays, startOfDay } from "date-fns";
import { Task, Category } from "@prisma/client";
import { completeTask, deleteTask, uncompleteTask } from "@/actions/tasks";
import { getScheduleDescription } from "@/lib/schedule-utils";

const categoryConfig: Record<Category, { label: string; emoji: string }> = {
  FINANCE: { label: "Finance", emoji: "💰" },
  LEGAL: { label: "Legal", emoji: "📋" },
  HOME: { label: "Home", emoji: "🏠" },
  HEALTH: { label: "Health", emoji: "🏥" },
  DIGITAL: { label: "Digital", emoji: "💻" },
  OTHER: { label: "Other", emoji: "📌" },
};

type TaskWithUser = Task & {
  user?: { id: string; name: string | null; email: string };
  householdId?: string | null;
};

export function TaskCard({
  task,
  onEdit,
  onComplete,
  viewMode = "list",
  currentUserId,
}: {
  task: TaskWithUser;
  onEdit: (task: TaskWithUser) => void;
  onComplete?: () => void;
  viewMode?: "list" | "grid";
  currentUserId?: string;
}) {
  const isSharedTask = task.householdId !== null && task.householdId !== undefined;
  const isOwnTask = task.userId === currentUserId;
  const ownerName = task.user?.name || task.user?.email?.split("@")[0] || "Unknown";
  const [loading, setLoading] = useState<"complete" | "delete" | "undo" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if task is completed for current period (has lastCompletedDate set)
  const isCompletedForPeriod = task.lastCompletedDate !== null;

  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.nextDueDate));
  const daysUntilDue = differenceInDays(dueDate, today);
  const category = categoryConfig[task.category];

  const getDueStatus = () => {
    const fullDate = format(dueDate, "MMM d, yyyy");
    if (daysUntilDue < 0) {
      return {
        label: `${fullDate} (${Math.abs(daysUntilDue)}d overdue)`,
        className: "text-red-500 dark:text-red-400",
        dot: "bg-red-500",
      };
    }
    if (daysUntilDue === 0) {
      return { label: `${fullDate} (Today)`, className: "text-red-500 dark:text-red-400", dot: "bg-red-500" };
    }
    if (daysUntilDue === 1) {
      return { label: `${fullDate} (Tomorrow)`, className: "text-amber-500 dark:text-amber-400", dot: "bg-amber-500" };
    }
    if (daysUntilDue <= 7) {
      return { label: `${fullDate} (${daysUntilDue}d)`, className: "text-amber-500 dark:text-amber-400", dot: "bg-amber-500" };
    }
    if (daysUntilDue <= 30) {
      return { label: fullDate, className: "text-[rgb(var(--muted-foreground))]", dot: "bg-[rgb(var(--primary))]" };
    }
    return { label: fullDate, className: "text-[rgb(var(--muted-foreground))]", dot: "bg-gray-400" };
  };

  const dueStatus = getDueStatus();

  async function handleComplete() {
    setLoading("complete");
    const result = await completeTask(task.id);
    if (result.success) {
      onComplete?.();
    }
    setLoading(null);
  }

  async function handleUndo() {
    setLoading("undo");
    const result = await uncompleteTask(task.id);
    if (result.success) {
      onComplete?.();
    }
    setLoading(null);
  }

  async function handleDelete() {
    setShowDeleteConfirm(false);
    setLoading("delete");
    await deleteTask(task.id);
    setLoading(null);
  }

  // Show completed state with undo option
  if (isCompletedForPeriod) {
    return (
      <div className="bg-gradient-to-r from-[rgb(var(--primary)_/_0.08)] to-[rgb(var(--primary)_/_0.03)] border border-[rgb(var(--primary)_/_0.2)] rounded-xl p-4 transition-all duration-300">
        <div className="flex items-center gap-3 w-full">
          <div className="w-6 h-6 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[rgb(var(--primary)_/_0.3)]">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="line-through text-[rgb(var(--muted-foreground))] truncate block font-medium">{task.title}</span>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              Due {format(dueDate, "MMM d, yyyy")} · {getScheduleDescription(task.scheduleType, task.scheduleValue)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-[rgb(var(--primary))] font-medium">Done</span>
            <button
              onClick={handleUndo}
              disabled={loading !== null}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors disabled:opacity-50"
            >
              {loading === "undo" ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Undo"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Urgency styling
  const getUrgencyStyle = () => {
    if (viewMode === "grid") return "";
    if (daysUntilDue < 0) return "border-l-4 border-l-red-500";
    if (daysUntilDue <= 3) return "border-l-4 border-l-amber-500";
    if (daysUntilDue <= 7) return "border-l-4 border-l-[rgb(var(--primary))]";
    return "";
  };

  // Grid view layout
  if (viewMode === "grid") {
    return (
      <div
        onClick={() => {
          if (loading === null) handleComplete();
        }}
        className="group bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 hover:shadow-lg hover:border-[rgb(var(--primary)_/_0.3)] transition-all duration-200 cursor-pointer flex flex-col h-full"
      >
        {/* Header with emoji and due status */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-[rgb(var(--muted))] flex items-center justify-center text-2xl">
            {category.emoji}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${dueStatus.dot}`} />
            <span className={`text-sm font-medium ${dueStatus.className}`}>{dueStatus.label}</span>
          </div>
        </div>

        {/* Title and notes */}
        <div className="flex-1">
          <h3 className="font-semibold text-[rgb(var(--foreground))] break-words leading-snug mb-1">{task.title}</h3>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">
            {category.label} · {getScheduleDescription(task.scheduleType, task.scheduleValue)}
          </p>
          {task.notes && (
            <p className="text-sm text-[rgb(var(--muted-foreground))] break-words line-clamp-2 leading-relaxed">
              {task.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgb(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary))] group-hover:bg-[rgb(var(--primary)_/_0.1)] transition-all duration-200 flex items-center justify-center">
              {loading === "complete" && (
                <svg className="w-full h-full animate-spin text-[rgb(var(--primary))] p-0.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--primary))] transition-colors">
              Mark done
            </span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading !== null}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view layout (default)
  return (
    <div
      onClick={() => {
        if (loading === null) handleComplete();
      }}
      className={`group bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4 hover:shadow-md hover:border-[rgb(var(--primary)_/_0.3)] transition-all duration-200 cursor-pointer ${getUrgencyStyle()}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Complete indicator */}
        <div className="mt-1 w-5 h-5 rounded-full border-2 border-[rgb(var(--border))] group-hover:border-[rgb(var(--primary))] group-hover:bg-[rgb(var(--primary)_/_0.1)] group-hover:scale-110 transition-all duration-200 flex-shrink-0 flex items-center justify-center">
          {loading === "complete" && (
            <svg className="w-full h-full animate-spin text-[rgb(var(--primary))] p-0.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] flex items-center gap-1.5">
              <span>{category.emoji}</span>
              {category.label}
            </span>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">
              {getScheduleDescription(task.scheduleType, task.scheduleValue)}
            </span>
            {isSharedTask && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-[rgb(var(--primary)_/_0.1)] text-[rgb(var(--primary))]">
                {isOwnTask ? "Shared" : ownerName}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[rgb(var(--foreground))] break-words leading-snug">{task.title}</h3>
          {task.notes && (
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1.5 break-words line-clamp-2 leading-relaxed">
              {task.notes}
            </p>
          )}

          {/* Mobile: Due date and actions inline */}
          <div className="flex items-center justify-between mt-3 sm:hidden">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dueStatus.dot}`} />
              <span className={`text-sm font-medium ${dueStatus.className}`}>{dueStatus.label}</span>
            </div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading !== null}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Due date & actions */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${dueStatus.dot}`} />
            <span className={`text-sm font-medium ${dueStatus.className}`}>{dueStatus.label}</span>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading !== null}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete"
            >
              {loading === "delete" ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[rgb(var(--card))] rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl border border-[rgb(var(--border))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center text-[rgb(var(--foreground))] mb-2">
              Delete Task?
            </h3>
            <p className="text-sm text-center text-[rgb(var(--muted-foreground))] mb-6">
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-[rgb(var(--border))] rounded-xl hover:bg-[rgb(var(--muted))] transition-colors font-medium text-[rgb(var(--foreground))]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading === "delete"}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading === "delete" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
