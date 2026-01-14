import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useToast } from "../../src/context/ToastContext";
import { theme } from "../../src/theme/colors";
import { Logo } from "../../src/components/Logo";
import { Button } from "../../src/components/ui";
import { registerSchema } from "@lifeops/shared";

export default function RegisterScreen() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    setError("");

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      showToast("Account created successfully!", "success");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Logo size="lg" />
            </View>

            {/* Header */}
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Start organizing your life admin</Text>

            {/* Form */}
            <View style={styles.form}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "name" && styles.inputFocused,
                  ]}
                  placeholder="Your name"
                  placeholderTextColor={theme.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "email" && styles.inputFocused,
                  ]}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === "password" && styles.inputFocused,
                  ]}
                  placeholder="Create a password (min 6 characters)"
                  placeholderTextColor={theme.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  autoComplete="new-password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  fullWidth
                >
                  Create account
                </Button>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login">
                <Text style={styles.link}>Sign in</Text>
              </Link>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "SpaceGrotesk_700Bold",
    color: theme.foreground,
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.mutedForeground,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    color: theme.foreground,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
    color: theme.foreground,
  },
  inputFocused: {
    borderColor: theme.primary,
  },
  buttonContainer: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: theme.destructive,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: theme.mutedForeground,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  link: {
    color: theme.primary,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
  },
});
