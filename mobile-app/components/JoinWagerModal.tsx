import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import CustomButton from '@/components/CustomButton';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface JoinWagerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedWager: { id: string; team_name: string; base_bet_amount: number } | null;  // Accept the selected wager
  clerkId: string;
  onJoin: (wager: { teamName: string; amount: number }) => void;
}

const { height } = Dimensions.get('window');

const JoinWagerModal: React.FC<JoinWagerModalProps> = ({ visible, onClose, selectedWager, clerkId, onJoin }) => {
  const { user } = useUser();
  const [walletBalance, setWalletBalance] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));

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
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetchAPI(`/api/balance?clerkId=${user?.id}`, {
          method: 'GET',
        });
        if (response.balance !== undefined) {
          setWalletBalance(response.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    fetchBalance();
  }, [user?.id]);

  const handleJoinWager = async () => {
    if (!selectedWager || !teamName) {
      alert('Please select a wager and enter a team name.');
      return;
    }

    const wagerAmount = parseFloat(selectedWager.base_bet_amount);
    const walletBalance = parseFloat(walletBalance);
    
    if (wagerAmount > walletBalance) {
      alert('Insufficient balance to join this wager.');
      return;
    }

    try {
      // Deduct balance
      const balanceResponse = await fetchAPI('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id,
          type: 'subtract',
          amount: wagerAmount,
        }),
      });
      if (balanceResponse.balance) {
        setWalletBalance(balanceResponse.balance);

        // Store transaction
        await fetchAPI('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user?.id,
            type: 'wager',
            amount: wagerAmount,
          }),
        });
      }

      // Add participant to wager
      const participantResponse = await fetchAPI('/api/wager-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wagerId: selectedWager.id,
          clerkId: user?.id,
          teamName: teamName,
          betAmount: wagerAmount,
        }),
      });

      if (participantResponse.error) {
        alert(`Error adding participant: ${participantResponse.error}`);
        return;
      }

      console.log('Joined wager successfully:', participantResponse);
      onJoin({ teamName, amount: wagerAmount });
      handleClose();
    } catch (error) {
      console.error('Error joining wager:', error);
    }
  };

  const handleClose = () => {
    setTeamName('');
    onClose();
  };
  
  return (
    <Modal visible={visible} animationType="none" transparent>
      <BlurView intensity={90} className="flex-1 justify-center items-center bg-black/50">
        <Animated.View 
          className="w-5/6 max-w-md rounded-3xl overflow-hidden bg-gray-900"
          style={{
            transform: [
              { translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0]
              })}
            ]
          }}
        >
          <LinearGradient
            colors={['#4338ca', '#3b82f6', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-16 px-6 flex-row justify-between items-center"
          >
            <Text className="text-2xl font-bold text-white">Join Wager</Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View className="p-6">
            {selectedWager && (
              <View className="bg-gray-800/50 p-4 rounded-xl mb-4 border border-gray-700">
                <Text className="text-sm text-blue-400 mb-2 font-medium">WAGER DETAILS</Text>
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-300">Required Bet:</Text>
                  <Text className="text-green-400 font-bold">${selectedWager.base_bet_amount}</Text>
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm text-blue-400 mb-1 font-medium">YOUR TEAM NAME</Text>
              <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <TextInput
                  className="p-4 text-base text-white"
                  placeholder="Enter Your Team Name"
                  placeholderTextColor="#6b7280"
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>
            </View>
          
            <View className="bg-gray-800/50 p-4 rounded-xl mb-6 flex-row justify-between items-center">
              <Text className="text-white">Current Balance:</Text>
              <Text className="text-xl font-bold text-green-400">${walletBalance}</Text>
            </View>

            <TouchableOpacity
              onPress={handleJoinWager}
              disabled={!teamName}
              className="h-14 rounded-xl overflow-hidden mb-4"
            >
              <LinearGradient
                colors={teamName ? ['#3b82f6', '#2563eb'] : ['#64748b', '#475569']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full h-full justify-center items-center"
              >
                <Text className="text-white font-bold text-lg">JOIN WAGER</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full h-12 bg-gray-800 rounded-xl border border-gray-700 justify-center items-center" 
              onPress={handleClose} 
            >
              <Text className="text-gray-300 font-bold text-base">CANCEL</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default JoinWagerModal;
