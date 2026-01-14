import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { format, differenceInDays, startOfDay } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../src/context/AuthContext";
import { useToast } from "../../src/context/ToastContext";
import apiClient from "../../src/api/client";
import { theme, categoryConfig, gradientColors } from "../../src/theme/colors";
import { Logo } from "../../src/components/Logo";
import { Button, AnimatedCheckbox, AnimatedFAB } from "../../src/components/ui";
import { useNotifications } from "../../src/hooks/useNotifications";
import { getScheduleDescription, type Task } from "@lifeops/shared";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function TaskCard({
  task,
  onComplete,
  onUncomplete,
  isCompletePending,
  isUncompletePending,
}: {
  task: Task;
  onComplete: () => void;
  onUncomplete: () => void;
  isCompletePending: boolean;
  isUncompletePending: boolean;
}) {
  const isCompleted = task.lastCompletedDate !== null;
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(task.nextDueDate));
  const daysUntilDue = differenceInDays(dueDate, today);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const editScaleAnim = useRef(new Animated.Value(1)).current;
  const undoScaleAnim = useRef(new Animated.Value(1)).current;

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

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const handleEditPressIn = useCallback(() => {
    Animated.spring(editScaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [editScaleAnim]);

  const handleEditPressOut = useCallback(() => {
    Animated.spring(editScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  }, [editScaleAnim]);

  const handleUndoPressIn = useCallback(() => {
    Animated.spring(undoScaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [undoScaleAnim]);

  const handleUndoPressOut = useCallback(() => {
    Animated.spring(undoScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [undoScaleAnim]);

  const handleUndoPress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onUncomplete();
  }, [onUncomplete]);

  const handleEditPress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/task/${task.id}`);
  }, [task.id]);

  if (isCompleted) {
    return (
      <Animated.View style={[styles.completedCard, { transform: [{ scale: scaleAnim }] }]}>
        <AnimatedCheckbox
          checked={true}
          onPress={onUncomplete}
          loading={isUncompletePending}
        />
        <View style={styles.cardContent}>
          <Text style={styles.completedTitle}>{task.title}</Text>
          <Text style={styles.meta}>
            {getScheduleDescription(task.scheduleType, task.scheduleValue)}
          </Text>
        </View>
        <Pressable
          onPress={handleUndoPress}
          onPressIn={handleUndoPressIn}
          onPressOut={handleUndoPressOut}
          disabled={isUncompletePending}
        >
          <Animated.View style={[styles.undoButton, { transform: [{ scale: undoScaleAnim }] }]}>
            {isUncompletePending ? (
              <ActivityIndicator size="small" color={theme.foreground} />
            ) : (
              <Text style={styles.undoText}>Undo</Text>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isCompletePending}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <AnimatedCheckbox
          checked={false}
          onPress={onComplete}
          loading={isCompletePending}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: "rgba(192, 132, 252, 0.15)" }]}>
              <Text style={[styles.categoryText, { color: theme.accent }]}>
                {category.emoji} {category.label}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{task.title}</Text>
          {task.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {task.notes}
            </Text>
          )}
          <View style={styles.taskFooter}>
            <Text style={[styles.dueDate, { color: getDueStatusColor() }]}>
              {getDueText()}
            </Text>
            <Text style={styles.schedule}>
              {getScheduleDescription(task.scheduleType, task.scheduleValue)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleEditPress}
          onPressIn={handleEditPressIn}
          onPressOut={handleEditPressOut}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={[styles.editIconContainer, { transform: [{ scale: editScaleAnim }] }]}>
            <Text style={styles.editIcon}>✎</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your life admin by adding your first task
      </Text>
      <View style={styles.emptyButtonContainer}>
        <Link href="/task/new" asChild>
          <Button onPress={() => {}}>Add your first task</Button>
        </Link>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const {
    scheduleNotificationsForTasks,
    cancelNotificationForTask,
    initializeNotifications,
  } = useNotifications();

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks");
      return response.data.tasks as Task[];
    },
  });

  // Schedule notifications when tasks are fetched
  useEffect(() => {
    if (data && data.length > 0) {
      scheduleNotificationsForTasks(data);
    }
  }, [data, scheduleNotificationsForTasks]);

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setPendingTaskId(taskId);
      await apiClient.post(`/tasks/${taskId}/complete`);
    },
    onSuccess: async (_, taskId) => {
      // Cancel the notification for this task
      await cancelNotificationForTask(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      const task = data?.find((t) => t.id === taskId);
      showToast(`"${task?.title}" marked complete`, "success");
      setPendingTaskId(null);
    },
    onError: () => {
      showToast("Failed to complete task", "error");
      setPendingTaskId(null);
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setPendingTaskId(taskId);
      await apiClient.post(`/tasks/${taskId}/uncomplete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Task marked incomplete", "info");
      setPendingTaskId(null);
    },
    onError: () => {
      showToast("Failed to undo completion", "error");
      setPendingTaskId(null);
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Logo size="sm" />
          <View style={styles.headerUser}>
            <Text style={styles.userName}>{user?.name?.split(" ")[0]}</Text>
            {user?.plan === "PRO" && (
              <LinearGradient
                colors={[gradientColors.primary, gradientColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.proBadge}
              >
                <Text style={styles.proBadgeText}>PRO</Text>
              </LinearGradient>
            )}
          </View>
        </View>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
      </View>

      {/* Stats */}
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

      {/* Task List */}
      <FlatList
        data={[...pendingTasks, ...completedTasks]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={() => completeMutation.mutate(item.id)}
            onUncomplete={() => uncompleteMutation.mutate(item.id)}
            isCompletePending={pendingTaskId === item.id && completeMutation.isPending}
            isUncompletePending={pendingTaskId === item.id && uncompleteMutation.isPending}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={[
          styles.list,
          tasks.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={<EmptyState />}
      />

      {/* FAB */}
      <AnimatedFAB href="/task/new" />
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
  headerContainer: {
    padding: 20,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.mutedForeground,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#FFFFFF",
  },
  greeting: {
    fontSize: 28,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.foreground,
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
    paddingBottom: 90,
  },
  listEmpty: {
    flex: 1,
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
    backgroundColor: "rgba(129, 140, 248, 0.08)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.2)",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
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
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.mutedForeground,
    textDecorationLine: "line-through",
  },
  notes: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  dueDate: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.muted,
    minWidth: 50,
    alignItems: "center",
  },
  undoText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
  },
  editIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    fontSize: 16,
    color: theme.mutedForeground,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  emptyButtonContainer: {
    width: "100%",
    paddingHorizontal: 40,
  },
});
