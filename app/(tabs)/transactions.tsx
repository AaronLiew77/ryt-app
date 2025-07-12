import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TransactionItem, Transaction as UITransaction } from "@/components/TransactionItem";
import { useTheme } from "@/contexts/ThemeContext";
import transactionData from "@/data/transactions.json";
import SecureStorageService, {
  Transaction as StorageTransaction,
} from "@/services/secureStorageService";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const ITEMS_PER_PAGE = Math.floor(SCREEN_HEIGHT / 80); // Estimate items that fit on screen
const INITIAL_LOAD_SIZE = ITEMS_PER_PAGE;

export default function TransactionsScreen() {
  const [allTransactions, setAllTransactions] = useState<UITransaction[]>([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<UITransaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMoreData, setHasMoreData] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      // Initialize transaction data with defaults from JSON
      const defaultTransactions = transactionData as StorageTransaction[];
      await SecureStorageService.initializeWithDefaultTransactions(defaultTransactions);

      // Add a small delay to ensure storage operations are complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Load the encrypted transaction data
      const encryptedTransactions = await SecureStorageService.getTransactionData();

      // Use encrypted data if available, otherwise fallback to JSON data
      const transactions = encryptedTransactions || (transactionData as UITransaction[]);

      setAllTransactions(transactions);
      setDisplayedTransactions(transactions.slice(0, INITIAL_LOAD_SIZE));
      setHasMoreData(transactions.length > INITIAL_LOAD_SIZE);

      // Log storage type for debugging
      const CryptoService = (await import("@/utils/cryptoService")).default;
      const storageType = await CryptoService.getStorageType();
    } catch (error) {
      console.error("Error loading transaction data:", error);
      // Fallback to JSON data on error
      const fallbackTransactions = transactionData as UITransaction[];
      setAllTransactions(fallbackTransactions);
      setDisplayedTransactions(fallbackTransactions.slice(0, INITIAL_LOAD_SIZE));
      setHasMoreData(fallbackTransactions.length > INITIAL_LOAD_SIZE);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTransactionData();
    setIsRefreshing(false);
  }, []);

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

  const handleTransactionPress = useCallback((transaction: UITransaction) => {
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
    ({ item, index }: { item: UITransaction; index: number }) => (
      <TransactionItem
        transaction={item}
        onPress={handleTransactionPress}
        showBorder={index !== displayedTransactions.length - 1}
      />
    ),
    [displayedTransactions.length, handleTransactionPress]
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

  // Show loading spinner while initial data is loading
  if (isInitialLoading) {
    return (
      <SafeAreaView className='flex-1'>
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size='large' color='#2563eb' />
          <ThemedText className='text-gray-500 text-sm mt-2'>Loading transactions...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1'>
      {/* Header */}
      <ThemedView className='flex-row items-center justify-between px-6 py-4'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <ThemedText className='text-blue-600'>←</ThemedText>
        </TouchableOpacity>

        <ThemedText
          type='title'
          className='text-gray-900 flex-1 text-center'
          adjustsFontSizeToFit={true}
          style={{ fontSize: 18 }}
          minimumFontScale={0.8}
          numberOfLines={1}
        >
          Transactions
        </ThemedText>

        <View className='w-12' />
      </ThemedView>

      {/* Transaction List */}
      <ThemedView className='flex-1 mx-4 mt-4' style={containerStyle}>
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
