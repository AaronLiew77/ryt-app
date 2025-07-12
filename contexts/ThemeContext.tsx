import { useColorScheme as useSystemColorScheme } from "@/hooks/useColorScheme";
import { ResolvedTheme, ThemeContextType, ThemePreference, ThemeProviderProps } from "@/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "@ryt_app_theme";

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("system");
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useSystemColorScheme();

  // Resolve the actual theme to use
  const resolvedTheme: ResolvedTheme =
    themePreference === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemePreferenceState(savedTheme as ThemePreference);
      }
    } catch (error) {
      console.log("Error loading theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemePreference = async (theme: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      setThemePreferenceState(theme);
    } catch (error) {
      console.log("Error saving theme preference:", error);
      throw error;
    }
  };

  const value = {
    themePreference,
    resolvedTheme,
    isLoading,
    setThemePreference,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
