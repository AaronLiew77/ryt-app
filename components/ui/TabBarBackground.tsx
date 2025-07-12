import { useTheme } from "@/contexts/ThemeContext";
import { StyleSheet, View } from "react-native";

export default function TabBarBackground() {
  const { resolvedTheme } = useTheme();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: resolvedTheme === "dark" ? "#171717" : "#FFFFFF",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: resolvedTheme === "dark" ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 16,
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
