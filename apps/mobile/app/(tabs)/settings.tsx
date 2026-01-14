import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useToast } from "../../src/context/ToastContext";
import { theme, gradientColors } from "../../src/theme/colors";
import { Button, ConfirmDialog } from "../../src/components/ui";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    showToast("Signed out successfully", "info");
  };

  const handleUpgrade = () => {
    showToast("Upgrade coming soon!", "info");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user?.name || "Not set"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Plan</Text>
              {user?.plan === "PRO" ? (
                <LinearGradient
                  colors={[gradientColors.primary, gradientColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.planBadgePro}
                >
                  <Text style={styles.planTextPro}>PRO</Text>
                </LinearGradient>
              ) : (
                <View style={styles.planBadge}>
                  <Text style={styles.planText}>FREE</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Upgrade Banner */}
        {user?.plan !== "PRO" && (
          <View style={styles.section}>
            <LinearGradient
              colors={["rgba(129, 140, 248, 0.15)", "rgba(192, 132, 252, 0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeCard}
            >
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeDescription}>
                  Unlock unlimited tasks, detailed analytics, household sharing, and custom reminders.
                </Text>
                <View style={styles.upgradeFeatures}>
                  <Text style={styles.upgradeFeature}>✓ Unlimited tasks</Text>
                  <Text style={styles.upgradeFeature}>✓ Analytics dashboard</Text>
                  <Text style={styles.upgradeFeature}>✓ Household sharing</Text>
                  <Text style={styles.upgradeFeature}>✓ Email & SMS reminders</Text>
                </View>
              </View>
              <View style={styles.upgradeButtonContainer}>
                <Button onPress={handleUpgrade} fullWidth>
                  Upgrade Now
                </Button>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/notifications")}
            >
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/about")}
            >
              <Text style={styles.menuText}>About LifeOps</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/privacy")}
            >
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/terms")}
            >
              <Text style={styles.menuText}>Terms of Service</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  value: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 16,
  },
  planBadge: {
    backgroundColor: theme.muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgePro: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.mutedForeground,
  },
  planTextPro: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_700Bold",
    color: "#FFFFFF",
  },
  upgradeCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.3)",
  },
  upgradeContent: {
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.foreground,
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeFeatures: {
    gap: 8,
  },
  upgradeFeature: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
  },
  upgradeButtonContainer: {
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  menuArrow: {
    fontSize: 20,
    color: theme.mutedForeground,
  },
  logoutButton: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.destructive,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.destructive,
  },
  version: {
    textAlign: "center",
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    fontSize: 12,
    marginTop: 8,
  },
});
