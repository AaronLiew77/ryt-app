import { ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextType {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isLoading: boolean;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
}

export interface ThemeProviderProps {
  children: ReactNode;
}
