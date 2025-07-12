import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { resolvedTheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: resolvedTheme === "dark" ? "#60A5FA" : "#2563EB",
        tabBarInactiveTintColor: resolvedTheme === "dark" ? "#6B7280" : "#9CA3AF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor:
              resolvedTheme === "dark" ? "rgba(23, 23, 23, 0.95)" : "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: 34, // Account for home indicator
            height: 88,
            shadowColor: resolvedTheme === "dark" ? "#000" : "#000",
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: resolvedTheme === "dark" ? 0.3 : 0.1,
            shadowRadius: 16,
          },
          android: {
            backgroundColor: resolvedTheme === "dark" ? "#171717" : "#FFFFFF",
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: 16,
            height: 72,
            elevation: 16,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          default: {
            backgroundColor: resolvedTheme === "dark" ? "#171717" : "#FFFFFF",
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: 16,
            height: 72,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
          fontFamily: Platform.select({
            ios: "System",
            android: "Roboto",
            default: "System",
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name='house.fill'
              color={color}
              {...(Platform.OS === "ios" ? { weight: focused ? "semibold" : "regular" } : {})}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='transactions'
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name='list.bullet'
              color={color}
              {...(Platform.OS === "ios" ? { weight: focused ? "semibold" : "regular" } : {})}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name='gear'
              color={color}
              {...(Platform.OS === "ios" ? { weight: focused ? "semibold" : "regular" } : {})}
            />
          ),
        }}
      />
    </Tabs>
  );
}
