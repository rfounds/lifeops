import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "../src/theme/colors";

export default function TermsScreen() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agreement to Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using LifeOps, you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use our service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description of Service</Text>
          <Text style={styles.paragraph}>
            LifeOps is a task management application designed to help you track and
            manage recurring life administration tasks. We provide both free and paid
            subscription tiers with different feature sets.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account. You must
            provide accurate information when creating your account and keep it updated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptable Use</Text>
          <Text style={styles.paragraph}>You agree not to:</Text>
          <Text style={styles.bulletList}>
            {`\u2022 Use the service for any unlawful purpose
\u2022 Attempt to gain unauthorized access to our systems
\u2022 Interfere with or disrupt the service
\u2022 Upload malicious content or code
\u2022 Impersonate others or provide false information
\u2022 Use the service to send spam or unsolicited messages`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscriptions and Payments</Text>
          <Text style={styles.paragraph}>
            Pro subscriptions are billed on a recurring basis. You can cancel at any
            time, and your subscription will remain active until the end of your
            current billing period. Refunds are provided in accordance with applicable
            law and our refund policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            LifeOps and its original content, features, and functionality are owned
            by us and are protected by international copyright, trademark, and other
            intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you create within LifeOps. By using
            our service, you grant us a license to store and process your content
            solely for the purpose of providing the service to you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            LifeOps is provided "as is" without warranties of any kind. We are not
            liable for any missed tasks, reminders, or deadlines. You are responsible
            for verifying important dates and taking appropriate action.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account if you violate
            these terms. You may also delete your account at any time through the
            app settings or by contacting support.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these terms from time to time. We will notify you of any
            material changes by posting the new terms in the app. Your continued use
            of the service after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.link}>legal@lifeops.dev</Text>
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
    marginTop: 8,
  },
  link: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.primary,
    marginTop: 8,
  },
});
