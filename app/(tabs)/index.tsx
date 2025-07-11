import { BankingHome } from "@/components/BankingHome";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function HomeTab() {
  return (
    <SafeAreaView className='flex-1 bg-black'>
      <BankingHome userName='Sarah Johnson' accountBalance={15234.76} accountNumber='9876543210' />
    </SafeAreaView>
  );
}
