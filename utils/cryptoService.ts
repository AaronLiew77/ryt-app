import {
  BankingData,
  EncryptedBankingData,
  EncryptedData,
  EncryptedTransaction,
  Transaction,
} from "@/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

class CryptoService {
  private static readonly ENCRYPTION_KEY = "BANKING_ENCRYPTION_KEY";
  private static readonly FALLBACK_KEY = "FALLBACK_BANKING_KEY";
  private static readonly HMAC_KEY = "BANKING_HMAC_KEY";
  private static readonly FALLBACK_HMAC_KEY = "FALLBACK_BANKING_HMAC_KEY";
  private static readonly KEY_SIZE = 256; // 256-bit AES
  private static readonly IV_SIZE = 16; // 128-bit IV
  private static readonly HMAC_SIZE = 32; // 256-bit HMAC key

  /**
   * Check if SecureStore is available
   */
  private static async isSecureStoreAvailable(): Promise<boolean> {
    try {
      // Check if we're on web platform first
      // @ts-ignore - Platform check for web
      if (typeof window !== "undefined") {
        // We're on web, SecureStore is not available
        return false;
      }

      // Check if SecureStore methods exist before calling them
      if (!SecureStore.getItemAsync || typeof SecureStore.getItemAsync !== "function") {
        return false;
      }

      // Try a simple operation to check if SecureStore works
      await SecureStore.getItemAsync("test_availability");
      return true;
    } catch (error) {
      console.warn("SecureStore not available, falling back to AsyncStorage:", error);
      return false;
    }
  }

  /**
   * Generate or retrieve the encryption key from secure storage (with fallback)
   */
  private static async getOrCreateEncryptionKey(): Promise<string> {
    try {
      const isSecureStoreReady = await this.isSecureStoreAvailable();

      let key: string | null = null;

      if (isSecureStoreReady) {
        // Try to use SecureStore first
        key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
      } else {
        // Fallback to AsyncStorage
        key = await AsyncStorage.getItem(this.FALLBACK_KEY);
      }

      if (!key) {
        // Generate a new 256-bit key using expo-crypto
        const randomBytes = await Crypto.getRandomBytesAsync(32); // 32 bytes = 256 bits
        key = Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Store the key securely (or fallback storage)
        if (isSecureStoreReady) {
          await SecureStore.setItemAsync(this.ENCRYPTION_KEY, key);
        } else {
          await AsyncStorage.setItem(this.FALLBACK_KEY, key);
        }
      }

      return key;
    } catch (error) {
      console.error("Error managing encryption key:", error);
      throw new Error("Failed to manage encryption key");
    }
  }

  /**
   * Generate or retrieve the HMAC key from secure storage (with fallback)
   */
  private static async getOrCreateHMACKey(): Promise<string> {
    try {
      const isSecureStoreReady = await this.isSecureStoreAvailable();

      let key: string | null = null;

      if (isSecureStoreReady) {
        // Try to use SecureStore first
        key = await SecureStore.getItemAsync(this.HMAC_KEY);
      } else {
        // Fallback to AsyncStorage
        key = await AsyncStorage.getItem(this.FALLBACK_HMAC_KEY);
      }

      if (!key) {
        // Generate a new 256-bit HMAC key using expo-crypto
        const randomBytes = await Crypto.getRandomBytesAsync(this.HMAC_SIZE); // 32 bytes = 256 bits
        key = Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Store the key securely (or fallback storage)
        if (isSecureStoreReady) {
          await SecureStore.setItemAsync(this.HMAC_KEY, key);
        } else {
          await AsyncStorage.setItem(this.FALLBACK_HMAC_KEY, key);
        }
      }

      return key;
    } catch (error) {
      console.error("Error managing HMAC key:", error);
      throw new Error("Failed to manage HMAC key");
    }
  }

