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
import { parse, format } from "date-fns";
import apiClient from "../../src/api/client";
import { useToast } from "../../src/context/ToastContext";
import { theme } from "../../src/theme/colors";
import { Button, DatePicker } from "../../src/components/ui";
import { CATEGORIES, SCHEDULE_TYPES, type Category, type ScheduleType } from "@lifeops/shared";

export default function NewTaskScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("OTHER");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("FIXED_DATE");
  const [scheduleValue, setScheduleValue] = useState("");
  const [nextDueDate, setNextDueDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post("/tasks", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Task created successfully", "success");
      router.back();
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create task");
      showToast("Failed to create task", "error");
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (scheduleType === "EVERY_N_MONTHS" && !scheduleValue) {
      setError("Please specify how often this task repeats");
      return;
    }

    const data: Record<string, unknown> = {
      title: title.trim(),
      category,
      scheduleType,
      scheduleValue: scheduleValue ? parseInt(scheduleValue) : null,
      nextDueDate: format(nextDueDate, "yyyy-MM-dd"),
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
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            style={styles.cancelTouchable}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Task</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === "title" && styles.inputFocused,
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.mutedForeground}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.chip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat.emoji} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
              <Text style={styles.label}>Repeat Every</Text>
              <View style={styles.repeatRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.repeatInput,
                    focusedField === "scheduleValue" && styles.inputFocused,
                  ]}
                  value={scheduleValue}
                  onChangeText={setScheduleValue}
                  placeholder="3"
                  keyboardType="number-pad"
                  placeholderTextColor={theme.mutedForeground}
                  onFocus={() => setFocusedField("scheduleValue")}
                  onBlur={() => setFocusedField(null)}
                />
                <Text style={styles.repeatLabel}>months</Text>
              </View>
            </View>
          )}

          <DatePicker
            label="Due Date"
            value={nextDueDate}
            onChange={setNextDueDate}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Cost (optional)</Text>
            <View style={styles.costInput}>
              <Text style={styles.costPrefix}>$</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.costField,
                  focusedField === "cost" && styles.inputFocused,
                ]}
                value={cost}
                onChangeText={setCost}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.mutedForeground}
                onFocus={() => setFocusedField("cost")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <Text style={styles.hint}>Track annual cost for budgeting</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedField === "notes" && styles.inputFocused,
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any details, links, or reminders..."
              placeholderTextColor={theme.mutedForeground}
              multiline
              numberOfLines={4}
              onFocus={() => setFocusedField("notes")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.submitButton}>
            <Button
              onPress={handleSubmit}
              loading={createMutation.isPending}
              disabled={createMutation.isPending}
              fullWidth
            >
              Create Task
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  cancelTouchable: {
    padding: 4,
  },
  cancelButton: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    gap: 24,
  },
  errorContainer: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: 10,
    padding: 12,
  },
  error: {
    color: theme.destructive,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  hint: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
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
  inputFocused: {
    borderColor: theme.primary,
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
  categoryChipSelected: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  chipText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  chipTextSelected: {
    color: theme.primary,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  categoryChipTextSelected: {
    color: theme.background,
    fontFamily: "SpaceGrotesk_500Medium",
  },
  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  repeatInput: {
    width: 80,
    textAlign: "center",
  },
  repeatLabel: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
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
  submitButton: {
    marginTop: 8,
    paddingBottom: 32,
  },
});
