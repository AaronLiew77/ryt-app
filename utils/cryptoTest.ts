import { BankingData } from "@/interfaces";
import CryptoService from "./cryptoService";

/**
 * Test utility to demonstrate AES-256-CBC + HMAC-SHA256 encryption working properly
 * This can be used in development to verify encryption functionality and integrity protection
 */
export class CryptoTest {
  /**
   * Test basic string encryption/decryption with HMAC
   */
  static async testStringEncryption() {
    console.log("🔒 Testing AES-256-CBC + HMAC-SHA256 String Encryption...");

    const testString = "Sarah Johnson";

    try {
      // Encrypt the string
      const encrypted = await CryptoService.encryptString(testString);
      console.log("✅ Encrypted data:", {
        original: testString,
        encrypted: encrypted.encryptedData.substring(0, 20) + "...",
        iv: encrypted.iv,
        hmac: encrypted.hmac.substring(0, 16) + "...",
      });

      // Decrypt the string
      const decrypted = await CryptoService.decryptString(encrypted);
      console.log("✅ Decrypted:", decrypted);

      // Verify they match
      const isValid = testString === decrypted;
      console.log("✅ Encryption/Decryption Valid:", isValid);

      return isValid;
    } catch (error) {
      console.error("❌ String encryption test failed:", error);
      return false;
    }
  }

  /**
   * Test banking data encryption/decryption
   */
  static async testBankingDataEncryption() {
    console.log("🏦 Testing Banking Data Encryption...");

    const testData: BankingData = {
      userName: "Sarah Johnson",
      accountBalance: 15234.76,
      accountNumber: "9876543210",
    };

    try {
      // Encrypt banking data
      const encrypted = await CryptoService.encryptBankingData(testData);
      console.log("✅ Banking data encrypted:", {
        userName: encrypted.userName ? "ENCRYPTED" : "null",
        accountBalance: encrypted.accountBalance ? "ENCRYPTED" : "null",
        accountNumber: encrypted.accountNumber ? "ENCRYPTED" : "null",
      });

      // Decrypt banking data
      const decrypted = await CryptoService.decryptBankingData(encrypted);
      console.log("✅ Banking data decrypted:", decrypted);

      // Verify all fields match
      const isValid =
        testData.userName === decrypted.userName &&
        testData.accountBalance === decrypted.accountBalance &&
        testData.accountNumber === decrypted.accountNumber;

      console.log("✅ Banking Data Encryption Valid:", isValid);

      return isValid;
    } catch (error) {
      console.error("❌ Banking data encryption test failed:", error);
      return false;
    }
  }

  /**
   * Test HMAC integrity protection
   */
  static async testHMACIntegrity() {
    console.log("🛡️  Testing HMAC Integrity Protection...");

    const testString = "Sensitive banking data";

    try {
      // Encrypt the string
      const encrypted = await CryptoService.encryptString(testString);
      console.log("✅ Original encrypted data valid");

      // Test 1: Try to decrypt with tampered ciphertext
      const tamperedData1 = {
        ...encrypted,
        encryptedData: encrypted.encryptedData.slice(0, -1) + "X", // Change last character
      };

      try {
        await CryptoService.decryptString(tamperedData1);
        console.error("❌ SECURITY ISSUE: Tampered ciphertext was accepted!");
        return false;
      } catch (error) {
        console.log("✅ Tampered ciphertext rejected:", error.message);
      }

      // Test 2: Try to decrypt with tampered IV
      const tamperedData2 = {
        ...encrypted,
        iv: encrypted.iv.slice(0, -1) + "X", // Change last character of IV
      };

      try {
        await CryptoService.decryptString(tamperedData2);
        console.error("❌ SECURITY ISSUE: Tampered IV was accepted!");
        return false;
      } catch (error) {
        console.log("✅ Tampered IV rejected:", error.message);
      }

      // Test 3: Try to decrypt with tampered HMAC
      const tamperedData3 = {
        ...encrypted,
        hmac: encrypted.hmac.slice(0, -1) + "X", // Change last character of HMAC
      };

      try {
        await CryptoService.decryptString(tamperedData3);
        console.error("❌ SECURITY ISSUE: Tampered HMAC was accepted!");
        return false;
      } catch (error) {
        console.log("✅ Tampered HMAC rejected:", error.message);
      }

      console.log("✅ HMAC Integrity Protection: PASS");
      return true;
    } catch (error) {
      console.error("❌ HMAC integrity test failed:", error);
      return false;
    }
  }

  /**
   * Test account number formatting
   */
  static testAccountNumberFormatting() {
    console.log("🔢 Testing Account Number Formatting...");

    const testNumbers = ["1234567890", "9876543210", "123456", "1234"];

    testNumbers.forEach((number) => {
      const formatted = CryptoService.formatAccountNumber(number);
      console.log(`✅ ${number} → ${formatted}`);
    });

    return true;
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log("🧪 Running AES-256-CBC + HMAC-SHA256 Encryption Tests...\n");

    const tests = [
      await this.testStringEncryption(),
      await this.testBankingDataEncryption(),
      await this.testHMACIntegrity(),
      this.testAccountNumberFormatting(),
    ];

    const allPassed = tests.every((test) => test);

    console.log("\n📊 Test Results:");
    console.log(`✅ String Encryption: ${tests[0] ? "PASS" : "FAIL"}`);
    console.log(`✅ Banking Data Encryption: ${tests[1] ? "PASS" : "FAIL"}`);
    console.log(`🛡️  HMAC Integrity Protection: ${tests[2] ? "PASS" : "FAIL"}`);
    console.log(`✅ Account Formatting: ${tests[3] ? "PASS" : "FAIL"}`);
    console.log(`\n🎯 Overall: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);

    return allPassed;
  }

  /**
   * Performance test
   */
  static async performanceTest() {
    console.log("⚡ Running Performance Test...");

    const iterations = 100;
    const testData = { userName: "Test User", accountBalance: 1000, accountNumber: "1234567890" };

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const encrypted = await CryptoService.encryptBankingData(testData);
      await CryptoService.decryptBankingData(encrypted);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ ${iterations} encrypt/decrypt cycles completed in ${totalTime}ms`);
    console.log(`✅ Average time per cycle: ${avgTime.toFixed(2)}ms`);

    return { totalTime, avgTime, iterations };
  }
}

// Auto-run tests in development (optional)
if (__DEV__) {
  // Uncomment to run tests automatically in development
  // setTimeout(() => CryptoTest.runAllTests(), 2000);
}
