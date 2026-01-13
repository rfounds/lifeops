import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../src/api/client";
import { theme, categoryConfig } from "../../src/theme/colors";
import type { AnalyticsData } from "@lifeops/shared";

function ScoreRing({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 80) return theme.success;
    if (score >= 60) return theme.primary;
    if (score >= 40) return theme.warning;
    return theme.destructive;
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <View style={styles.scoreContainer}>
      <View style={[styles.scoreRing, { borderColor: getScoreColor() }]}>
        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
          {score}
        </Text>
        <Text style={styles.scoreLabel}>{getScoreLabel()}</Text>
      </View>
    </View>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={styles.progressBarBg}>
      <View
        style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]}
      />
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export default function AnalyticsScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics");
      return response.data.analytics as AnalyticsData;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <Text style={styles.errorSubtext}>Make sure you have a Pro subscription</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxCategoryCount = Math.max(...data.tasksByCategory.map((c) => c.count), 1);
  const maxCategoryCost = Math.max(...data.costByCategory.map((c) => c.cost), 1);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Life Admin Score */}
        <View style={styles.scoreSection}>
          <ScoreRing score={data.lifeAdminScore} />
          <Text style={styles.sectionHeader}>Life Admin Score</Text>
        </View>

        {/* Score Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Task Completion</Text>
              <Text style={styles.breakdownValue}>{data.scoreBreakdown.onTimeCompletions}%</Text>
            </View>
            <ProgressBar value={data.scoreBreakdown.onTimeCompletions} max={100} color={theme.success} />
          </View>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Category Coverage</Text>
              <Text style={styles.breakdownValue}>{data.scoreBreakdown.taskCoverage}%</Text>
            </View>
            <ProgressBar value={data.scoreBreakdown.taskCoverage} max={100} color={theme.primary} />
          </View>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Reminders Active</Text>
              <Text style={styles.breakdownValue}>{data.scoreBreakdown.reminderSetup}%</Text>
            </View>
            <ProgressBar value={data.scoreBreakdown.reminderSetup} max={100} color={theme.accent} />
          </View>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Tasks" value={data.totalTasks} />
          <StatCard title="Completed" value={data.completedThisMonth} subtitle="This month" color={theme.success} />
          <StatCard title="Overdue" value={data.overdueCount} color={data.overdueCount > 0 ? theme.destructive : undefined} />
          <StatCard title="Upcoming" value={data.upcomingCount} subtitle="Next 30 days" />
        </View>

        {/* Annual Cost */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Annual Life Admin Cost</Text>
          <Text style={styles.totalCost}>{formatCurrency(data.totalAnnualCost)}</Text>
          <Text style={styles.costSubtitle}>~{formatCurrency(data.totalAnnualCost / 12)}/month</Text>
        </View>

        {/* Cost by Category */}
        {data.costByCategory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cost by Category</Text>
            {data.costByCategory.map((item) => {
              const config = categoryConfig[item.category as keyof typeof categoryConfig];
              return (
                <View key={item.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                    <Text style={styles.categoryName}>{config.label}</Text>
                    <Text style={styles.categoryMeta}>({item.taskCount} tasks)</Text>
                  </View>
                  <Text style={styles.categoryCost}>{formatCurrency(item.cost)}</Text>
                  <ProgressBar value={item.cost} max={maxCategoryCost} color={config.color} />
                </View>
              );
            })}
          </View>
        )}

        {/* Tasks by Category */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tasks by Category</Text>
          {data.tasksByCategory.map((item) => {
            const config = categoryConfig[item.category as keyof typeof categoryConfig];
            return (
              <View key={item.category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                  <Text style={styles.categoryName}>{config.label}</Text>
                  <Text style={styles.categoryCount}>{item.count}</Text>
                </View>
                <ProgressBar value={item.count} max={maxCategoryCount} color={config.color} />
              </View>
            );
          })}
        </View>

        {/* Completion History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completion History</Text>
          <View style={styles.historyChart}>
            {data.completionHistory.map((item) => {
              const maxCompletions = Math.max(...data.completionHistory.map((c) => c.completions), 1);
              const height = maxCompletions > 0 ? (item.completions / maxCompletions) * 80 : 4;
              return (
                <View key={item.month} style={styles.historyBar}>
                  <View style={[styles.historyBarFill, { height: Math.max(height, 4) }]} />
                  <Text style={styles.historyValue}>{item.completions}</Text>
                  <Text style={styles.historyLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  errorText: {
    color: theme.destructive,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_600SemiBold",
  },
  errorSubtext: {
    color: theme.mutedForeground,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    marginTop: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  scoreRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.card,
  },
  scoreValue: {
    fontSize: 44,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginBottom: 16,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  breakdownValue: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.muted,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    width: "47%",
  },
  statTitle: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.foreground,
  },
  statSubtitle: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginTop: 2,
  },
  totalCost: {
    fontSize: 36,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.foreground,
    textAlign: "center",
    marginBottom: 4,
  },
  costSubtitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    textAlign: "center",
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
    flex: 1,
  },
  categoryMeta: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginRight: 8,
  },
  categoryCost: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginBottom: 6,
  },
  categoryCount: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  historyChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 120,
    paddingTop: 8,
  },
  historyBar: {
    alignItems: "center",
    flex: 1,
  },
  historyBarFill: {
    width: 24,
    backgroundColor: theme.primary,
    borderRadius: 4,
    marginBottom: 8,
  },
  historyValue: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  historyLabel: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginTop: 4,
  },
});
