import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "../src/theme/colors";

export default function PrivacyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.paragraph}>
            LifeOps ("we", "our", or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your
            information when you use our mobile application and web service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.subheading}>Account Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we collect your name, email address, and
            password (securely hashed). If you upgrade to Pro, we collect payment
            information through our secure payment processor.
          </Text>
          <Text style={styles.subheading}>Task Data</Text>
          <Text style={styles.paragraph}>
            We store the tasks you create, including titles, categories, due dates,
            notes, and completion history. This data is essential to provide our
            service.
          </Text>
          <Text style={styles.subheading}>Usage Data</Text>
          <Text style={styles.paragraph}>
            We collect anonymous usage statistics to improve our service, including
            app performance metrics and feature usage patterns.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.bulletList}>
            {`\u2022 To provide and maintain our service
\u2022 To send you reminders about upcoming tasks
\u2022 To process your transactions
\u2022 To communicate with you about updates and support
\u2022 To improve our service and develop new features`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your data.
            Your password is securely hashed, and all data transmission is encrypted
            using TLS. We regularly review and update our security practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We only share data with third
            parties when necessary to provide our service (e.g., payment processing,
            email delivery) or when required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household Sharing</Text>
          <Text style={styles.paragraph}>
            If you use household sharing features, your tasks may be visible to other
            members of your household. You control which tasks are shared.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, correct, or delete your personal data at
            any time. You can export your data or request account deletion by
            contacting us at privacy@lifeops.dev.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.link}>privacy@lifeops.dev</Text>
        </View>
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
  lastUpdated: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    marginBottom: 24,
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
  subheading: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: theme.foreground,
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    lineHeight: 24,
  },
  bulletList: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    lineHeight: 28,
  },
  link: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.primary,
    marginTop: 8,
  },
});
