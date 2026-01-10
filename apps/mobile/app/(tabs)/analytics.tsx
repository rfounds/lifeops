import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../src/api/client";
import { colors, categoryConfig } from "../../src/theme/colors";
import type { AnalyticsData } from "@lifeops/shared";

function ScoreRing({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 80) return colors.light.success;
    if (score >= 60) return colors.light.primary;
    if (score >= 40) return colors.light.warning;
    return colors.light.destructive;
  };

  return (
    <View style={styles.scoreContainer}>
      <View style={[styles.scoreRing, { borderColor: getScoreColor() }]}>
        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
          {score}
        </Text>
        <Text style={styles.scoreLabel}>Life Admin Score</Text>
      </View>
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScoreRing score={data.lifeAdminScore} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>On-time Completions</Text>
              <Text style={styles.breakdownValue}>
                {data.scoreBreakdown.onTimeCompletions}%
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Task Coverage</Text>
              <Text style={styles.breakdownValue}>
                {data.scoreBreakdown.taskCoverage}%
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Reminder Setup</Text>
              <Text style={styles.breakdownValue}>
                {data.scoreBreakdown.reminderSetup}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total Tasks" value={data.totalTasks} />
            <StatCard
              title="Completed"
              value={data.completedThisMonth}
              subtitle="This month"
            />
            <StatCard title="Overdue" value={data.overdueCount} />
            <StatCard title="Upcoming" value={data.upcomingCount} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Annual Costs</Text>
          <View style={styles.costCard}>
            <Text style={styles.totalCost}>
              {formatCurrency(data.totalAnnualCost)}
            </Text>
            <Text style={styles.costSubtitle}>Total estimated annual cost</Text>
          </View>
          {data.costByCategory.length > 0 && (
            <View style={styles.categoryList}>
              {data.costByCategory.map((item) => {
                const config =
                  categoryConfig[item.category as keyof typeof categoryConfig];
                return (
                  <View key={item.category} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                      <Text style={styles.categoryName}>{config.label}</Text>
                    </View>
                    <Text style={styles.categoryCost}>
                      {formatCurrency(item.cost)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks by Category</Text>
          <View style={styles.categoryList}>
            {data.tasksByCategory.map((item) => {
              const config =
                categoryConfig[item.category as keyof typeof categoryConfig];
              return (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                    <Text style={styles.categoryName}>{config.label}</Text>
                  </View>
                  <Text style={styles.categoryCount}>{item.count} tasks</Text>
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
    backgroundColor: colors.light.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light.background,
  },
  errorText: {
    color: colors.light.destructive,
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  scoreRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light.card,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.light.mutedForeground,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.foreground,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    width: "47%",
  },
  statTitle: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.foreground,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.light.mutedForeground,
    marginTop: 2,
  },
  costCard: {
    backgroundColor: `${colors.light.primary}10`,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  totalCost: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.light.primary,
  },
  costSubtitle: {
    fontSize: 14,
    color: colors.light.mutedForeground,
    marginTop: 4,
  },
  categoryList: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    overflow: "hidden",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    color: colors.light.foreground,
  },
  categoryCost: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.foreground,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.light.mutedForeground,
  },
});
