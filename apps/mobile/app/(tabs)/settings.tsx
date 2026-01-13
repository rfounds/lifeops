import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { theme } from "../../src/theme/colors";

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
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
              <View
                style={[
                  styles.planBadge,
                  user?.plan === "PRO" && styles.planBadgePro,
                ]}
              >
                <Text
                  style={[
                    styles.planText,
                    user?.plan === "PRO" && styles.planTextPro,
                  ]}
                >
                  {user?.plan}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {user?.plan !== "PRO" && (
          <View style={styles.section}>
            <View style={styles.upgradeCard}>
              <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradeDescription}>
                Get unlimited tasks, analytics, household sharing, and more.
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>About LifeOps</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Terms of Service</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
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
    backgroundColor: theme.primary,
  },
  planText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.mutedForeground,
  },
  planTextPro: {
    color: theme.primaryForeground,
  },
  upgradeCard: {
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.3)",
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: theme.foreground,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: theme.background,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_500Medium",
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
