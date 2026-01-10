import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { useAuth } from "../../src/context/AuthContext";

function TabIcon({
  icon,
  focused,
  label,
}: {
  icon: string;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const isPro = user?.plan === "PRO";

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: colors.light.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.light.border,
        },
        headerTitleStyle: {
          color: colors.light.foreground,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          href: isPro ? "/analytics" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" focused={focused} label="Analytics" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" focused={focused} label="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.light.card,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    height: 80,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.light.mutedForeground,
    marginTop: 4,
  },
  tabLabelFocused: {
    color: colors.light.primary,
    fontWeight: "600",
  },
});
