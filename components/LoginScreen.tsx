import { AuthMode, BiometricType } from "@/interfaces";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { biometricAuthService } from "../services/biometricAuth";
import { PinEntry } from "./PinEntry";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function LoginScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>("biometric");
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");

  const { login, hasPin, setPin, verifyPin } = useAuth();

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      const isSupported = await biometricAuthService.isDeviceSupported();
      const isEnrolled = await biometricAuthService.isEnrolled();
      const supportedTypes = await biometricAuthService.getSupportedBiometricTypes();

      setBiometricType(supportedTypes[0]);

      if (isSupported && isEnrolled) {
        // Automatically try biometric authentication
        handleBiometricAuth();
      } else if (!hasPin) {
        // No biometric and no PIN setup, require PIN setup
        setAuthMode("pin-setup");
      } else {
        // Fall back to PIN
        setAuthMode("pin-verify");
      }
    } catch (error) {
      console.log("Error initializing biometric:", error);
      if (!hasPin) {
        setAuthMode("pin-setup");
      } else {
        setAuthMode("pin-verify");
      }
    }
  };

  const handleSuccessfulAuth = async () => {
    await login();
    router.replace("/(tabs)");
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await biometricAuthService.authenticate();

      if (result.success) {
        await handleSuccessfulAuth();
      } else {
        setError(result.error || "Biometric authentication failed");
        // Fall back to PIN if available, otherwise require PIN setup
        if (hasPin) {
          setAuthMode("pin-verify");
        } else {
          setAuthMode("pin-setup");
        }
      }
    } catch (error) {
      setError("Authentication error occurred");
      if (hasPin) {
        setAuthMode("pin-verify");
      } else {
        setAuthMode("pin-setup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSetup = async (pin: string) => {
    setIsLoading(true);
    setPinError("");

    try {
      await setPin(pin);
      await handleSuccessfulAuth();
    } catch (error) {
      setPinError("Failed to set PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinVerify = async (pin: string) => {
    setIsLoading(true);
    setPinError("");

    try {
      const isValid = await verifyPin(pin);

      if (isValid) {
        await handleSuccessfulAuth();
      } else {
        setPinError("Incorrect PIN. Please try again.");
      }
    } catch (error) {
      setPinError("Failed to verify PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case "fingerprint":
        return "👆";
      case "face":
        return "😊";
      case "iris":
        return "👁️";
      default:
        return "🔐";
    }
  };

  const getBiometricText = () => {
    switch (biometricType) {
      case "fingerprint":
        return "Use your fingerprint";
      case "face":
        return "Use Face ID";
      case "iris":
        return "Use iris recognition";
      default:
        return "Use biometric authentication";
    }
  };

  if (authMode === "pin-setup") {
    return (
      <PinEntry
        mode='setup'
        onPinComplete={handlePinSetup}
        title='Welcome to RYT Bank'
        subtitle='Set up a secure PIN to protect your account'
        errorMessage={pinError}
      />
    );
  }

  if (authMode === "pin-verify") {
    return (
      <PinEntry
        mode='verify'
        onPinComplete={handlePinVerify}
        onCancel={biometricType !== "none" ? () => setAuthMode("biometric") : undefined}
        errorMessage={pinError}
      />
    );
  }

  // Biometric authentication screen
  return (
    <ThemedView className='flex-1 bg-gray-50 justify-center items-center px-6'>
      <View className='items-center mb-12'>
        <View className='w-32 h-32 bg-blue-600 rounded-full items-center justify-center mb-8'>
          <ThemedText className='text-white text-4xl font-bold'>RYT</ThemedText>
        </View>

        <ThemedText type='title' className='text-gray-900 text-center mb-2'>
          Welcome to RYT Bank
        </ThemedText>
        <ThemedText className='text-gray-600 text-center text-base'>
          Your secure banking companion
        </ThemedText>
      </View>

      {isLoading ? (
        <View className='items-center'>
          <ActivityIndicator size='large' color='#2563eb' />
          <ThemedText className='text-gray-600 mt-4'>Authenticating...</ThemedText>
        </View>
      ) : (
        <View className='items-center w-full'>
          {biometricType !== "none" && (
            <>
              <TouchableOpacity
                onPress={handleBiometricAuth}
                className='bg-blue-600 px-8 py-4 rounded-xl mb-4'
              >
                <ThemedText className='text-white font-semibold text-lg text-center'>
                  {getBiometricText()}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          {hasPin && (
            <TouchableOpacity
              onPress={() => setAuthMode("pin-verify")}
              className='bg-gray-200 px-8 py-4 rounded-xl mb-4'
            >
              <ThemedText className='text-gray-700 font-semibold text-lg text-center'>
                Use PIN instead
              </ThemedText>
            </TouchableOpacity>
          )}

          {!hasPin && biometricType === "none" && (
            <TouchableOpacity
              onPress={() => setAuthMode("pin-setup")}
              className='bg-blue-600 px-8 py-4 rounded-xl mb-4'
            >
              <ThemedText className='text-white font-semibold text-lg text-center'>
                Set up PIN
              </ThemedText>
            </TouchableOpacity>
          )}

          {error ? (
            <ThemedText className='text-red-500 text-center mt-4 text-sm hidden'>
              {error}
            </ThemedText>
          ) : null}
        </View>
      )}

      <View className='absolute bottom-8 left-0 right-0 items-center'>
        <ThemedText className='text-gray-500 text-sm text-center'>
          Secure • Private • Protected
        </ThemedText>
      </View>
    </ThemedView>
  );
}
