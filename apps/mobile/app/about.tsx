import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { theme } from "../src/theme/colors";
import { Logo } from "../src/components/Logo";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <Logo size="lg" />
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is LifeOps?</Text>
          <Text style={styles.paragraph}>
            LifeOps is your personal life admin assistant. We help you track and manage
            all those recurring tasks that keep life running smoothly - from renewing
            your driver's license to scheduling annual checkups.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            Life is full of important tasks that are easy to forget. A missed insurance
            renewal, an expired passport, or a forgotten bill can cause stress and
            complications. LifeOps exists to make sure nothing falls through the cracks.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>Track recurring life admin tasks</Text>
            <Text style={styles.feature}>Smart reminders before due dates</Text>
            <Text style={styles.feature}>Organize by category (Finance, Health, Legal, etc.)</Text>
            <Text style={styles.feature}>Household sharing for families</Text>
            <Text style={styles.feature}>Analytics to track your progress</Text>
            <Text style={styles.feature}>Cost tracking for annual budgeting</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.paragraph}>
            Have questions or feedback? We'd love to hear from you.
          </Text>
          <Text style={styles.link}>support@lifeops.dev</Text>
        </View>

        <Text style={styles.copyright}>
          Made with care for people who want to stay on top of life.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 17,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.primary,
  },
  content: {
    padding: 24,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  version: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    lineHeight: 24,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    lineHeight: 24,
    paddingLeft: 16,
  },
  link: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.primary,
    marginTop: 8,
  },
  copyright: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    textAlign: "center",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
