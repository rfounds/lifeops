import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../src/theme/colors";
import { useAuth } from "../../src/context/AuthContext";
import { HomeIcon, AnalyticsIcon, SettingsIcon } from "../../src/components/icons/TabIcons";

function TabIcon({
  icon: Icon,
  focused,
  label,
}: {
  icon: React.ComponentType<{ focused: boolean; size: number }>;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={styles.tabItem}>
      <Icon focused={focused} size={22} />
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
          backgroundColor: theme.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          color: theme.foreground,
          fontFamily: "SpaceGrotesk_600SemiBold",
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={HomeIcon} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          href: isPro ? "/analytics" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={AnalyticsIcon} focused={focused} label="Analytics" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={SettingsIcon} focused={focused} label="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    height: 70,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
  },
  tabLabelFocused: {
    color: theme.primary,
    fontFamily: "SpaceGrotesk_500Medium",
  },
});
