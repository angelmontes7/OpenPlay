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
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from "@expo/vector-icons";



interface CreateWagerModalProps {
  visible: boolean;
  onClose: () => void;
  courts: { id: string; name: string; distance: number }[];
  clerkId: string;
  onCreate: (wager: { teamName: string; amount: string; court: { id: string; name: string; distance: number } }) => void;
}

const { height } = Dimensions.get('window');

const CreateWagerModal: React.FC<CreateWagerModalProps> = ({ visible, onClose, courts, clerkId, onCreate }) => {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<{ id: string; name: string; distance: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
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
                method: "GET",
            });

            if (response.balance !== undefined) {
                setWalletBalance(response.balance);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    fetchBalance();
  },[user?.id]);

  const handleCreateWager = async () => {
    if (!teamName || !amount || !selectedCourt) {
      alert('Please fill out all fields.');
      return;
    }

    const wagerAmount = parseFloat(amount);
    if (wagerAmount <= 0 || wagerAmount > walletBalance) {
      alert('Invalid wager amount or insufficient balance.');
      return;
    }

    const wagerData = {
      clerkId,
      wagerAmount,
      court_id: selectedCourt.id,
    };

    
    try {    
        // Step 1: Deduct balance
        const balanceResponse = await fetchAPI("/api/balance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clerkId: user?.id,
                type: "subtract",
                amount: wagerAmount,
            }),
        });

        if (balanceResponse.balance) {
            setWalletBalance(balanceResponse.balance);

            // Store the transaction
            await fetchAPI("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    type: "wager",
                    amount: wagerAmount,
                }),
            });
        }

        // Step 2: Create wager
        const wagerResponse = await fetchAPI('/api/wager', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wagerData),
        });

        if (wagerResponse.error) {
          alert(`Error is right here: ${wagerResponse.error}`);
          return;
        }

        const wagerId = wagerResponse.id; // Assuming response includes the new wager's ID

        console.log("Wager Reponse: ", wagerResponse)
        // Step 3: Insert creator as first participant
        const participantResponse = await fetchAPI('/api/wager-participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wagerId: wagerId,
            clerkId: user?.id,
            teamName: teamName, // User's chosen team name
            betAmount: wagerAmount,
          }),
        });

        if (participantResponse.error) {
          alert(`Error adding participant: ${participantResponse.error}`);
          return;
        }

        console.log('Created wager and added participant:', wagerResponse);
        onCreate({
          teamName,
          amount,
          court: selectedCourt,
        });

        handleClose();
    } catch (error) {
        console.error("Error updating balance:", error);
    }
  };

  const handleClose = () => {
    setTeamName('');
    setAmount('');
    setSelectedCourt(null);
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
            <Text className="text-2xl font-bold text-white">Create Wager</Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View className="p-6">
            <View className="mb-4">
              <Text className="text-sm text-blue-400 mb-1 font-medium">TEAM NAME</Text>
              <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <TextInput
                  className="p-4 text-base text-white"
                  placeholder="Enter Team Name"
                  placeholderTextColor="#6b7280"
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-blue-400 mb-1 font-medium">WAGER AMOUNT</Text>
              <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <TextInput
                  className="p-4 text-base text-white"
                  placeholder={`Enter Amount (Max: $${walletBalance})`}
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-blue-400 mb-1 font-medium">SELECT COURT</Text>
              <View className="bg-gray-800 rounded-xl border border-gray-700 h-32">
                <FlatList
                  data={courts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`p-3 border-b border-gray-700 flex-row justify-between ${selectedCourt?.id === item.id ? 'bg-blue-900/50' : ''}`}
                      onPress={() => setSelectedCourt(item)}
                    >
                      <Text className="text-white font-medium">{item.name}</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="location" size={16} color="#60a5fa" className="mr-1" />
                        <Text className="text-blue-300">{item.distance} mi</Text>
                        {selectedCourt?.id === item.id && (
                          <Ionicons name="checkmark-circle" size={18} color="#60a5fa" className="ml-2" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            <View className="bg-gray-800/50 p-4 rounded-xl mb-6 flex-row justify-between items-center">
              <Text className="text-white">Current Balance:</Text>
              <Text className="text-xl font-bold text-green-400">${walletBalance}</Text>
            </View>

            <TouchableOpacity
              onPress={handleCreateWager}
              className="h-14 rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full h-full justify-center items-center"
              >
                <Text className="text-white font-bold text-lg">CREATE WAGER</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};



export default CreateWagerModal;

