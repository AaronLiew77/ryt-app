import { useTheme } from "@/contexts/ThemeContext";
import { TransactionItemProps } from "@/interfaces";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

export function TransactionItem({
  transaction,
  onPress,
  showBorder = false,
}: TransactionItemProps) {
  const { resolvedTheme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
    }).format(Math.abs(amount));
  };

  const borderStyle = showBorder
    ? {
        borderBottomWidth: 1,
        borderBottomColor:
          resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      }
    : {};

  return (
    <TouchableOpacity
      onPress={() => onPress?.(transaction)}
      className='px-5 py-4'
      style={borderStyle}
    >
      <View className='flex-row justify-between items-center'>
        <View className='flex-1 mr-4'>
          <ThemedText className='font-medium text-base' numberOfLines={1} ellipsizeMode='tail'>
            {transaction.title}
          </ThemedText>
          <ThemedText
            className='text-base mt-1'
            lightColor='#6B7280'
            darkColor='#9CA3AF'
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {transaction.date}
          </ThemedText>
        </View>

        <View className='items-end'>
          <ThemedText
            className='font-semibold text-sm'
            style={{
              color: transaction.type === "credit" ? "#10b981" : "#ef4444",
            }}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {transaction.type === "credit" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </ThemedText>
          {transaction.category && (
            <ThemedText
              className='text-sm'
              lightColor='#9CA3AF'
              darkColor='#6B7280'
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {transaction.category}
            </ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
