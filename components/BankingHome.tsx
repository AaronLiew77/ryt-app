import { BankingHomeProps } from "@/interfaces";
import { useRouter } from "expo-router";
import { Alert, ScrollView } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { AccountBalance } from "./AccountBalance";
import { BankingHeader } from "./BankingHeader";
import { QuickActions } from "./QuickActions";
import { RecentTransactions } from "./RecentTransactions";
import { ThemedView } from "./ThemedView";

export function BankingHome({
  userName,
  accountBalance,
  accountNumber,
  transactions,
}: BankingHomeProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleProfilePress = () => {
    Alert.alert("Account Options", "What would you like to do?", [
      { text: "Settings", onPress: () => router.push("/explore") },
      { text: "Logout", onPress: handleLogout, style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  const handleViewAccountDetails = () => {
    console.log("View account details");
  };

  const handleViewAllTransactions = () => {
    router.push("/(tabs)/transactions");
  };

  const handleTransactionPress = (transaction: any) => {
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
  };

  return (
    <ThemedView className='flex-1 px-6'>
      <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
        <BankingHeader userName={userName} onProfilePress={handleProfilePress} />

        <AccountBalance
          balance={accountBalance}
          accountNumber={accountNumber}
          onViewDetails={handleViewAccountDetails}
        />

        <QuickActions />

        <RecentTransactions
          transactions={transactions}
          onViewAll={handleViewAllTransactions}
          onTransactionPress={handleTransactionPress}
        />
      </ScrollView>
    </ThemedView>
  );
}
