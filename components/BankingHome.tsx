import { router } from "expo-router";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { AccountBalance } from "./AccountBalance";
import { BankingHeader } from "./BankingHeader";
import { QuickActions } from "./QuickActions";
import { RecentTransactions } from "./RecentTransactions";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface BankingHomeProps {
  userName?: string;
  accountBalance?: number;
  accountNumber?: string;
}

export function BankingHome({
  userName = "John Doe",
  accountBalance = 12847.5,
  accountNumber = "1234567890",
}: BankingHomeProps) {
  const { logout } = useAuth();

  const handleProfilePress = () => {
    Alert.alert("Account Options", "What would you like to do?", [
      { text: "View Profile", onPress: () => console.log("View Profile") },
      { text: "Settings", onPress: () => console.log("Settings") },
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
    console.log("View all transactions");
  };

  const handleTransactionPress = (transaction: any) => {
    console.log("Transaction pressed:", transaction);
  };

  return (
    <ThemedView className='flex-1 bg-gray-50'>
      <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
        <BankingHeader userName={userName} onProfilePress={handleProfilePress} />

        {/* Logout Button */}
        <ThemedView className='px-6 mb-4'>
          <TouchableOpacity
            onPress={handleLogout}
            className='bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex-row items-center justify-center'
          >
            <ThemedText className='text-red-600 font-medium mr-2'>🚪</ThemedText>
            <ThemedText className='text-red-600 font-medium'>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <AccountBalance
          balance={accountBalance}
          accountNumber={accountNumber}
          onViewDetails={handleViewAccountDetails}
        />

        <QuickActions />

        <RecentTransactions
          onViewAll={handleViewAllTransactions}
          onTransactionPress={handleTransactionPress}
        />

        {/* Add some bottom padding for scroll comfort */}
        <ThemedView className='h-8' />
      </ScrollView>
    </ThemedView>
  );
}
