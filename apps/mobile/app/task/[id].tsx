import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import apiClient from "../../src/api/client";
import { theme } from "../../src/theme/colors";
import { CATEGORIES, SCHEDULE_TYPES, type Category, type ScheduleType, type Task } from "@lifeops/shared";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("OTHER");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("FIXED_DATE");
  const [scheduleValue, setScheduleValue] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data.task as Task;
    },
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      setScheduleType(task.scheduleType);
      setScheduleValue(task.scheduleValue?.toString() || "");
      setNextDueDate(format(new Date(task.nextDueDate), "yyyy-MM-dd"));
      setNotes(task.notes || "");
      setCost(task.cost?.toString() || "");
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.put(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      router.back();
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update task");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.back();
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to delete task");
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const data: Record<string, unknown> = {
      title: title.trim(),
      category,
      scheduleType,
      scheduleValue: scheduleValue ? parseInt(scheduleValue) : null,
      nextDueDate,
      notes: notes.trim() || null,
      cost: cost ? parseFloat(cost) : null,
    };

    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={updateMutation.isPending}
        >
          <Text
            style={[
              styles.saveButton,
              updateMutation.isPending && styles.saveButtonDisabled,
            ]}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor={theme.mutedForeground}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.chip,
                    category === cat.value && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={[styles.chipText, category === cat.value && styles.chipTextSelected]}>
                    {cat.emoji} {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Schedule Type</Text>
          <View style={styles.chipRow}>
            {SCHEDULE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.chip,
                  scheduleType === type.value && styles.chipSelected,
                ]}
                onPress={() => setScheduleType(type.value)}
              >
                <Text style={[styles.chipText, scheduleType === type.value && styles.chipTextSelected]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {scheduleType === "EVERY_N_MONTHS" && (
          <View style={styles.field}>
            <Text style={styles.label}>Every N Months</Text>
            <TextInput
              style={styles.input}
              value={scheduleValue}
              onChangeText={setScheduleValue}
              placeholder="e.g., 3 for quarterly"
              keyboardType="number-pad"
              placeholderTextColor={theme.mutedForeground}
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            value={nextDueDate}
            onChangeText={setNextDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.mutedForeground}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cost (optional)</Text>
          <View style={styles.costInput}>
            <Text style={styles.costPrefix}>$</Text>
            <TextInput
              style={[styles.input, styles.costField]}
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.mutedForeground}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes..."
            placeholderTextColor={theme.mutedForeground}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Text style={styles.deleteButtonText}>
            {deleteMutation.isPending ? "Deleting..." : "Delete Task"}
          </Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  cancelButton: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  saveButton: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 20,
  },
  error: {
    color: theme.destructive,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    borderColor: theme.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  chipTextSelected: {
    color: theme.primary,
  },
  costInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  costPrefix: {
    position: "absolute",
    left: 16,
    zIndex: 1,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  costField: {
    flex: 1,
    paddingLeft: 32,
  },
  deleteButton: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.destructive,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.destructive,
  },
});
