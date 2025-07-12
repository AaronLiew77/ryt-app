import { useTheme } from "@/contexts/ThemeContext";
import transactionData from "@/data/transactions.json";
import { RecentTransactionsProps, Transaction } from "@/interfaces";
import { Platform, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { TransactionItem } from "./TransactionItem";

export function RecentTransactions({
  transactions = transactionData as Transaction[],
  onViewAll,
  onTransactionPress,
}: RecentTransactionsProps) {
  const { resolvedTheme } = useTheme();
  // Limit to first 10 transactions for the home page
  const displayTransactions = transactions.slice(0, 10);

  const containerStyle = {
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: resolvedTheme === "dark" ? 0.3 : 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    // Add a subtle border that works for both themes
    borderWidth: 1,
    borderColor: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  };

  return (
    <View className='my-6'>
      <View className='flex-row justify-between items-center mb-6'>
        <View className='flex-1 mr-3'>
          <ThemedText
            type='subtitle'
            className='font-semibold'
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            Recent Transactions
          </ThemedText>
        </View>
        <TouchableOpacity onPress={onViewAll} className='flex-shrink-0'>
          <ThemedText
            className='text-blue-600 font-medium text-sm'
            lightColor='#2563EB'
            darkColor='#60A5FA'
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            minimumFontScale={0.8}
          >
            View All
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedView style={containerStyle}>
        {displayTransactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={onTransactionPress}
            showBorder={index !== displayTransactions.length - 1}
          />
        ))}
      </ThemedView>
    </View>
  );
}
