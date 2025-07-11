import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: "debit" | "credit";
  category?: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  onViewAll?: () => void;
  onTransactionPress?: (transaction: Transaction) => void;
}

const sampleTransactions: Transaction[] = [
  {
    id: "1",
    title: "Starbucks Coffee",
    subtitle: "Coffee & Tea",
    amount: -5.47,
    date: "Today",
    type: "debit",
    category: "Food & Dining",
  },
  {
    id: "2",
    title: "Salary Deposit",
    subtitle: "Direct Deposit",
    amount: 3250.0,
    date: "Yesterday",
    type: "credit",
    category: "Income",
  },
  {
    id: "3",
    title: "Amazon Purchase",
    subtitle: "Online Shopping",
    amount: -89.99,
    date: "Dec 15",
    type: "debit",
    category: "Shopping",
  },
  {
    id: "4",
    title: "Gas Station",
    subtitle: "Shell #1234",
    amount: -45.2,
    date: "Dec 14",
    type: "debit",
    category: "Transportation",
  },
];

export function RecentTransactions({
  transactions = sampleTransactions,
  onViewAll,
  onTransactionPress,
}: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  return (
    <View className='px-6 my-4'>
      <View className='flex-row justify-between items-center mb-4'>
        <ThemedText type='subtitle' className='text-gray-900'>
          Recent Transactions
        </ThemedText>
        <TouchableOpacity onPress={onViewAll}>
          <ThemedText className='text-blue-600 font-medium'>View All</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedView className='bg-white rounded-xl shadow-sm border border-gray-100'>
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            key={transaction.id}
            onPress={() => onTransactionPress?.(transaction)}
            className={`p-4 ${index !== transactions.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <View className='flex-row justify-between items-center'>
              <View className='flex-1'>
                <ThemedText className='text-gray-900 font-medium text-base'>
                  {transaction.title}
                </ThemedText>
                <ThemedText className='text-gray-500 text-sm mt-1'>
                  {transaction.subtitle} • {transaction.date}
                </ThemedText>
              </View>

              <View className='items-end'>
                <ThemedText
                  className={`font-semibold text-base ${
                    transaction.type === "credit" ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {transaction.type === "credit" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </ThemedText>
                {transaction.category && (
                  <ThemedText className='text-gray-400 text-xs mt-1'>
                    {transaction.category}
                  </ThemedText>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </View>
  );
}
