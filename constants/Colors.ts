/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#2563EB";
const tintColorDark = "#60A5FA";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    tabBarBackground: "#FFFFFF",
    tabBarBackgroundBlur: "rgba(255, 255, 255, 0.95)",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  dark: {
    text: "#ECEDEE",
    background: "#1F1B24",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorDark,
    tabBarBackground: "#171717",
    tabBarBackgroundBlur: "rgba(23, 23, 23, 0.95)",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};
