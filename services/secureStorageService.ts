import defaultBankingData from "@/data/banking.json";
import { BankingData, StoredBankingData, StoredTransactionData, Transaction } from "@/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoService from "../utils/cryptoService";

class SecureStorageService {
  private static readonly BANKING_DATA_KEY = "SECURE_BANKING_DATA";
  private static readonly TRANSACTION_DATA_KEY = "SECURE_TRANSACTION_DATA";
  private static readonly DATA_VERSION = "1.0";
  private static readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  /**
   * Store encrypted banking data
   */
  static async storeBankingData(data: BankingData): Promise<void> {
    try {
      // Encrypt the data
      const encryptedData = await CryptoService.encryptBankingData(data);

      // Create storage object with metadata
      const storageData: StoredBankingData = {
        encrypted: encryptedData,
        timestamp: Date.now(),
        version: this.DATA_VERSION,
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem(this.BANKING_DATA_KEY, JSON.stringify(storageData));

      console.log("Banking data stored securely");
    } catch (error) {
      console.error("Error storing banking data:", error);
      throw new Error("Failed to store banking data securely");
    }
  }

  /**
   * Retrieve and decrypt banking data
   */
  static async getBankingData(): Promise<BankingData | null> {
    try {
      // Get stored data
      const storedDataStr = await AsyncStorage.getItem(this.BANKING_DATA_KEY);

      if (!storedDataStr) {
        return null;
      }

      const storedData: StoredBankingData = JSON.parse(storedDataStr);

      // Check if data is expired (optional security measure)
      const isExpired = Date.now() - storedData.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        await this.clearBankingData();
        return null;
      }

      // Check version compatibility
      if (storedData.version !== this.DATA_VERSION) {
        console.warn("Banking data version mismatch, clearing data");
        await this.clearBankingData();
        return null;
      }

      // Decrypt the data
      const decryptedData = await CryptoService.decryptBankingData(storedData.encrypted);

      return decryptedData;
    } catch (error) {
      console.error("Error retrieving banking data:", error);
      // Clear potentially corrupted data
      await this.clearBankingData();
      return null;
    }
  }

  /**
   * Update specific banking data fields
   */
  static async updateBankingData(updates: Partial<BankingData>): Promise<void> {
    try {
      // Get existing data
      const existingData = (await this.getBankingData()) || {};

      // Merge with updates
      const updatedData: BankingData = {
        ...existingData,
        ...updates,
      };

      // Store the updated data
      await this.storeBankingData(updatedData);
    } catch (error) {
      console.error("Error updating banking data:", error);
      throw new Error("Failed to update banking data");
    }
  }

