import { Transaction } from "./transaction";

export interface PinEntryProps {
  mode: "setup" | "verify";
  onPinComplete: (pin: string) => void;
  onCancel?: () => void;
  maxLength?: number;
  title?: string;
  subtitle?: string;
  errorMessage?: string;
}

export interface BankingHeaderProps {
  userName: string;
  onProfilePress?: () => void;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export interface QuickActionsProps {
  actions?: QuickAction[];
}

export interface AccountBalanceProps {
  balance: number;
  accountNumber: string;
  accountType?: string;
  onViewDetails?: () => void;
}

export interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  showBorder?: boolean;
}

export interface RecentTransactionsProps {
  transactions?: Transaction[];
  onViewAll?: () => void;
  onTransactionPress?: (transaction: Transaction) => void;
}

export interface BankingHomeProps {
  userName: string;
  accountBalance: number;
  accountNumber: string;
  transactions?: Transaction[];
}
