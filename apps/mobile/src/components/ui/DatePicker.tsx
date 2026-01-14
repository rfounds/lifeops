import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { theme } from "../../theme/colors";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleSelectDate = (date: Date) => {
    onChange(date);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.inputText}>
          {format(value, "MMMM d, yyyy")}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={styles.picker}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setViewDate(subMonths(viewDate, 1))}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {format(viewDate, "MMMM yyyy")}
              </Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setViewDate(addMonths(viewDate, 1))}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Week days */}
            <View style={styles.weekDays}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days grid */}
            <View style={styles.daysGrid}>
              {paddingDays.map((_, index) => (
                <View key={`pad-${index}`} style={styles.dayCell} />
              ))}
              {days.map((day) => {
                const isSelected = isSameDay(day, value);
                const isTodayDate = isToday(day);

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isTodayDate && !isSelected && styles.dayCellToday,
                    ]}
                    onPress={() => handleSelectDate(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isTodayDate && !isSelected && styles.dayTextToday,
                      ]}
                    >
                      {format(day, "d")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleSelectDate(new Date())}
              >
                <Text style={styles.quickButtonText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.quickButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  icon: {
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  picker: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 24,
    color: theme.foreground,
    marginTop: -2,
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.mutedForeground,
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellSelected: {
    backgroundColor: theme.primary,
    borderRadius: 20,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontFamily: "SpaceGrotesk_600SemiBold",
  },
  dayTextToday: {
    color: theme.primary,
    fontFamily: "SpaceGrotesk_600SemiBold",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  quickButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  quickButtonText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.primary,
  },
});
