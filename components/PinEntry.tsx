import { PinEntryProps } from "@/interfaces";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, Vibration, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export function PinEntry({
  mode,
  onPinComplete,
  onCancel,
  maxLength = 6,
  title,
  subtitle,
  errorMessage,
}: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  const defaultTitle = mode === "setup" ? "Set up your PIN" : "Enter your PIN";
  const defaultSubtitle =
    mode === "setup"
      ? "Choose a secure PIN to protect your account"
      : "Use your PIN to access your account";

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  const handleNumberPress = (number: string) => {
    setError("");

    if (mode === "setup" && isConfirming) {
      if (confirmPin.length < maxLength) {
        const newConfirmPin = confirmPin + number;
        setConfirmPin(newConfirmPin);

        if (newConfirmPin.length === maxLength) {
          if (newConfirmPin === pin) {
            onPinComplete(newConfirmPin);
          } else {
            setError("PINs do not match. Please try again.");
            Vibration.vibrate(200);
            setPin("");
            setConfirmPin("");
            setIsConfirming(false);
          }
        }
      }
    } else {
      if (pin.length < maxLength) {
        const newPin = pin + number;
        setPin(newPin);

        if (newPin.length === maxLength) {
          if (mode === "setup") {
            setIsConfirming(true);
          } else {
            onPinComplete(newPin);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setError("");

    if (mode === "setup" && isConfirming) {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    setError("");
    setPin("");
    setConfirmPin("");
    setIsConfirming(false);
  };

  const currentPin = mode === "setup" && isConfirming ? confirmPin : pin;
  const currentTitle = mode === "setup" && isConfirming ? "Confirm your PIN" : displayTitle;
  const currentSubtitle =
    mode === "setup" && isConfirming ? "Re-enter your PIN to confirm" : displaySubtitle;

  const renderPinDots = () => {
    return (
      <View className='flex-row justify-center items-center my-8'>
        {Array.from({ length: maxLength }).map((_, index) => (
          <View
            key={index}
            className={`w-4 h-4 rounded-full mx-2 ${
              index < currentPin.length ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    );
  };

  const renderNumberButton = (number: string) => (
    <TouchableOpacity
      key={number}
      onPress={() => handleNumberPress(number)}
      className='w-20 h-20 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm'
    >
      <ThemedText className='text-2xl font-semibold text-gray-900'>{number}</ThemedText>
    </TouchableOpacity>
  );

  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "delete"],
  ];

  return (
    <ThemedView className='flex-1 bg-gray-50 px-6 justify-center'>
      <View className='items-center mb-8'>
        <ThemedText type='title' className='text-gray-900 text-center mb-2'>
          {currentTitle}
        </ThemedText>
        <ThemedText className='text-gray-600 text-center text-base'>{currentSubtitle}</ThemedText>

        {error ? (
          <ThemedText className='text-red-500 text-center mt-4 text-sm'>{error}</ThemedText>
        ) : null}
      </View>

      {renderPinDots()}

      <View className='items-center'>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} className='flex-row justify-center mb-4'>
            {row.map((item) => {
              if (item === "") {
                return <View key='empty' className='w-20 h-20 mx-3' />;
              }

              if (item === "delete") {
                return (
                  <TouchableOpacity
                    key='delete'
                    onPress={handleDelete}
                    className='w-20 h-20 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm mx-3'
                  >
                    <ThemedText className='text-lg font-semibold text-gray-600'>⌫</ThemedText>
                  </TouchableOpacity>
                );
              }

              return (
                <View key={item} className='mx-3'>
                  {renderNumberButton(item)}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View className='flex-row justify-center mt-8 space-x-4'>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} className='px-6 py-3 rounded-lg bg-gray-200'>
            <ThemedText className='text-gray-700 font-medium'>Cancel</ThemedText>
          </TouchableOpacity>
        )}

        {(pin.length > 0 || confirmPin.length > 0) && (
          <TouchableOpacity onPress={handleClear} className='px-6 py-3 rounded-lg bg-red-100'>
            <ThemedText className='text-red-600 font-medium'>Clear</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}
