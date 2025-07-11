import { ScrollView, TouchableOpacity, View } from "react-native";
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
  { id: "pay", title: "Pay Bills", icon: "💳", onPress: () => console.log("Pay Bills") },
  { id: "deposit", title: "Deposit", icon: "📥", onPress: () => console.log("Deposit") },
  { id: "atm", title: "Find ATM", icon: "🏧", onPress: () => console.log("Find ATM") },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <View className='px-6 my-4'>
      <ThemedText type='subtitle' className='text-gray-900 mb-4'>
        Quick Actions
      </ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-row'>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            onPress={action.onPress}
            className={`mr-4 ${index === actions.length - 1 ? "mr-6" : ""}`}
          >
            <ThemedView className='bg-white rounded-xl p-4 items-center shadow-sm border border-gray-100 w-20'>
              <View className='w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2'>
                <ThemedText className='text-2xl'>{action.icon}</ThemedText>
              </View>
              <ThemedText className='text-gray-700 text-xs text-center font-medium'>
                {action.title}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
