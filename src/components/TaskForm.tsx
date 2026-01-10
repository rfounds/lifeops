"use client";

import { useState } from "react";
import { Task, Category, ScheduleType } from "@prisma/client";
import { createTask, updateTask } from "@/actions/tasks";
import { format, addMonths } from "date-fns";
import { toMMDD, parseMMDD } from "@/lib/schedule-utils";

type TaskWithUser = Task & {
  user?: { id: string; name: string | null; email: string };
  householdId?: string | null;
};

type TaskFormProps = {
  task?: TaskWithUser | null;
  onClose: () => void;
  onSuccess: () => void;
  canCreate: boolean;
  householdId?: string | null;
  currentUserId?: string;
};

const categories: { value: Category; label: string }[] = [
  { value: "FINANCE", label: "Finance" },
  { value: "LEGAL", label: "Legal" },
  { value: "HOME", label: "Home" },
  { value: "HEALTH", label: "Health" },
  { value: "DIGITAL", label: "Digital" },
  { value: "OTHER", label: "Other" },
];

const scheduleTypes: { value: ScheduleType; label: string; desc: string }[] = [
  { value: "FIXED_DATE", label: "One-time", desc: "Single occurrence" },
  { value: "EVERY_N_MONTHS", label: "Recurring", desc: "Every N months" },
  { value: "YEARLY", label: "Yearly", desc: "Same date each year" },
];

export function TaskForm({ task, onClose, onSuccess, canCreate, householdId, currentUserId }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareWithHousehold, setShareWithHousehold] = useState(task?.householdId ? true : false);

  // Only show share toggle if user has a household and owns the task (or creating new)
  const canShare = householdId && (!task || task.userId === currentUserId);

  const [title, setTitle] = useState(task?.title || "");
  const [category, setCategory] = useState<Category>(task?.category || "OTHER");
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    task?.scheduleType || "FIXED_DATE"
  );
  const [scheduleValue, setScheduleValue] = useState<number | "">(
    task?.scheduleValue || ""
  );
  const [nextDueDate, setNextDueDate] = useState(() => {
    if (task?.nextDueDate) {
      // Use the date directly - it's already stored correctly
      const date = new Date(task.nextDueDate);
      return format(date, "yyyy-MM-dd");
    }
    // Default to 1 month from now at noon
    const defaultDate = addMonths(new Date(), 1);
    defaultDate.setHours(12, 0, 0, 0);
    return format(defaultDate, "yyyy-MM-dd");
  });
  const [yearlyMonth, setYearlyMonth] = useState(
    task?.scheduleType === "YEARLY" && task.scheduleValue
      ? parseMMDD(task.scheduleValue).month
      : 1
  );
  const [yearlyDay, setYearlyDay] = useState(
    task?.scheduleType === "YEARLY" && task.scheduleValue
      ? parseMMDD(task.scheduleValue).day
      : 1
  );
  const [notes, setNotes] = useState(task?.notes || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!canCreate && !task) {
      setError("You've reached the free plan limit of 5 tasks. Upgrade to Pro for unlimited tasks.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("title", title);
    formData.set("category", category);
    formData.set("scheduleType", scheduleType);
    formData.set("notes", notes);

    if (scheduleType === "EVERY_N_MONTHS") {
      formData.set("scheduleValue", String(scheduleValue || 1));
      formData.set("nextDueDate", nextDueDate);
    } else if (scheduleType === "YEARLY") {
      formData.set("scheduleValue", String(toMMDD(yearlyMonth, yearlyDay)));
      const now = new Date();
      let yearlyDate = new Date(now.getFullYear(), yearlyMonth - 1, yearlyDay);
      if (yearlyDate <= now) {
        yearlyDate = new Date(now.getFullYear() + 1, yearlyMonth - 1, yearlyDay);
      }
      formData.set("nextDueDate", format(yearlyDate, "yyyy-MM-dd"));
    } else {
      formData.set("nextDueDate", nextDueDate);
    }

    // Household sharing
    formData.set("shareWithHousehold", String(shareWithHousehold && canShare));

    const result = task
      ? await updateTask(task.id, formData)
      : await createTask(formData);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to save task");
    }

    setLoading(false);
  }

  const inputClass = "w-full px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200";
  const labelClass = "block text-sm font-medium mb-2 text-[rgb(var(--foreground))]";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div
        className="bg-[rgb(var(--card))] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[rgb(var(--border))] sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                {task ? "Edit Task" : "New Task"}
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">
                {task ? "Update your task details" : "Add a new life admin task to track"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g., Renew car insurance"
                autoFocus
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-2.5 sm:py-2 text-sm rounded-xl border transition-all duration-200 ${
                      category === cat.value
                        ? "bg-[rgb(var(--foreground))] text-[rgb(var(--background))] border-transparent"
                        : "border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)_/_0.3)] hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Schedule</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {scheduleTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setScheduleType(type.value)}
                    className={`px-3 py-3 sm:py-2.5 text-sm rounded-xl border transition-all duration-200 text-left ${
                      scheduleType === type.value
                        ? "bg-[rgb(var(--foreground))] text-[rgb(var(--background))] border-transparent"
                        : "border-[rgb(var(--border))] hover:border-[rgb(var(--foreground)_/_0.3)] hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className={`text-xs mt-0.5 ${scheduleType === type.value ? "opacity-70" : "text-[rgb(var(--muted-foreground))]"}`}>
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {scheduleType === "EVERY_N_MONTHS" && (
              <div>
                <label className={labelClass}>Repeat every</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={scheduleValue}
                    onChange={(e) =>
                      setScheduleValue(e.target.value ? parseInt(e.target.value) : "")
                    }
                    required
                    className={`${inputClass} w-20`}
                    placeholder="6"
                  />
                  <span className="text-[rgb(var(--muted-foreground))]">months</span>
                </div>
              </div>
            )}

            {scheduleType === "YEARLY" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Month</label>
                  <select
                    value={yearlyMonth}
                    onChange={(e) => setYearlyMonth(parseInt(e.target.value))}
                    className={inputClass}
                  >
                    {[
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December",
                    ].map((month, i) => (
                      <option key={i} value={i + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Day</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={yearlyDay}
                    onChange={(e) => setYearlyDay(parseInt(e.target.value))}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {(scheduleType === "FIXED_DATE" || scheduleType === "EVERY_N_MONTHS") && (
              <div>
                <label className={labelClass}>
                  {scheduleType === "FIXED_DATE" ? "Due Date" : "First Due Date"}
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Notes <span className="text-[rgb(var(--muted-foreground))] font-normal">(optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Any additional details..."
              />
            </div>

            {canShare && (
              <div className="flex items-center justify-between gap-4 p-4 bg-[rgb(var(--primary)_/_0.05)] border border-[rgb(var(--primary)_/_0.2)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[rgb(var(--foreground))]">Share with household</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Visible to all household members</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShareWithHousehold(!shareWithHousehold)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    shareWithHousehold ? "bg-[rgb(var(--primary))]" : "bg-[rgb(var(--muted))]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      shareWithHousehold ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-[rgb(var(--border))]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 sm:py-2.5 border border-[rgb(var(--border))] rounded-xl hover:bg-[rgb(var(--muted))] hover:scale-[1.02] transition-all duration-200 font-medium text-[rgb(var(--foreground))]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 sm:py-2.5 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : task ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
