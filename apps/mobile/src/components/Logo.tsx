import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { gradientColors, theme } from "../theme/colors";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 18 },
    md: { icon: 24, text: 20 },
    lg: { icon: 32, text: 24 },
  };

  const { icon, text } = sizes[size];

  return (
    <View style={styles.container}>
      <View style={{ width: icon, height: icon }}>
        <Svg viewBox="0 0 24 24" width={icon} height={icon}>
          <Defs>
            <LinearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors.primary} />
              <Stop offset="100%" stopColor={gradientColors.accent} />
            </LinearGradient>
          </Defs>
          {/* Main square */}
          <Rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="2"
            fill="url(#logo-gradient)"
          />
          {/* Bottom square */}
          <Rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#logo-gradient)"
          />
          {/* Right square - faded */}
          <Rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            fill="url(#logo-gradient)"
            opacity={0.4}
          />
        </Svg>
      </View>
      <Text style={[styles.text, { fontSize: text }]}>LifeOps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontWeight: "bold",
    letterSpacing: -0.5,
    color: theme.primary,
  },
});
