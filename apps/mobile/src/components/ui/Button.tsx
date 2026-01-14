import { useRef, useCallback } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { theme, gradientColors } from "../../theme/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

export function Button({
  onPress,
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
  };

  const { paddingVertical, paddingHorizontal, fontSize } = sizeStyles[size];

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    // Trigger haptic feedback on native platforms
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          useGradient: true,
          textColor: "#FFFFFF",
          borderColor: "transparent",
          backgroundColor: theme.primary,
        };
      case "secondary":
        return {
          useGradient: false,
          textColor: theme.background,
          borderColor: "transparent",
          backgroundColor: theme.foreground,
        };
      case "outline":
        return {
          useGradient: false,
          textColor: theme.foreground,
          borderColor: theme.border,
          backgroundColor: "transparent",
        };
      case "ghost":
        return {
          useGradient: false,
          textColor: theme.foreground,
          borderColor: "transparent",
          backgroundColor: "transparent",
        };
      case "destructive":
        return {
          useGradient: false,
          textColor: "#FFFFFF",
          borderColor: "transparent",
          backgroundColor: theme.destructive,
        };
      default:
        return {
          useGradient: true,
          textColor: "#FFFFFF",
          borderColor: "transparent",
          backgroundColor: theme.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.textColor} />
      ) : (
        <>
          {icon && <Text style={[styles.icon, { fontSize }]}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize,
              },
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </View>
  );

  if (variantStyles.useGradient && !isDisabled) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth]}
      >
        <Animated.View
          style={[
            fullWidth && styles.fullWidth,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[gradientColors.primary, gradientColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              styles.shadow,
              {
                paddingVertical,
                paddingHorizontal,
              },
              fullWidth && styles.fullWidth,
            ]}
          >
            {content}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[fullWidth && styles.fullWidth]}
    >
      <Animated.View
        style={[
          styles.button,
          variant === "primary" || variant === "secondary" || variant === "destructive"
            ? styles.shadow
            : null,
          {
            paddingVertical,
            paddingHorizontal,
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderWidth: variant === "outline" ? 1 : 0,
            transform: [{ scale: scaleAnim }],
            opacity: isDisabled ? 0.5 : opacityAnim,
          },
          fullWidth && styles.fullWidth,
        ]}
      >
        {content}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontFamily: "SpaceGrotesk_600SemiBold",
  },
  icon: {
    marginRight: 4,
  },
  fullWidth: {
    width: "100%",
  },
});
