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
import { theme, categoryConfig } from "../../src/theme/colors";
import { getScheduleDescription, type Task } from "@lifeops/shared";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function TaskCard({ task, onComplete, onUncomplete }: { task: Task; onComplete: () => void; onUncomplete: () => void }) {
  const isCompleted = task.lastCompletedDate !== null;
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.nextDueDate));
  const daysUntilDue = differenceInDays(dueDate, today);

  const category = categoryConfig[task.category as keyof typeof categoryConfig];

  const getDueStatusColor = () => {
    if (daysUntilDue < 0) return theme.destructive;
    if (daysUntilDue <= 3) return theme.warning;
    if (daysUntilDue <= 7) return theme.primary;
    return theme.mutedForeground;
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
        <TouchableOpacity style={styles.undoButton} onPress={onUncomplete}>
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
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
              <Text style={styles.categoryText}>{category.emoji} {category.label}</Text>
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

  const uncompleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.post(`/tasks/${taskId}/uncomplete`);
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
    if (tasks.length === 0) {
      return "Ready to get organized? Add your first task.";
    }
    return `You have ${tasks.length} task${tasks.length === 1 ? "" : "s"} to manage.`;
  };

  if (isLoading && !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
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
            onUncomplete={() => uncompleteMutation.mutate(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
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
    backgroundColor: theme.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
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
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },
  statCardDanger: {
    borderColor: theme.destructive,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.foreground,
  },
  statValueDanger: {
    color: theme.destructive,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.3)",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: theme.primaryForeground,
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
    backgroundColor: theme.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  schedule: {
    color: theme.mutedForeground,
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  title: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.mutedForeground,
    textDecorationLine: "line-through",
  },
  notes: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  dueDate: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.muted,
  },
  undoText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
  },
  empty: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  emptyButton: {
    marginTop: 12,
    backgroundColor: theme.foreground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: theme.background,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: theme.primaryForeground,
    fontSize: 28,
    fontFamily: "SpaceGrotesk_400Regular",
    marginTop: -2,
  },
});
