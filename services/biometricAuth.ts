import * as LocalAuthentication from "expo-local-authentication";

export type BiometricType = "fingerprint" | "face" | "iris" | "none";

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

class BiometricAuthService {
  async isDeviceSupported(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      console.log("Error checking device compatibility:", error);
      return false;
    }
  }

  async isEnrolled(): Promise<boolean> {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.log("Error checking enrollment:", error);
      return false;
    }
  }

  async getSupportedBiometricTypes(): Promise<BiometricType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometricTypes: BiometricType[] = [];

      types.forEach((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            biometricTypes.push("fingerprint");
            break;
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            biometricTypes.push("face");
            break;
          case LocalAuthentication.AuthenticationType.IRIS:
            biometricTypes.push("iris");
            break;
        }
      });

      return biometricTypes.length > 0 ? biometricTypes : ["none"];
    } catch (error) {
      console.log("Error getting supported types:", error);
      return ["none"];
    }
  }

  async authenticate(): Promise<BiometricAuthResult> {
    try {
      // Check if device supports biometric authentication
      const isSupported = await this.isDeviceSupported();
      if (!isSupported) {
        return {
          success: false,
          error: "Biometric authentication is not supported on this device",
        };
      }

      // Check if user has enrolled biometric data
      const isEnrolled = await this.isEnrolled();
      if (!isEnrolled) {
        return {
          success: false,
          error: "No biometric data is enrolled on this device",
        };
      }

      // Get biometric types for better user experience
      const biometricTypes = await this.getSupportedBiometricTypes();
      const primaryBiometric = biometricTypes[0];

      // Create appropriate prompt message based on biometric type
      let promptMessage = "Use your biometric to authenticate";
      let fallbackLabel = "Use PIN instead";

      if (primaryBiometric === "fingerprint") {
        promptMessage = "Place your finger on the sensor";
      } else if (primaryBiometric === "face") {
        promptMessage = "Look at the camera to authenticate";
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel,
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });

      if (result.success) {
        return {
          success: true,
          biometricType: primaryBiometric,
        };
      } else {
        return {
          success: false,
          error: result.error || "Authentication failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication error",
      };
    }
  }

  async authenticateWithOptions(options: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
  }): Promise<BiometricAuthResult> {
    try {
      const isSupported = await this.isDeviceSupported();
      if (!isSupported) {
        return { success: false, error: "Biometric authentication not supported" };
      }

      const isEnrolled = await this.isEnrolled();
      if (!isEnrolled) {
        return { success: false, error: "No biometric data enrolled" };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options.promptMessage || "Authenticate to continue",
        cancelLabel: options.cancelLabel || "Cancel",
        fallbackLabel: options.fallbackLabel || "Use PIN",
        disableDeviceFallback: false,
      });

      const biometricTypes = await this.getSupportedBiometricTypes();

      return {
        success: result.success,
        error: result.success ? undefined : result.error || "Authentication failed",
        biometricType: result.success ? biometricTypes[0] : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication error",
      };
    }
  }
}

export const biometricAuthService = new BiometricAuthService();
