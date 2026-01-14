import { useRef, useCallback, ReactNode } from "react";
import {
  Animated,
  Pressable,
  Platform,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import * as Haptics from "expo-haptics";

interface AnimatedTouchableProps {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  hapticStyle?: "light" | "medium" | "heavy" | "success" | "warning" | "error" | "none";
  hitSlop?: { top?: number; left?: number; bottom?: number; right?: number };
}

export function AnimatedTouchable({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  activeScale = 0.97,
  hapticStyle = "light",
  hitSlop,
}: AnimatedTouchableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: activeScale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim, activeScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === "web" || hapticStyle === "none") return;

    switch (hapticStyle) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }, [hapticStyle]);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      triggerHaptic();
      onPress?.(event);
    },
    [onPress, triggerHaptic]
  );

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      onLongPress?.(event);
    },
    [onLongPress]
  );

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
