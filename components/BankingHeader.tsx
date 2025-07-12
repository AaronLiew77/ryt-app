import { BankingHeaderProps } from "@/interfaces";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function BankingHeader({ userName, onProfilePress }: BankingHeaderProps) {
  return (
    <ThemedView className='flex-row justify-between items-center py-4 pt-12'>
      <View>
        <ThemedText type='subtitle' className='text-gray-600 mb-2'>
          Good morning,
        </ThemedText>
        <ThemedText type='title' className='text-gray-900'>
          {userName}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={onProfilePress}
        className='w-12 h-12 rounded-full bg-blue-500 items-center justify-center'
      >
        <ThemedText className='text-white font-bold text-lg'>
          {userName.charAt(0).toUpperCase()}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
