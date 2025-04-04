import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CloseWagerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedWager: { id: number; participant_details: { team_name: string } }[] | null;
  onWager: () => void;
}

const CloseWagerModal: React.FC<CloseWagerModalProps> = ({ isVisible, onClose, selectedWager, onWager }) => {
  const [loading, setLoading] = useState(false);
  const [teamNames, setTeamNames] = useState<string[]>([]);

  const wagerId = selectedWager?.[0]?.id;

  useEffect(() => {
    if (selectedWager) {
      const names = selectedWager.map((wager) => wager.participant_details.team_name);
      setTeamNames(names);
    } else {
      setTeamNames([]);
    }
  }, [selectedWager]);

  const handleCloseSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/(api)/wager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            wagerId: wagerId ,
            status: "closed" 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update wager status");

      Alert.alert("Success", "Wager has been closed.");
      onWager()
      onClose(); 
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/(api)/wager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            wagerId: wagerId ,
            status: "disputed" 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update wager status");

      Alert.alert("Success", "Wager has been disputed.");
      onWager()
      onClose(); 
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/70">
        {/* Card container with subtle shadow */}
        <View className="w-4/5 bg-white p-6 rounded-2xl items-center shadow-lg">
          {/* Header with gradient underline */}
          <View className="w-full items-center mb-4">
            <Text className="text-xl font-bold mb-2 text-gray-800">Close Wager</Text>
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              className="h-1 w-14 rounded-full mb-4"
            />
            <Text className="text-center text-gray-600 mb-2">Are you sure you want to close this wager?</Text>
          </View>

          {/* Teams section with improved styling */}
          {teamNames.length > 0 && (
            <View className="w-full bg-gray-50 p-4 rounded-xl mb-6">
              <Text className="font-semibold text-gray-800 mb-3">Participants</Text>
              {teamNames.map((team, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => onTeamPress && onTeamPress(team, index)}
                  className="flex-row items-center py-2 border-b border-gray-200"
                >
                  <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                  <Text className="text-gray-700 font-medium">{team}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Button layout */}
          <View className="w-full space-y-2">
            <View className="flex-row w-full justify-between space-x-2">
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl bg-gray-200" 
                onPress={handleCloseSubmit} 
              >
                <Text className="text-black text-center font-semibold">Submit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl bg-gray-200" 
                onPress={handleDisputeSubmit} 
              >
                <Text className="text-black text-center font-semibold">Dispute</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="w-full py-3 rounded-xl bg-gray-200" 
              onPress={onClose} 
            >
              <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CloseWagerModal;
