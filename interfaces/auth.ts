import { ReactNode } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasPin: boolean;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export type BiometricType = "fingerprint" | "face" | "iris" | "none";

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

export type AuthMode = "biometric" | "pin-setup" | "pin-verify";