  /**
   * Clear all stored banking data
   */
  static async clearBankingData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.BANKING_DATA_KEY);
      console.log("Banking data cleared");
    } catch (error) {
      console.error("Error clearing banking data:", error);
    }
  }

  /**
   * Check if banking data exists
   */
  static async hasBankingData(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.BANKING_DATA_KEY);
      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get masked account number for display
   */
  static async getMaskedAccountNumber(): Promise<string | null> {
    try {
      const data = await this.getBankingData();
      if (data?.accountNumber) {
        return CryptoService.formatAccountNumber(data.accountNumber);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Validate data integrity
   */
  static async validateDataIntegrity(): Promise<boolean> {
    try {
      const data = await this.getBankingData();
      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Store encrypted transaction data
   */
  static async storeTransactionData(transactions: Transaction[]): Promise<void> {
    try {
      // Encrypt the transactions
      const encryptedTransactions = await CryptoService.encryptTransactions(transactions);

      // Create storage object with metadata
      const storageData: StoredTransactionData = {
        encrypted: encryptedTransactions,
        timestamp: Date.now(),
        version: this.DATA_VERSION,
      };

      // Store in AsyncStorage
      await AsyncStorage.setItem(this.TRANSACTION_DATA_KEY, JSON.stringify(storageData));

      console.log("Transaction data stored securely");
    } catch (error) {
      console.error("Error storing transaction data:", error);
      throw new Error("Failed to store transaction data securely");
    }
  }

  /**
   * Retrieve and decrypt transaction data
   */
  static async getTransactionData(): Promise<Transaction[] | null> {
    try {
      // Get stored data
      const storedDataStr = await AsyncStorage.getItem(this.TRANSACTION_DATA_KEY);

      if (!storedDataStr) {
        return null;
      }

      const storedData: StoredTransactionData = JSON.parse(storedDataStr);

      // Check if data is expired (optional security measure)
      const isExpired = Date.now() - storedData.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        await this.clearTransactionData();
        return null;
      }

      // Check version compatibility
      if (storedData.version !== this.DATA_VERSION) {
        console.warn("Transaction data version mismatch, clearing data");
        await this.clearTransactionData();
        return null;
      }

      // Decrypt the data
      const decryptedTransactions = await CryptoService.decryptTransactions(storedData.encrypted);

      return decryptedTransactions;
    } catch (error) {
      console.error("Error retrieving transaction data:", error);
      // Clear potentially corrupted data
      await this.clearTransactionData();
      return null;
    }
  }

  /**
   * Clear all stored transaction data
   */
  static async clearTransactionData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TRANSACTION_DATA_KEY);
      console.log("Transaction data cleared");
    } catch (error) {
      console.error("Error clearing transaction data:", error);
    }
  }

  /**
   * Check if transaction data exists
   */
  static async hasTransactionData(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.TRANSACTION_DATA_KEY);
      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Add a new transaction to existing data
   */
  static async addTransaction(transaction: Transaction): Promise<void> {
    try {
      // Get existing transactions
      const existingTransactions = (await this.getTransactionData()) || [];

      // Add new transaction
      const updatedTransactions = [...existingTransactions, transaction];

      // Store the updated transactions
      await this.storeTransactionData(updatedTransactions);
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw new Error("Failed to add transaction");
    }
  }

  /**
   * Update a transaction by ID
   */
  static async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<void> {
    try {
      // Get existing transactions
      const existingTransactions = (await this.getTransactionData()) || [];

      // Find and update the transaction
      const updatedTransactions = existingTransactions.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, ...updates } : transaction
      );

      // Store the updated transactions
      await this.storeTransactionData(updatedTransactions);
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw new Error("Failed to update transaction");
    }
  }

  /**
   * Delete a transaction by ID
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      // Get existing transactions
      const existingTransactions = (await this.getTransactionData()) || [];

      // Filter out the transaction to delete
      const updatedTransactions = existingTransactions.filter(
        (transaction) => transaction.id !== transactionId
      );

      // Store the updated transactions
      await this.storeTransactionData(updatedTransactions);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw new Error("Failed to delete transaction");
    }
  }

  /**
   * Complete security reset (for logout)
   */
  static async securityReset(): Promise<void> {
    try {
      await Promise.all([
        this.clearBankingData(),
        this.clearTransactionData(),
        CryptoService.clearEncryptionKeys(),
      ]);
      console.log("Complete security reset performed");
    } catch (error) {
      console.error("Error during security reset:", error);
    }
  }

  /**
   * Initialize with default banking data (for demo/testing)
   */
  static async initializeWithDefaults(): Promise<void> {
    try {
      const hasData = await this.hasBankingData();

      if (!hasData) {
        await this.storeBankingData(defaultBankingData as BankingData);
        console.log("Initialized with default banking data");
      }
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  /**
   * Initialize with default transaction data (for demo/testing)
   */
  static async initializeWithDefaultTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const hasData = await this.hasTransactionData();

      if (!hasData) {
        await this.storeTransactionData(transactions);
        console.log("Initialized with default transaction data");
      }
    } catch (error) {
      console.error("Error initializing default transaction data:", error);
    }
  }
}

export default SecureStorageService;
// Types are now centralized in @/interfaces
