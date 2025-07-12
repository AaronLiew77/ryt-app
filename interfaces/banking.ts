import { EncryptedData, EncryptedTransaction } from "./transaction";

export interface BankingData {
  userName?: string;
  accountBalance?: number;
  accountNumber?: string;
}

export interface EncryptedBankingData {
  userName?: EncryptedData;
  accountBalance?: EncryptedData;
  accountNumber?: EncryptedData;
}

export interface StoredBankingData {
  encrypted: EncryptedBankingData;
  timestamp: number;
  version: string;
}

export interface StoredTransactionData {
  encrypted: EncryptedTransaction[];
  timestamp: number;
  version: string;
}

// Re-export EncryptedTransaction for convenience
export type { EncryptedTransaction } from "./transaction";