  /**
   * Generate a random IV for each encryption operation
   */
  private static async generateIV(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(this.IV_SIZE);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Calculate HMAC-SHA256 over the ciphertext and IV
   */
  private static async calculateHMAC(ciphertext: string, iv: string): Promise<string> {
    try {
      const hmacKey = await this.getOrCreateHMACKey();
      const keyWordArray = CryptoJS.enc.Hex.parse(hmacKey);

      // Concatenate ciphertext and IV for HMAC calculation
      const message = ciphertext + iv;

      // Calculate HMAC-SHA256
      const hmac = CryptoJS.HmacSHA256(message, keyWordArray);

      return hmac.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error("HMAC calculation error:", error);
      throw new Error("Failed to calculate HMAC");
    }
  }

  /**
   * Verify HMAC-SHA256 of the ciphertext and IV
   */
  private static async verifyHMAC(
    ciphertext: string,
    iv: string,
    providedHmac: string
  ): Promise<boolean> {
    try {
      const calculatedHmac = await this.calculateHMAC(ciphertext, iv);

      // Use constant-time comparison to prevent timing attacks
      return this.constantTimeCompare(calculatedHmac, providedHmac);
    } catch (error) {
      console.error("HMAC verification error:", error);
      return false;
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Encrypt a string value using AES-256-CBC with HMAC-SHA256 authentication
   */
  private static async encryptValue(value: string): Promise<EncryptedData> {
    try {
      const key = await this.getOrCreateEncryptionKey();
      const iv = await this.generateIV();

      // Convert hex strings to CryptoJS word arrays
      const keyWordArray = CryptoJS.enc.Hex.parse(key);
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);

      // Encrypt using AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(value, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const ciphertext = encrypted.toString();

      // Calculate HMAC over ciphertext + IV (Encrypt-then-MAC)
      const hmac = await this.calculateHMAC(ciphertext, iv);

      return {
        encryptedData: ciphertext,
        iv: iv,
        hmac: hmac,
      };
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt a string value using AES-256-CBC with HMAC-SHA256 verification
   */
  private static async decryptValue(encryptedData: EncryptedData): Promise<string> {
    try {
      // First verify HMAC to ensure integrity and authenticity
      const isValid = await this.verifyHMAC(
        encryptedData.encryptedData,
        encryptedData.iv,
        encryptedData.hmac
      );

      if (!isValid) {
        throw new Error("HMAC verification failed - data may have been tampered with");
      }

      const key = await this.getOrCreateEncryptionKey();

      // Convert hex strings to CryptoJS word arrays
      const keyWordArray = CryptoJS.enc.Hex.parse(key);
      const ivWordArray = CryptoJS.enc.Hex.parse(encryptedData.iv);

      // Decrypt using AES-256-CBC
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error("Decryption resulted in empty string - invalid data or key");
      }

      return result;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Encrypt sensitive banking data
   */
  static async encryptBankingData(data: BankingData): Promise<EncryptedBankingData> {
    const encrypted: EncryptedBankingData = {};

    try {
      if (data.userName !== undefined) {
        encrypted.userName = await this.encryptValue(data.userName);
      }

      if (data.accountBalance !== undefined) {
        encrypted.accountBalance = await this.encryptValue(data.accountBalance.toString());
      }

      if (data.accountNumber !== undefined) {
        encrypted.accountNumber = await this.encryptValue(data.accountNumber);
      }

      return encrypted;
    } catch (error) {
      console.error("Error encrypting banking data:", error);
      throw new Error("Failed to encrypt banking data");
    }
  }

  /**
   * Decrypt sensitive banking data
   */
  static async decryptBankingData(encryptedData: EncryptedBankingData): Promise<BankingData> {
    const decrypted: BankingData = {};

    try {
      if (encryptedData.userName) {
        decrypted.userName = await this.decryptValue(encryptedData.userName);
      }

      if (encryptedData.accountBalance) {
        const balanceStr = await this.decryptValue(encryptedData.accountBalance);
        decrypted.accountBalance = parseFloat(balanceStr);
      }

      if (encryptedData.accountNumber) {
        decrypted.accountNumber = await this.decryptValue(encryptedData.accountNumber);
      }

      return decrypted;
    } catch (error) {
      console.error("Error decrypting banking data:", error);
      throw new Error("Failed to decrypt banking data");
    }
  }

  /**
   * Encrypt a single string (for general use)
   */
  static async encryptString(value: string): Promise<EncryptedData> {
    return await this.encryptValue(value);
  }

  /**
   * Decrypt a single string (for general use)
   */
  static async decryptString(encryptedData: EncryptedData): Promise<string> {
    return await this.decryptValue(encryptedData);
  }

  /**
   * Safely format account number for display (mask middle digits)
   */
  static formatAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;

    const firstTwo = accountNumber.substring(0, 2);
    const lastFour = accountNumber.substring(accountNumber.length - 4);
    const maskedMiddle = "*".repeat(accountNumber.length - 6);

    return `${firstTwo}${maskedMiddle}${lastFour}`;
  }

  /**
   * Clear all encryption keys (for logout/reset)
   */
  static async clearEncryptionKeys(): Promise<void> {
    try {
      const isSecureStoreReady = await this.isSecureStoreAvailable();

      if (isSecureStoreReady) {
        await SecureStore.deleteItemAsync(this.ENCRYPTION_KEY);
        await SecureStore.deleteItemAsync(this.HMAC_KEY);
      } else {
        await AsyncStorage.removeItem(this.FALLBACK_KEY);
        await AsyncStorage.removeItem(this.FALLBACK_HMAC_KEY);
      }
    } catch (error) {
      console.error("Error clearing encryption keys:", error);
    }
  }

  /**
   * Check if encryption is properly set up
   */
  static async isEncryptionReady(): Promise<boolean> {
    try {
      const isSecureStoreReady = await this.isSecureStoreAvailable();

      let key: string | null = null;

      if (isSecureStoreReady) {
        key = await SecureStore.getItemAsync(this.ENCRYPTION_KEY);
      } else {
        key = await AsyncStorage.getItem(this.FALLBACK_KEY);
      }

      return !!key;
    } catch {
      return false;
    }
  }

  /**
   * Get storage type being used
   */
  static async getStorageType(): Promise<"SecureStore" | "AsyncStorage"> {
    const isSecureStoreReady = await this.isSecureStoreAvailable();
    return isSecureStoreReady ? "SecureStore" : "AsyncStorage";
  }

  /**
   * Encrypt a single transaction
   */
  static async encryptTransaction(transaction: Transaction): Promise<EncryptedTransaction> {
    try {
      return {
        id: transaction.id, // Keep ID unencrypted for indexing
        title: await this.encryptValue(transaction.title),
        subtitle: await this.encryptValue(transaction.subtitle),
        amount: await this.encryptValue(transaction.amount.toString()),
        date: await this.encryptValue(transaction.date),
        type: await this.encryptValue(transaction.type),
        category: await this.encryptValue(transaction.category || ""),
      };
    } catch (error) {
      console.error("Error encrypting transaction:", error);
      throw new Error("Failed to encrypt transaction");
    }
  }

  /**
   * Decrypt a single transaction
   */
  static async decryptTransaction(
    encryptedTransaction: EncryptedTransaction
  ): Promise<Transaction> {
    try {
      return {
        id: encryptedTransaction.id,
        title: await this.decryptValue(encryptedTransaction.title),
        subtitle: await this.decryptValue(encryptedTransaction.subtitle),
        amount: parseFloat(await this.decryptValue(encryptedTransaction.amount)),
        date: await this.decryptValue(encryptedTransaction.date),
        type: (await this.decryptValue(encryptedTransaction.type)) as "debit" | "credit",
        category: await this.decryptValue(encryptedTransaction.category),
      };
    } catch (error) {
      console.error("Error decrypting transaction:", error);
      throw new Error("Failed to decrypt transaction");
    }
  }

  /**
   * Encrypt an array of transactions
   */
  static async encryptTransactions(transactions: Transaction[]): Promise<EncryptedTransaction[]> {
    try {
      const encryptedTransactions = await Promise.all(
        transactions.map((transaction) => this.encryptTransaction(transaction))
      );
      return encryptedTransactions;
    } catch (error) {
      console.error("Error encrypting transactions:", error);
      throw new Error("Failed to encrypt transactions");
    }
  }

  /**
   * Decrypt an array of transactions
   */
  static async decryptTransactions(
    encryptedTransactions: EncryptedTransaction[]
  ): Promise<Transaction[]> {
    try {
      const decryptedTransactions = await Promise.all(
        encryptedTransactions.map((encryptedTransaction) =>
          this.decryptTransaction(encryptedTransaction)
        )
      );
      return decryptedTransactions;
    } catch (error) {
      console.error("Error decrypting transactions:", error);
      throw new Error("Failed to decrypt transactions");
    }
  }
}

export default CryptoService;
