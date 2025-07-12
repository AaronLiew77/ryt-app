import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function EnhancedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { resolvedTheme } = useTheme();
  const focusedIndex = useSharedValue(state.index);

  useEffect(() => {
    focusedIndex.value = withSpring(state.index, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.index]);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        resolvedTheme === "dark" ? Colors.dark.tabBarBackground : Colors.light.tabBarBackground,
    };
  });

  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "transparent" }}>
      <Animated.View
        style={[
          {
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 8 : 16,
            borderTopWidth: 0,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: resolvedTheme === "dark" ? 0.3 : 0.1,
                shadowRadius: 16,
              },
              android: {
                elevation: 16,
              },
            }),
          },
          backgroundStyle,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              focusedIndex.value,
              [index - 1, index, index + 1],
              [0.9, 1.1, 0.9],
              "clamp"
            );

            const opacity = interpolate(
              focusedIndex.value,
              [index - 1, index, index + 1],
              [0.6, 1, 0.6],
              "clamp"
            );

            return {
              transform: [{ scale: isFocused ? scale : 1 }],
              opacity: isFocused ? opacity : 0.6,
            };
          });

          const labelStyle = useAnimatedStyle(() => {
            const translateY = interpolate(
              focusedIndex.value,
              [index - 1, index, index + 1],
              [0, -2, 0],
              "clamp"
            );

            return {
              transform: [{ translateY: isFocused ? translateY : 0 }],
            };
          });

          return (
            <AnimatedTouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                {
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  borderRadius: 12,
                  minHeight: 56,
                },
                animatedStyle,
              ]}
              activeOpacity={0.7}
            >
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {options.tabBarIcon && (
                  <View style={{ marginBottom: 4 }}>
                    {options.tabBarIcon({
                      focused: isFocused,
                      color: isFocused
                        ? resolvedTheme === "dark"
                          ? Colors.dark.tabIconSelected
                          : Colors.light.tabIconSelected
                        : resolvedTheme === "dark"
                          ? Colors.dark.tabIconDefault
                          : Colors.light.tabIconDefault,
                      size: isFocused ? 26 : 24,
                    })}
                  </View>
                )}
                <Animated.Text
                  style={[
                    {
                      fontSize: 12,
                      fontWeight: isFocused ? "600" : "500",
                      color: isFocused
                        ? resolvedTheme === "dark"
                          ? Colors.dark.tabIconSelected
                          : Colors.light.tabIconSelected
                        : resolvedTheme === "dark"
                          ? Colors.dark.tabIconDefault
                          : Colors.light.tabIconDefault,
                      textAlign: "center",
                      fontFamily: Platform.select({
                        ios: "System",
                        android: "Roboto",
                        default: "System",
                      }),
                    },
                    labelStyle,
                  ]}
                >
                  {label}
                </Animated.Text>
              </View>
            </AnimatedTouchableOpacity>
          );
        })}
      </Animated.View>
    </SafeAreaView>
  );
}
