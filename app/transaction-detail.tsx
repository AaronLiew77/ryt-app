import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: "debit" | "credit";
  category?: string;
}

export default function TransactionDetailScreen() {
  const params = useLocalSearchParams();

  // Parse the transaction data from URL params
  const transaction: Transaction = {
    id: params.id as string,
    title: params.title as string,
    subtitle: params.subtitle as string,
    amount: parseFloat(params.amount as string),
    date: params.date as string,
    type: params.type as "debit" | "credit",
    category: params.category as string,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const formatFullDate = (dateStr: string) => {
    // If it's a relative date like "Today", "Yesterday", return as is
    if (dateStr === "Today" || dateStr === "Yesterday") {
      return dateStr;
    }

    // Try to parse and format the date
    try {
      const date = new Date(dateStr + ", 2024");
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = () => {
    return transaction.type === "credit" ? "text-green-600" : "text-red-600";
  };

  const getStatusText = () => {
    return transaction.type === "credit" ? "Received" : "Paid";
  };

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* Header */}
      <ThemedView className='flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <ThemedText className='text-blue-600 text-lg'>← Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' className='text-gray-900 flex-1 text-center'>
          Transaction Details
        </ThemedText>

        <View className='w-12' />
      </ThemedView>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Transaction Amount */}
        <ThemedView className='bg-white mx-6 mt-6 rounded-xl shadow-sm border border-gray-100 p-6 items-center'>
          <ThemedText className={`text-4xl font-bold ${getStatusColor()}`}>
            {transaction.type === "credit" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </ThemedText>
          <ThemedText className={`text-lg font-medium mt-2 ${getStatusColor()}`}>
            {getStatusText()}
          </ThemedText>
        </ThemedView>

        {/* Transaction Info */}
        <ThemedView className='bg-white mx-6 mt-4 rounded-xl shadow-sm border border-gray-100'>
          {/* Merchant/Title */}
          <View className='p-6 border-b border-gray-100'>
            <ThemedText className='text-gray-500 text-sm mb-1'>Merchant</ThemedText>
            <ThemedText className='text-gray-900 text-lg font-medium'>
              {transaction.title}
            </ThemedText>
          </View>

          {/* Description */}
          <View className='p-6 border-b border-gray-100'>
            <ThemedText className='text-gray-500 text-sm mb-1'>Description</ThemedText>
            <ThemedText className='text-gray-900 text-base'>{transaction.subtitle}</ThemedText>
          </View>

          {/* Date */}
          <View className='p-6 border-b border-gray-100'>
            <ThemedText className='text-gray-500 text-sm mb-1'>Date</ThemedText>
            <ThemedText className='text-gray-900 text-base'>
              {formatFullDate(transaction.date)}
            </ThemedText>
          </View>

          {/* Category */}
          {transaction.category && (
            <View className='p-6 border-b border-gray-100'>
              <ThemedText className='text-gray-500 text-sm mb-1'>Category</ThemedText>
              <View className='flex-row items-center'>
                <View className='bg-blue-100 px-3 py-1 rounded-full'>
                  <ThemedText className='text-blue-800 text-sm font-medium'>
                    {transaction.category}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {/* Transaction ID */}
          <View className='p-6'>
            <ThemedText className='text-gray-500 text-sm mb-1'>Transaction ID</ThemedText>
            <ThemedText className='text-gray-900 text-base font-mono'>{transaction.id}</ThemedText>
          </View>
        </ThemedView>

        {/* Additional Actions */}
        <ThemedView className='bg-white mx-6 mt-4 rounded-xl shadow-sm border border-gray-100'>
          <TouchableOpacity className='p-4 border-b border-gray-100'>
            <ThemedText className='text-blue-600 text-base font-medium text-center'>
              Report an Issue
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity className='p-4 border-b border-gray-100'>
            <ThemedText className='text-blue-600 text-base font-medium text-center'>
              Add Note
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity className='p-4'>
            <ThemedText className='text-blue-600 text-base font-medium text-center'>
              Export Receipt
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Add some bottom padding */}
        <View className='h-8' />
      </ScrollView>
    </SafeAreaView>
  );
}
