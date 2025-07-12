import { AuthContextType, AuthProviderProps } from "@/interfaces";
import SecureStorageService from "@/services/secureStorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "@ryt_app_auth";
const PIN_KEY = "@ryt_app_pin";

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const authState = await AsyncStorage.getItem(AUTH_KEY);
      const storedPin = await AsyncStorage.getItem(PIN_KEY);

      setIsAuthenticated(authState === "true");
      setHasPin(!!storedPin);
    } catch (error) {
      console.log("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
    } catch (error) {
      console.log("Error saving auth state:", error);
    }
  };

  const logout = async () => {
    try {
      // Clear authentication state
      await AsyncStorage.removeItem(AUTH_KEY);

      // Perform complete security reset (clear encrypted data and keys)
      await SecureStorageService.securityReset();

      setIsAuthenticated(false);
      console.log("User logged out with complete security reset");
    } catch (error) {
      console.log("Error during logout:", error);
      // Even if security reset fails, clear auth state
      setIsAuthenticated(false);
    }
  };

  const setPin = async (pin: string) => {
    try {
      await AsyncStorage.setItem(PIN_KEY, pin);
      setHasPin(true);
    } catch (error) {
      console.log("Error saving PIN:", error);
      throw error;
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await AsyncStorage.getItem(PIN_KEY);
      return storedPin === pin;
    } catch (error) {
      console.log("Error verifying PIN:", error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPin,
    setPin,
    verifyPin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
