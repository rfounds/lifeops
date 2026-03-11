import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LifeOps",
  slug: "lifeops",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "lifeops",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0f0f0f",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.lifeops.app",
    infoPlist: {
      UIBackgroundModes: ["fetch", "remote-notification"],
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f0f0f",
    },
    edgeToEdgeEnabled: true,
    package: "com.lifeops.app",
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#6366f1",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  owner: "r2founds",
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
    eas: {
      projectId: "96a5ea3d-8af7-4be3-b6b7-4b90fab719cd",
    },
  },
});
