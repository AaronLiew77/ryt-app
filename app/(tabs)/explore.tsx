import { router } from "expo-router";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemeSelector } from "@/components/ThemeSelector";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";

export default function TabTwoScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol size={60} color='#808080' name='gear' style={styles.headerIcon} />
        <ThemedText type='title' style={styles.title}>
          Settings
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Theme
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Customize how the app looks with your preferred theme setting.
          </ThemedText>
          <ThemeSelector />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Account
          </ThemedText>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name='arrow.right.square' size={24} color='#EF4444' />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
