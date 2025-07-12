import { QuickAction, QuickActionsProps } from "@/interfaces";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const defaultActions: QuickAction[] = [
  { id: "transfer", title: "Transfer", icon: "↔️", onPress: () => console.log("Transfer") },
  { id: "qr", title: "QR", icon: "📱", onPress: () => console.log("QR") },
  { id: "receive", title: "Ryt AI", icon: "📥", onPress: () => console.log("Receive") },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowColor = interpolateColor(
      animation.value,
      [0, 0.5, 1],
      ["#667eea", "#f5576c", "#00f2fe"]
    );

    const baseStyles = {
      borderRadius: 12,
      padding: 2,
    };

    if (Platform.OS === "ios") {
      return {
        ...baseStyles,
        shadowColor,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      };
    } else {
      return {
        ...baseStyles,
        elevation: 8,
      };
    }
  });

  return (
    <View className='my-4 w-full'>
      <View className='flex-row w-full justify-between'>
        {actions.map((action, index) => (
          <TouchableOpacity key={action.id} onPress={action.onPress} className='flex-1 mr-2'>
            {action.id === "receive" ? (
              <Animated.View style={animatedStyle}>
                <LinearGradient
                  colors={["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 12,
                    padding: 2,
                  }}
                >
                  <ThemedView
                    className='bg-white rounded-xl p-4 items-center justify-center'
                    style={{ minHeight: 56 }}
                  >
                    <ThemedText
                      className='text-gray-700 text-xs text-center font-medium'
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                    >
                      {action.title}
                    </ThemedText>
                  </ThemedView>
                </LinearGradient>
              </Animated.View>
            ) : (
              <ThemedView
                className='bg-white rounded-xl p-4 mt-1 items-center justify-center shadow-sm border border-gray-100'
                style={{ minHeight: 56 }}
              >
                <ThemedText
                  className='text-gray-700 text-xs text-center font-medium'
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.7}
                >
                  {action.title}
                </ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
