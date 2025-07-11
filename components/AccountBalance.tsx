import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AccountBalanceProps {
  balance: number;
  accountNumber: string;
  accountType?: string;
  onViewDetails?: () => void;
}

export function AccountBalance({
  balance,
  accountNumber,
  accountType = "Checking",
  onViewDetails,
}: AccountBalanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <TouchableOpacity onPress={onViewDetails} className='mx-6 my-4'>
      <ThemedView className='bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg'>
        <View className='flex-row justify-between items-start mb-4'>
          <View>
            <ThemedText className='text-blue-100 text-sm opacity-90'>
              {accountType} Account
            </ThemedText>
            <ThemedText className='text-white text-xs opacity-75'>
              •••• {accountNumber.slice(-4)}
            </ThemedText>
          </View>
          <View className='w-8 h-8 bg-white bg-opacity-20 rounded-full' />
        </View>

        <View>
          <ThemedText className='text-blue-100 text-sm opacity-90'>Available Balance</ThemedText>
          <ThemedText className='text-white text-3xl font-bold mt-1'>
            {formatCurrency(balance)}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}
