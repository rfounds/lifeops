import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { theme } from "../../theme/colors";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  visible,
  onHide,
  duration = 3000,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback when toast appears
      if (Platform.OS !== "web") {
        switch (type) {
          case "success":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case "error":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          case "warning":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, type]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "rgba(74, 222, 128, 0.95)",
          icon: "✓",
          textColor: "#000000",
        };
      case "error":
        return {
          backgroundColor: "rgba(248, 113, 113, 0.95)",
          icon: "✕",
          textColor: "#FFFFFF",
        };
      case "warning":
        return {
          backgroundColor: "rgba(251, 191, 36, 0.95)",
          icon: "!",
          textColor: "#000000",
        };
      case "info":
      default:
        return {
          backgroundColor: "rgba(129, 140, 248, 0.95)",
          icon: "i",
          textColor: "#FFFFFF",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          backgroundColor: typeStyles.backgroundColor,
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={hideToast}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: typeStyles.textColor }]}>
            {typeStyles.icon}
          </Text>
        </View>
        <Text style={[styles.message, { color: typeStyles.textColor }]}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk_700Bold",
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_500Medium",
  },
});
