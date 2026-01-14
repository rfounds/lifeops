import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { theme } from "../src/theme/colors";
import { Button } from "../src/components/ui";
import { useToast } from "../src/context/ToastContext";
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
  registerForPushNotifications,
  cancelAllReminders,
} from "../src/services/notifications";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const DAYS_BEFORE_OPTIONS = [
  { label: "Same day", value: 0 },
  { label: "1 day before", value: 1 },
  { label: "2 days before", value: 2 },
  { label: "3 days before", value: 3 },
  { label: "1 week before", value: 7 },
];

function TimePickerButton({
  hour,
  minute,
  onPress,
}: {
  hour: number;
  minute: number;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const formatTime = () => {
    const h = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const m = minute.toString().padStart(2, "0");
    return `${h}:${m} ${ampm}`;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.timeButton, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.timeButtonText}>{formatTime()}</Text>
      </Animated.View>
    </Pressable>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.chip,
          selected && styles.chipSelected,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function TimePicker({
  hour,
  minute,
  onChangeHour,
  onChangeMinute,
  visible,
  onClose,
}: {
  hour: number;
  minute: number;
  onChangeHour: (h: number) => void;
  onChangeMinute: (m: number) => void;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={styles.timePickerOverlay}>
      <View style={styles.timePicker}>
        <Text style={styles.timePickerTitle}>Select Time</Text>
        <View style={styles.timePickerRow}>
          <ScrollView style={styles.timePickerColumn} showsVerticalScrollIndicator={false}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.timeOption, hour === h && styles.timeOptionSelected]}
                onPress={() => onChangeHour(h)}
              >
                <Text style={[styles.timeOptionText, hour === h && styles.timeOptionTextSelected]}>
                  {(h % 12 || 12).toString().padStart(2, "0")} {h >= 12 ? "PM" : "AM"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView style={styles.timePickerColumn} showsVerticalScrollIndicator={false}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.timeOption, minute === m && styles.timeOptionSelected]}
                onPress={() => onChangeMinute(m)}
              >
                <Text style={[styles.timeOptionText, minute === m && styles.timeOptionTextSelected]}>
                  :{m.toString().padStart(2, "0")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Button onPress={onClose} fullWidth>
          Done
        </Button>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [showDigestTimePicker, setShowDigestTimePicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getNotificationSettings();
    setSettings(savedSettings);
    setIsLoading(false);
  };

  const checkPermissions = async () => {
    const token = await registerForPushNotifications();
    setHasPermission(token !== null);
  };

  const updateSetting = useCallback(
    async <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [settings]
  );

  const handleToggleEnabled = async (value: boolean) => {
    if (value && !hasPermission && Platform.OS !== "web") {
      const token = await registerForPushNotifications();
      if (!token) {
        showToast("Please enable notifications in device settings", "warning");
        return;
      }
      setHasPermission(true);
    }

    if (!value) {
      await cancelAllReminders();
    }

    // On web, just save the setting (notifications will work on native app)
    updateSetting("enabled", value);

    if (value && Platform.OS === "web") {
      showToast("Settings saved. Notifications will work on mobile.", "info");
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Enable Notifications */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders for upcoming and overdue tasks
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleEnabled}
                trackColor={{ false: theme.muted, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {settings.enabled && (
          <>
            {/* Reminder Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reminder Settings</Text>
              <View style={styles.card}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Reminder Time</Text>
                    <Text style={styles.settingDescription}>
                      When to send task reminders
                    </Text>
                  </View>
                  <TimePickerButton
                    hour={settings.reminderTime.hour}
                    minute={settings.reminderTime.minute}
                    onPress={() => setShowReminderTimePicker(true)}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingColumn}>
                  <Text style={styles.settingLabel}>Remind Me</Text>
                  <View style={styles.chipRow}>
                    {DAYS_BEFORE_OPTIONS.map((option) => (
                      <OptionChip
                        key={option.value}
                        label={option.label}
                        selected={settings.daysBefore === option.value}
                        onPress={() => updateSetting("daysBefore", option.value)}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Overdue Reminders</Text>
                    <Text style={styles.settingDescription}>
                      Get daily reminders for overdue tasks
                    </Text>
                  </View>
                  <Switch
                    value={settings.overdueReminders}
                    onValueChange={(value) => updateSetting("overdueReminders", value)}
                    trackColor={{ false: theme.muted, true: theme.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>

            {/* Daily Digest */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Digest</Text>
              <View style={styles.card}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Daily Summary</Text>
                    <Text style={styles.settingDescription}>
                      Get a daily overview of your upcoming tasks
                    </Text>
                  </View>
                  <Switch
                    value={settings.dailyDigest}
                    onValueChange={(value) => updateSetting("dailyDigest", value)}
                    trackColor={{ false: theme.muted, true: theme.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {settings.dailyDigest && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Digest Time</Text>
                        <Text style={styles.settingDescription}>
                          When to send the daily summary
                        </Text>
                      </View>
                      <TimePickerButton
                        hour={settings.digestTime.hour}
                        minute={settings.digestTime.minute}
                        onPress={() => setShowDigestTimePicker(true)}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </>
        )}

        {Platform.OS === "web" && settings.enabled && (
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionInfoText}>
              Push notifications will be sent when you use the mobile app on your phone.
            </Text>
          </View>
        )}

        {Platform.OS !== "web" && !hasPermission && settings.enabled && (
          <View style={styles.permissionWarning}>
            <Text style={styles.permissionWarningText}>
              Notifications are not enabled on this device. Please enable them in your device settings.
            </Text>
          </View>
        )}
      </ScrollView>

      <TimePicker
        hour={settings.reminderTime.hour}
        minute={settings.reminderTime.minute}
        onChangeHour={(h) =>
          updateSetting("reminderTime", { ...settings.reminderTime, hour: h })
        }
        onChangeMinute={(m) =>
          updateSetting("reminderTime", { ...settings.reminderTime, minute: m })
        }
        visible={showReminderTimePicker}
        onClose={() => setShowReminderTimePicker(false)}
      />

      <TimePicker
        hour={settings.digestTime.hour}
        minute={settings.digestTime.minute}
        onChangeHour={(h) =>
          updateSetting("digestTime", { ...settings.digestTime, hour: h })
        }
        onChangeMinute={(m) =>
          updateSetting("digestTime", { ...settings.digestTime, minute: m })
        }
        visible={showDigestTimePicker}
        onClose={() => setShowDigestTimePicker(false)}
      />
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
  },
  loadingText: {
    color: theme.mutedForeground,
    fontFamily: "SpaceGrotesk_400Regular",
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
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.primary,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingColumn: {
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 16,
  },
  timeButton: {
    backgroundColor: theme.muted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.muted,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontFamily: "SpaceGrotesk_500Medium",
  },
  permissionInfo: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.3)",
  },
  permissionInfoText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.primary,
    textAlign: "center",
  },
  permissionWarning: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  permissionWarningText: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.warning,
    textAlign: "center",
  },
  timePickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  timePicker: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    textAlign: "center",
    marginBottom: 16,
  },
  timePickerRow: {
    flexDirection: "row",
    height: 200,
    marginBottom: 16,
  },
  timePickerColumn: {
    flex: 1,
  },
  timeOption: {
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  timeOptionSelected: {
    backgroundColor: theme.primary,
  },
  timeOptionText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  timeOptionTextSelected: {
    color: "#FFFFFF",
    fontFamily: "SpaceGrotesk_500Medium",
  },
});
