"use client";

import { AnalyticsData } from "@/actions/analytics";
import { Category } from "@prisma/client";

const categoryConfig: Record<Category, { label: string; emoji: string; color: string }> = {
  FINANCE: { label: "Finance", emoji: "💰", color: "rgb(34, 197, 94)" },
  LEGAL: { label: "Legal", emoji: "📋", color: "rgb(59, 130, 246)" },
  HOME: { label: "Home", emoji: "🏠", color: "rgb(249, 115, 22)" },
  HEALTH: { label: "Health", emoji: "🏥", color: "rgb(239, 68, 68)" },
  DIGITAL: { label: "Digital", emoji: "💻", color: "rgb(168, 85, 247)" },
  OTHER: { label: "Other", emoji: "📌", color: "rgb(107, 114, 128)" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "rgb(34, 197, 94)";
    if (score >= 60) return "rgb(234, 179, 8)";
    if (score >= 40) return "rgb(249, 115, 22)";
    return "rgb(239, 68, 68)";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[rgb(var(--foreground))]">{score}</span>
        <span className="text-xs text-[rgb(var(--muted-foreground))]">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function AnalyticsClient({ analytics }: { analytics: AnalyticsData }) {
  const maxCategoryCount = Math.max(...analytics.tasksByCategory.map((c) => c.count), 1);
  const maxCategoryCost = Math.max(...analytics.costByCategory.map((c) => c.cost), 1);
  const maxCompletions = Math.max(...analytics.completionHistory.map((c) => c.completions), 1);

  return (
    <div className="animate-fade-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-[rgb(var(--muted-foreground))] mt-2 text-sm sm:text-base">
          Track your life admin performance and costs
        </p>
      </div>

      {/* Life Admin Score */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={analytics.lifeAdminScore} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))] mb-4">Life Admin Score</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[rgb(var(--muted-foreground))]">Task Completion</span>
                  <span className="font-medium">{analytics.scoreBreakdown.onTimeCompletions}%</span>
                </div>
                <ProgressBar value={analytics.scoreBreakdown.onTimeCompletions} max={100} color="rgb(34, 197, 94)" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[rgb(var(--muted-foreground))]">Category Coverage</span>
                  <span className="font-medium">{analytics.scoreBreakdown.taskCoverage}%</span>
                </div>
                <ProgressBar value={analytics.scoreBreakdown.taskCoverage} max={100} color="rgb(59, 130, 246)" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[rgb(var(--muted-foreground))]">Reminders Active</span>
                  <span className="font-medium">{analytics.scoreBreakdown.reminderSetup}%</span>
                </div>
                <ProgressBar value={analytics.scoreBreakdown.reminderSetup} max={100} color="rgb(168, 85, 247)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{analytics.totalTasks}</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Total Tasks</p>
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{analytics.completedThisMonth}</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Completed This Month</p>
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{analytics.overdueCount}</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Overdue</p>
        </div>

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{analytics.upcomingCount}</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Due in 30 Days</p>
        </div>
      </div>

      {/* Cost Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Annual Cost Overview */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Annual Life Admin Cost</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Estimated yearly expenses</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-[rgb(var(--foreground))] mb-6">
            {formatCurrency(analytics.totalAnnualCost)}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            ~{formatCurrency(analytics.totalAnnualCost / 12)}/month
          </p>
        </div>

        {/* Cost by Category */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
          <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Cost by Category</h3>
          {analytics.costByCategory.length > 0 ? (
            <div className="space-y-3">
              {analytics.costByCategory.map((item) => {
                const config = categoryConfig[item.category];
                return (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span>{config.emoji}</span>
                        <span className="text-[rgb(var(--foreground))]">{config.label}</span>
                        <span className="text-[rgb(var(--muted-foreground))]">({item.taskCount} tasks)</span>
                      </span>
                      <span className="font-medium">{formatCurrency(item.cost)}</span>
                    </div>
                    <ProgressBar value={item.cost} max={maxCategoryCost} color={config.color} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[rgb(var(--muted-foreground))] text-sm">
              Add costs to your tasks to see breakdown
            </p>
          )}
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks by Category */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
          <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Tasks by Category</h3>
          <div className="space-y-3">
            {analytics.tasksByCategory.map((item) => {
              const config = categoryConfig[item.category];
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span>{config.emoji}</span>
                      <span className="text-[rgb(var(--foreground))]">{config.label}</span>
                    </span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <ProgressBar value={item.count} max={maxCategoryCount} color={config.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Schedule Type */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
          <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Tasks by Schedule Type</h3>
          <div className="space-y-3">
            {analytics.tasksByScheduleType.map((item, index) => {
              const colors = ["rgb(168, 85, 247)", "rgb(59, 130, 246)", "rgb(34, 197, 94)"];
              const maxSchedule = Math.max(...analytics.tasksByScheduleType.map((s) => s.count), 1);
              return (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(var(--foreground))]">{item.type}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <ProgressBar value={item.count} max={maxSchedule} color={colors[index % colors.length]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion History */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6">
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Completion History</h3>
        <div className="flex items-end gap-2 h-32">
          {analytics.completionHistory.map((item) => {
            const height = maxCompletions > 0 ? (item.completions / maxCompletions) * 100 : 0;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-[rgb(var(--primary))] to-[rgb(var(--accent))] rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-[rgb(var(--foreground))]">{item.completions}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">{item.month}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
