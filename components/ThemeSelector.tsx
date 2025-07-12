import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RadioButton } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function ThemeSelector() {
  const { themePreference, setThemePreference } = useTheme();

  const handleThemeChange = (value: string) => {
    setThemePreference(value as "light" | "dark" | "system");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type='subtitle' style={styles.title}>
        Theme Preference
      </ThemedText>
      <ThemedText style={styles.description}>Choose how you'd like the app to appear</ThemedText>

      <RadioButton.Group onValueChange={handleThemeChange} value={themePreference}>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => handleThemeChange("light")}
            activeOpacity={0.7}
          >
            <RadioButton value='light' />
            <ThemedText style={styles.radioLabel}>Light</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.radioDescription}>Always use light theme</ThemedText>
        </View>

        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => handleThemeChange("dark")}
            activeOpacity={0.7}
          >
            <RadioButton value='dark' />
            <ThemedText style={styles.radioLabel}>Dark</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.radioDescription}>Always use dark theme</ThemedText>
        </View>

        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioItem}
            onPress={() => handleThemeChange("system")}
            activeOpacity={0.7}
          >
            <RadioButton value='system' />
            <ThemedText style={styles.radioLabel}>System</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.radioDescription}>Follow system theme setting</ThemedText>
        </View>
      </RadioButton.Group>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  radioDescription: {
    marginLeft: 40,
    fontSize: 14,
    opacity: 0.7,
  },
});
