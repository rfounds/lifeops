import { Stack } from "expo-router";
import { theme } from "../../src/theme/colors";

export default function TaskLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
