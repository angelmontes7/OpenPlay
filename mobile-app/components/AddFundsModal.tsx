import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import Payment from './Payment';
import { useUser } from "@clerk/clerk-expo";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchAPI } from "@/lib/fetch";

interface AddFundsModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const AddFundsModal: React.FC<AddFundsModalProps> = ({ visible, onClose }) => {
  const [inputAmount, setInputAmount] = useState('');
  const paymentRef = useRef<any>(null);
  const { user } = useUser();

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setInputAmount(''); // Clear the input amount when the modal is closed
    }
  }, [visible]);

  const onPaymentSuccess = async (amount: string) => {
    try {
        const amountToAdd = parseFloat(amount);

        // Calculate Stripe fee (2.9% + $0.30)
        const stripeFee = (amountToAdd * 0.029) + 0.30;
        const finalAmount = amountToAdd - stripeFee; // Amount after deducting the fee

        // Ensure the final amount is not negative
        if (finalAmount <= 0) {
          Alert.alert('Payment Error', 'Amount after fees is too low.');
          return;
        }

        const response = await fetchAPI("/api/database/balance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clerkId: user?.id,
                type: "add",
                amount: finalAmount,
            }),
        });

        if (response.balance) {
          // Store the transaction
          await fetchAPI("/api/database/transactions", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  clerkId: user?.id,
                  type: "add",
                  amount: finalAmount,
              }),
          });
          onClose();
          Alert.alert("Success", "Added funds processed successfully.");
        }
    } catch (error) {
        console.error("Error updating balance:", error);
    }
};
  
  const handleConfirmPayment = async () => {
    if (inputAmount.trim() === '' || isNaN(Number(inputAmount))) {
      alert('Please enter a valid amount');
      return;
    }

    if (paymentRef.current?.openPaymentSheet) {
      try {
        await paymentRef.current.openPaymentSheet();
      } catch (error) {
        Alert.alert('Payment Failed', 'An error occurred while processing your payment.');
      }
    } else {
      console.error('Payment reference not available');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <BlurView intensity={90} className="flex-1 justify-center items-center bg-black/50">
        <Animated.View
          className="w-5/6 max-w-md rounded-3xl overflow-hidden bg-gray-900"
          style={{
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80} // Adjust if needed
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Gradient Header */}
              <LinearGradient
                colors={['#4338ca', '#3b82f6', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-16 px-6 flex-row justify-between items-center"
              >
                <Text className="text-2xl font-bold text-white">Add Funds</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </LinearGradient>

              {/* Modal Content */}
              <View className="p-6">
                {/* Stripe Onboarding Notice */}
                <View className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                  <Text className="text-blue-200 text-xs text-center">
                    *Complete Stripe setup to add funds (2.9% + $0.30 fee applies). You'll be redirected if needed after confirming. Withdrawals available 7 days after funding.*
                  </Text>
                </View>

                {/* Input Field */}
                <View className="mb-6 relative">
                  <View className="absolute top-0 left-0 w-full h-full bg-blue-500/10 rounded-xl blur-md" />
                  <TextInput
                    className="bg-slate-800/80 text-white text-lg p-4 rounded-xl border border-slate-600 h-14"
                    style={{
                      textAlignVertical: 'center',
                      lineHeight: 22,
                    }}
                    keyboardType="numeric"
                    value={inputAmount}
                    onChangeText={setInputAmount}
                    placeholder="Enter amount"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text className="absolute right-4 top-4 text-blue-400 font-bold">USD</Text>
                </View>

                {/* Quick Amounts */}
                <View className="flex-row justify-between">
                  {[50, 100, 200, 500].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      className={`py-2 px-4 rounded-lg ${
                        inputAmount === amount.toString()
                          ? 'bg-blue-600'
                          : 'bg-slate-700'
                      }`}
                      onPress={() => setInputAmount(amount.toString())}
                    >
                      <Text className="text-white font-medium">${amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Payment */}
                <View className="mb-6">
                  <Payment
                    ref={paymentRef}
                    fullName={user?.fullName}
                    email={user?.emailAddresses[0]?.emailAddress}
                    amount={inputAmount}
                    onSuccess={() => onPaymentSuccess(inputAmount)}
                  />
                </View>

                {/* Buttons */}
                <View className="w-full space-y-3">
                  <View className="flex-row w-full justify-between space-x-3">
                  <TouchableOpacity
                      className="flex-1 h-12 rounded-xl overflow-hidden"
                      onPress={onClose}
                    >
                      <LinearGradient
                        colors={['#6b7280', '#374151']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="w-full h-full justify-center items-center"
                      >
                        <Text className="text-white font-bold text-base">CANCEL</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 h-12 rounded-xl overflow-hidden"
                      onPress={handleConfirmPayment}
                      disabled={!inputAmount}
                    >
                      <LinearGradient
                        colors={
                          inputAmount
                            ? ['#3b82f6', '#2563eb']
                            : ['#64748b', '#475569']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="w-full h-full justify-center items-center"
                      >
                        <Text className="text-white font-bold text-base">CONFIRM</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default AddFundsModal;
