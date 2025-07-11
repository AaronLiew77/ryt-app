import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasPin: boolean;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "@ryt_app_auth";
const PIN_KEY = "@ryt_app_pin";

interface AuthProviderProps {
  children: ReactNode;
}

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
      await AsyncStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
    } catch (error) {
      console.log("Error clearing auth state:", error);
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
