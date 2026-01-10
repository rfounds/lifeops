import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { format, differenceInDays, startOfDay } from "date-fns";
import { useAuth } from "../../src/context/AuthContext";
import apiClient from "../../src/api/client";
import { colors, categoryConfig } from "../../src/theme/colors";
import { getScheduleDescription, type Task } from "@lifeops/shared";

function TaskCard({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const isCompleted = task.lastCompletedDate !== null;
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.nextDueDate));
  const daysUntilDue = differenceInDays(dueDate, today);

  const category = categoryConfig[task.category as keyof typeof categoryConfig];

  const getDueStatusColor = () => {
    if (daysUntilDue < 0) return colors.light.destructive;
    if (daysUntilDue <= 3) return colors.light.warning;
    if (daysUntilDue <= 7) return colors.light.primary;
    return colors.light.mutedForeground;
  };

  const getDueText = () => {
    const dateStr = format(dueDate, "MMM d");
    if (daysUntilDue < 0) return `${dateStr} (${Math.abs(daysUntilDue)}d overdue)`;
    if (daysUntilDue === 0) return "Today";
    if (daysUntilDue === 1) return "Tomorrow";
    if (daysUntilDue <= 7) return `${dateStr} (${daysUntilDue}d)`;
    return dateStr;
  };

  if (isCompleted) {
    return (
      <View style={styles.completedCard}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.completedTitle}>{task.title}</Text>
          <Text style={styles.meta}>
            {getScheduleDescription(task.scheduleType, task.scheduleValue)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.checkbox} onPress={onComplete} />
      <Link href={`/task/${task.id}`} asChild>
        <TouchableOpacity style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text>{category.emoji} {category.label}</Text>
            </View>
            <Text style={styles.schedule}>
              {getScheduleDescription(task.scheduleType, task.scheduleValue)}
            </Text>
          </View>
          <Text style={styles.title}>{task.title}</Text>
          {task.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {task.notes}
            </Text>
          )}
          <Text style={[styles.dueDate, { color: getDueStatusColor() }]}>
            {getDueText()}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks");
      return response.data.tasks as Task[];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.post(`/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setRefreshing(false);
  }, [queryClient]);

  const tasks = data || [];
  const pendingTasks = tasks.filter((t) => !t.lastCompletedDate);
  const completedTasks = tasks.filter((t) => t.lastCompletedDate);

  const overdueCount = pendingTasks.filter((t) => {
    const dueDate = new Date(t.nextDueDate);
    return dueDate < new Date();
  }).length;

  const upcomingCount = pendingTasks.filter((t) => {
    const dueDate = new Date(t.nextDueDate);
    const daysUntil = differenceInDays(dueDate, new Date());
    return daysUntil >= 0 && daysUntil <= 7;
  }).length;

  if (isLoading && !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || "there"}</Text>
        <Text style={styles.subtitle}>Your life admin tasks</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, overdueCount > 0 && styles.statCardDanger]}>
          <Text style={[styles.statValue, overdueCount > 0 && styles.statValueDanger]}>
            {overdueCount}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      <FlatList
        data={[...pendingTasks, ...completedTasks]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={() => completeMutation.mutate(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Link href="/task/new" asChild>
              <TouchableOpacity style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Add your first task</Text>
              </TouchableOpacity>
            </Link>
          </View>
        }
      />

      <Link href="/task/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
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
  header: {
    padding: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.light.foreground,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: "center",
  },
  statCardDanger: {
    borderColor: colors.light.destructive,
    backgroundColor: `${colors.light.destructive}10`,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.foreground,
  },
  statValueDanger: {
    color: colors.light.destructive,
  },
  statLabel: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    flexDirection: "row",
    gap: 12,
  },
  completedCard: {
    backgroundColor: `${colors.light.primary}10`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.light.primary}30`,
    flexDirection: "row",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.light.border,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: colors.light.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  schedule: {
    color: colors.light.mutedForeground,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.foreground,
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.mutedForeground,
    textDecorationLine: "line-through",
  },
  notes: {
    fontSize: 14,
    color: colors.light.mutedForeground,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: colors.light.mutedForeground,
  },
  dueDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  empty: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.light.mutedForeground,
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: -2,
  },
});
