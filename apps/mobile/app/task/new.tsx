import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import apiClient from "../../src/api/client";
import { colors, categoryConfig } from "../../src/theme/colors";
import { CATEGORIES, SCHEDULE_TYPES, type Category, type ScheduleType } from "@lifeops/shared";

export default function NewTaskScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("OTHER");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("FIXED_DATE");
  const [scheduleValue, setScheduleValue] = useState("");
  const [nextDueDate, setNextDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/tasks", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.back();
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create task");
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

    createMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Task</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Text
              style={[
                styles.saveButton,
                createMutation.isPending && styles.saveButtonDisabled,
              ]}
            >
              {createMutation.isPending ? "Saving..." : "Save"}
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
              placeholderTextColor={colors.light.mutedForeground}
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
                    <Text>{cat.emoji} {cat.label}</Text>
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
                  <Text>{type.label}</Text>
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
                placeholderTextColor={colors.light.mutedForeground}
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
              placeholderTextColor={colors.light.mutedForeground}
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
                placeholderTextColor={colors.light.mutedForeground}
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
              placeholderTextColor={colors.light.mutedForeground}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.card,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.light.foreground,
  },
  cancelButton: {
    fontSize: 17,
    color: colors.light.mutedForeground,
  },
  saveButton: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.light.primary,
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
    color: colors.light.destructive,
    fontSize: 14,
    backgroundColor: `${colors.light.destructive}15`,
    padding: 12,
    borderRadius: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.foreground,
  },
  input: {
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.light.foreground,
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
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: `${colors.light.primary}15`,
    borderColor: colors.light.primary,
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
    color: colors.light.mutedForeground,
  },
  costField: {
    flex: 1,
    paddingLeft: 32,
  },
});
