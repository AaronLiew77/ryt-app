import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

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
    return {
      shadowColor: interpolateColor(
        animation.value,
        [0, 0.5, 1],
        ["#667eea", "#f5576c", "#00f2fe"]
      ),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    };
  });

  return (
    <View className='my-4 w-full'>
      <View className='flex-row w-full justify-between'>
        {actions.map((action, index) => (
          <TouchableOpacity key={action.id} onPress={action.onPress} className='flex-1 mr-2'>
            {action.id === "receive" ? (
              <Animated.View style={[{ borderRadius: 12, padding: 2 }, animatedStyle]}>
                <LinearGradient
                  colors={["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 12,
                    padding: 2,
                  }}
                >
                  <ThemedView className='bg-white rounded-xl p-4 items-center'>
                    <ThemedText className='text-gray-700 text-xs text-center font-medium'>
                      {action.title}
                    </ThemedText>
                  </ThemedView>
                </LinearGradient>
              </Animated.View>
            ) : (
              <ThemedView className='bg-white rounded-xl p-4 mt-1 items-center shadow-sm border border-gray-100'>
                <ThemedText className='text-gray-700 text-xs text-center font-medium'>
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
