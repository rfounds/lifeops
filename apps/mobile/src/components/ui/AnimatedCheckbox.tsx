import { useRef, useEffect, useCallback } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Platform,
  View,
  Text,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme } from "../../theme/colors";

interface AnimatedCheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  loading?: boolean;
}

export function AnimatedCheckbox({
  checked,
  onPress,
  disabled = false,
  size = 24,
  loading = false,
}: AnimatedCheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 15,
    }).start();

    if (checked) {
      // Bounce effect when checked
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 12,
        }),
      ]).start();
    }
  }, [checked, checkAnim, bounceAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      if (!checked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onPress();
  }, [onPress, checked]);

  const backgroundColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", theme.primary],
  });

  const borderColor = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border, theme.primary],
  });

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (loading) {
    return (
      <View style={[styles.checkbox, { width: size, height: size }]}>
        <Animated.View
          style={[
            styles.loadingDot,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            borderColor,
            transform: [{ scale: Animated.multiply(scaleAnim, bounceAnim) }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.checkmark,
            {
              fontSize: size * 0.6,
              transform: [{ scale: checkScale }],
              opacity: checkAnim,
            },
          ]}
        >
          ✓
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
  },
});
