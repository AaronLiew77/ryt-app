import { useTheme } from "@/contexts/ThemeContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";

export default function BlurTabBarBackground() {
  const { resolvedTheme } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        // Use a more modern blur effect that adapts to the theme
        tint={resolvedTheme === "dark" ? "dark" : "light"}
        intensity={95}
        style={StyleSheet.absoluteFill}
      />
      {/* Add a subtle overlay for depth */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              resolvedTheme === "dark" ? "rgba(23, 23, 23, 0.4)" : "rgba(255, 255, 255, 0.4)",
          },
        ]}
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
