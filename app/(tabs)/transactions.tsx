import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import transactionData from "@/data/transactions.json";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
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

const SCREEN_HEIGHT = Dimensions.get("window").height;
const ITEMS_PER_PAGE = Math.floor(SCREEN_HEIGHT / 80); // Estimate items that fit on screen
const INITIAL_LOAD_SIZE = ITEMS_PER_PAGE;

export default function TransactionsScreen() {
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>(
    (transactionData as Transaction[]).slice(0, INITIAL_LOAD_SIZE)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(transactionData.length > INITIAL_LOAD_SIZE);

  const allTransactions = useMemo(() => transactionData as Transaction[], []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reset to initial load
    setDisplayedTransactions(allTransactions.slice(0, INITIAL_LOAD_SIZE));
    setHasMoreData(allTransactions.length > INITIAL_LOAD_SIZE);
    setIsRefreshing(false);
  }, [allTransactions]);

  const loadMoreTransactions = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return;

    setIsLoadingMore(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentLength = displayedTransactions.length;
    const nextBatch = allTransactions.slice(currentLength, currentLength + ITEMS_PER_PAGE);

    if (nextBatch.length > 0) {
      setDisplayedTransactions((prev) => [...prev, ...nextBatch]);
      setHasMoreData(currentLength + nextBatch.length < allTransactions.length);
    } else {
      setHasMoreData(false);
    }

    setIsLoadingMore(false);
  }, [displayedTransactions.length, allTransactions, isLoadingMore, hasMoreData]);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    router.push({
      pathname: "/transaction-detail",
      params: {
        id: transaction.id,
        title: transaction.title,
        subtitle: transaction.subtitle,
        amount: transaction.amount.toString(),
        date: transaction.date,
        type: transaction.type,
        category: transaction.category || "",
      },
    });
  }, []);

  const renderTransaction = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleTransactionPress(item)}
        className={`p-4 ${index !== displayedTransactions.length - 1 ? "border-b border-gray-100" : ""}`}
      >
        <View className='flex-row justify-between items-center'>
          <View className='flex-1'>
            <ThemedText className='text-gray-900 font-medium text-base'>{item.title}</ThemedText>
            <ThemedText className='text-gray-500 text-sm mt-1'>
              {item.subtitle} • {item.date}
            </ThemedText>
          </View>

          <View className='items-end'>
            <ThemedText
              className={`font-semibold text-base ${
                item.type === "credit" ? "text-green-600" : "text-gray-900"
              }`}
            >
              {item.type === "credit" ? "+" : "-"}
              {formatCurrency(item.amount)}
            </ThemedText>
            {item.category && (
              <ThemedText className='text-gray-400 text-xs mt-1'>{item.category}</ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [displayedTransactions.length, formatCurrency, handleTransactionPress]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View className='py-4 items-center'>
        <ActivityIndicator size='small' color='#2563eb' />
        <ThemedText className='text-gray-500 text-sm mt-2'>Loading more transactions...</ThemedText>
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(
    () => (
      <View className='flex-1 items-center justify-center py-20'>
        <ThemedText className='text-gray-500 text-lg'>No transactions found</ThemedText>
        <ThemedText className='text-gray-400 text-sm mt-2'>Pull down to refresh</ThemedText>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* Header */}
      <ThemedView className='flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <ThemedText className='text-blue-600 text-lg'>← Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' className='text-gray-900 flex-1 text-center'>
          Transactions
        </ThemedText>

        <View className='w-12' />
      </ThemedView>

      {/* Transaction List */}
      <ThemedView className='flex-1 mx-6 mt-4 bg-white rounded-xl shadow-sm border border-gray-100'>
        <FlatList
          data={displayedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#2563eb"]}
              tintColor='#2563eb'
              title='Pull to refresh'
              titleColor='#6b7280'
            />
          }
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          initialNumToRender={INITIAL_LOAD_SIZE}
          maxToRenderPerBatch={ITEMS_PER_PAGE}
          windowSize={2}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
