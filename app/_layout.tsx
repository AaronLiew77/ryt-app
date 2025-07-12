import { Colors } from "@/constants/Colors";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider as CustomThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import "./global.css";

// Create custom themes using the app's color definitions
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    text: Colors.light.text,
    primary: Colors.light.tint,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    text: Colors.dark.text,
    primary: Colors.dark.tint,
  },
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)" || segments[0] === "transaction-detail";

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== "login") {
      // Redirect to main app if authenticated and not in protected routes (but don't redirect from login)
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='transaction-detail' options={{ headerShown: false }} />
      <Stack.Screen name='+not-found' />
    </Stack>
  );
}

function ThemedRootLayout() {
  const { resolvedTheme } = useTheme();
  return (
    <ThemeProvider value={resolvedTheme === "dark" ? CustomDarkTheme : CustomLightTheme}>
      <RootLayoutNav />
      <StatusBar style='auto' />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <PaperProvider>
          <ThemedRootLayout />
        </PaperProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}
