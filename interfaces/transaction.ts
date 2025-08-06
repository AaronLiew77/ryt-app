export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: "debit" | "credit";
  category?: string;
}

export interface EncryptedTransaction {
  id: string; // Keep ID unencrypted for indexing
  title: EncryptedData;
  subtitle: EncryptedData;
  amount: EncryptedData;
  date: EncryptedData;
  type: EncryptedData;
  category: EncryptedData;
}

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  hmac: string;
}
