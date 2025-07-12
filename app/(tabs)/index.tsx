import { BankingHome } from "@/components/BankingHome";
import bankingData from "@/data/banking.json";
import transactionData from "@/data/transactions.json";
import SecureStorageService, { BankingData, Transaction } from "@/services/secureStorageService";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function HomeTab() {
  const [bankingDataState, setBankingDataState] = useState<BankingData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      // Initialize with defaults if no data exists
      await SecureStorageService.initializeWithDefaults();

      // Initialize transaction data with defaults from JSON
      const defaultTransactions = transactionData as Transaction[];
      await SecureStorageService.initializeWithDefaultTransactions(defaultTransactions);

      // Add a small delay to ensure storage operations are complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Load the encrypted banking data
      const data = await SecureStorageService.getBankingData();

      // Load the encrypted transaction data
      const encryptedTransactions = await SecureStorageService.getTransactionData();

      // Only set fallback if both data and transactions are null (indicating real failure)
      if (data === null && encryptedTransactions === null) {
        console.warn("No encrypted data found, using fallback values");
        setBankingDataState(bankingData as BankingData);
        setTransactions(transactionData as Transaction[]);
      } else {
        // Use the loaded data or fallback gracefully for each piece
        setBankingDataState(data || (bankingData as BankingData));
        setTransactions(encryptedTransactions || (transactionData as Transaction[]));
      }

      // Log storage type for debugging
      const CryptoService = (await import("@/utils/cryptoService")).default;
      const storageType = await CryptoService.getStorageType();
      console.log(`🔒 Banking data loaded using: ${storageType}`);
      console.log(`🔒 Transaction data loaded: ${encryptedTransactions?.length || 0} transactions`);
      console.log(`🔒 Banking data: ${data ? "encrypted data loaded" : "using fallback"}`);
    } catch (error) {
      console.error("Error loading banking data:", error);
      // Only use fallback on actual errors, not on null returns
      setBankingDataState(bankingData as BankingData);
      setTransactions(transactionData as Transaction[]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className='flex-1'>
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size='large' color='#2563eb' />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1'>
      <BankingHome
        userName={bankingDataState?.userName || "User"}
        accountBalance={bankingDataState?.accountBalance || 0}
        accountNumber={bankingDataState?.accountNumber || "****"}
        transactions={transactions}
      />
    </SafeAreaView>
  );
}
