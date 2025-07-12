import { AccountBalanceProps } from "@/interfaces";
import { biometricAuthService } from "@/services/biometricAuth";
import CryptoService from "@/utils/cryptoService";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Clipboard,
  Easing,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

export function AccountBalance({
  balance,
  accountNumber,
  accountType = "Checking",
  onViewDetails,
}: AccountBalanceProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [copied, setCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate balance fade-in
  useEffect(() => {
    if (isBalanceVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isBalanceVisible]);

  // Animate pulse for green dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  const formatAccountNumber = (accountNum: string) => {
    // Use the secure formatting from CryptoService
    return CryptoService.formatAccountNumber(accountNum);
  };

  const handleToggleBalance = async () => {
    if (isBalanceVisible) {
      setIsBalanceVisible(false);
      return;
    }

    setIsAuthenticating(true);

    try {
      const result = await biometricAuthService.authenticateWithOptions({
        promptMessage: "Authenticate to view your balance",
        cancelLabel: "Cancel",
        fallbackLabel: "Use PIN instead",
      });

      if (result.success) {
        setIsBalanceVisible(true);
      } else {
        Alert.alert(
          "Authentication Failed",
          result.error || "Please try again to view your balance",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Authentication Error",
        "Unable to authenticate at this time. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCopyAccountNumber = () => {
    Clipboard.setString(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const renderBalance = () => {
    if (isBalanceVisible) {
      return (
        <Animated.View style={{ opacity: fadeAnim, flexDirection: "row", alignItems: "center" }}>
          <ThemedText
            className='text-white text-3xl font-bold mt-1'
            lightColor='#fff'
            darkColor='#fff'
            accessibilityLabel='Account balance visible'
          >
            {formatCurrency(balance)}
          </ThemedText>

          {/* Close/Hide button next to balance */}
          <Pressable
            onPress={handleToggleBalance}
            className='bg-white/20 rounded-full p-2 ml-3'
            accessibilityLabel='Hide balance'
          >
            <IconSymbol name='eye.slash' size={18} color='#F6F6F6' />
          </Pressable>
        </Animated.View>
      );
    }
    return (
      <View className='flex-row items-center'>
        <ThemedText
          className='text-white text-3xl font-bold mt-1'
          lightColor='#fff'
          darkColor='#fff'
          accessibilityLabel='Account balance hidden'
        >
          ••••••••
        </ThemedText>

        {/* Show/Eye button in the same position as eye.slash */}
        <Pressable
          onPress={handleToggleBalance}
          disabled={isAuthenticating}
          className='bg-white/20 rounded-full p-2 ml-3'
          accessibilityLabel='Show balance'
        >
          {isAuthenticating ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
              }}
            >
              {/* Animated dots for authenticating */}
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "white",
                    marginHorizontal: 1,
                    opacity: isAuthenticating ? 0.5 + 0.5 * Math.sin(Date.now() / 200 + i) : 1,
                  }}
                />
              ))}
            </View>
          ) : (
            <IconSymbol name='eye' size={18} color='#F6F6F6' />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onViewDetails}
      className='my-4'
      accessibilityLabel='View account details'
    >
      <LinearGradient
        colors={["#2563eb", "#1e40af", "#1e3a8a"]} // blue-600, blue-700, blue-800
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 24,
          shadowColor: "#2563eb",
          shadowOpacity: 0.2,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(59,130,246,0.2)", // blue-500 with opacity
        }}
      >
        {/* Header Section */}
        <View className='flex-row justify-between items-start mb-6'>
          <View className='flex-1'>
            <ThemedText
              className='text-white text-sm opacity-90 font-medium'
              lightColor='#fff'
              darkColor='#fff'
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.7}
            >
              {accountType} Account
            </ThemedText>
            <View className='flex-row items-center mt-1'>
              <ThemedText
                className='text-white text-xs opacity-75 font-mono'
                lightColor='#fff'
                darkColor='#fff'
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {formatAccountNumber(accountNumber)}
              </ThemedText>
              <Pressable
                onPress={handleCopyAccountNumber}
                accessibilityLabel={copied ? "Copied!" : "Copy account number"}
                className='ml-2 p-1 rounded bg-white/10'
              >
                <IconSymbol name='doc.on.doc' size={16} color={copied ? "#34D399" : "#F6F6F6"} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Balance Section */}
        <View className='mb-6'>
          <ThemedText
            className='text-white text-sm opacity-90 font-medium'
            lightColor='#fff'
            darkColor='#fff'
          >
            Available Balance
          </ThemedText>
          <View className={`mt-2 ${isAuthenticating ? "opacity-70" : ""}`}>{renderBalance()}</View>
        </View>

        {/* Security & Action Section */}
        <View className='flex-row justify-between items-center mt-2'>
          <View className='flex-row items-center'>
            <Animated.View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginRight: 8,
                backgroundColor: "#34D399",
                transform: [{ scale: pulseAnim }],
              }}
              accessibilityLabel='Encrypted and secure indicator'
            />
            <ThemedText
              className='text-white text-xs opacity-75'
              lightColor='#fff'
              darkColor='#fff'
            >
              Encrypted & Secure
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
