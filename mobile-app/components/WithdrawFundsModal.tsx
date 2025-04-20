import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import { useUser } from "@clerk/clerk-expo";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
interface WithDrawFundsModalProps {
  visible: boolean;
  onClose: () => void;
  onWithdrawSuccess: (amount: number) => void; 
  availableBalance?: number; // display max balance
}

const { height } = Dimensions.get('window');

const WithDrawFundsModal: React.FC<WithDrawFundsModalProps> = ({ visible, onClose, onWithdrawSuccess, availableBalance, }) => {
  const [inputAmount, setInputAmount] = useState('');
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
      }).start(() => setInputAmount(''));
    }
  }, [visible]);

  const handleConfirmWithdraw = async () => {
    const parsedAmount = parseFloat(inputAmount);

    if (!inputAmount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      return Alert.alert('Invalid amount', 'Please enter a valid withdrawal amount.');
    }

    if (availableBalance && parsedAmount > availableBalance) {
      return Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance.');
    }

    onWithdrawSuccess(parsedAmount);
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
          {/* Gradient Header */}
          <LinearGradient
            colors={['#4338ca', '#3b82f6', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-16 px-6 flex-row justify-between items-center"
          >
            <Text className="text-2xl font-bold text-white">Withdraw Funds</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Body */}
          <View className="p-6">
            <Text className="text-blue-300 text-base mb-4 text-center">
              Enter amount you wish to withdraw:
            </Text>

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
            
            {availableBalance !== undefined && (
              <Text className="text-center text-sm text-gray-400 mb-4">
                Available: ${availableBalance}
              </Text>
            )}

            {/* Buttons */}
            <View className="flex-row w-full justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 h-12 bg-gray-800 rounded-xl border border-gray-700 justify-center items-center"
                onPress={onClose}
              >
                <Text className="text-gray-300 font-bold text-base">CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl overflow-hidden"
                onPress={handleConfirmWithdraw}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full h-full justify-center items-center"
                >
                  <Text className="text-white font-bold text-base">WITHDRAW</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default WithDrawFundsModal;
