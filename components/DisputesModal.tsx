import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

interface DisputesModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedWager: { id: number; participant_details: { team_name: string; winning_vote: string } }[] | null;
  userId: string;
  onConfirmed: () => void;
}

const DisputesModal: React.FC<DisputesModalProps> = ({ isVisible, onClose, selectedWager, onConfirmed, userId }) => {
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [currentVotes, setCurrentVotes] = useState<string[]>([]);

  const wagerId = selectedWager?.[0]?.id;
  
  useEffect(() => {
    if (selectedWager) {
      if (Array.isArray(selectedWager)) {
        // If selectedWager is an array, extract team_name from each object
        const names = selectedWager.map((wager) => wager.participant_details.team_name);
        // Current votes (or "Not voted")
        const votes = selectedWager.map((wager) => wager.participant_details.winning_vote ?? "Not voted");

        setCurrentVotes(votes);
        setTeamNames(names);
      } else if (selectedWager.participant_details) {
        // If it's a single object, wrap its team_name in an array
        setCurrentVotes([selectedWager.participant_details.winning_vote ?? "Not voted"]);
        setTeamNames([selectedWager.participant_details.team_name]);
      } else {
        setCurrentVotes(["Not voted"]);
        setTeamNames([]);
      }
    }
  }, [selectedWager]);
  

  const handleCloseSubmit = async () => {
    if (!selectedTeam) {
      Alert.alert("Error", "Please select a team");
      return;
    }
    console.log("Request Body:", {
      wagerId: wagerId,
      userId: userId,
      winning_vote: selectedTeam,
    });
    try {
      const response = await fetch("/(api)/wager_confirm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            wagerId: wagerId ,
            userId: userId,
            winning_vote: selectedTeam,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update wager status");

      Alert.alert("Success", "You have voted.");
      onConfirmed()
      onClose(); 
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/70">
        <View className="w-4/5 bg-white p-6 rounded-2xl items-center shadow-lg">
        <Text className="text-lg font-bold">Confirm Winner</Text>
        <Text className="text-xs mb-3 text-gray-700">*If winner cannot be agreed upon wagered money will be returned with a 10% deduction* </Text>
          <Text className="text-center text-gray-700 mb-4">
            Please select the winning team:
          </Text>

          {teamNames.length > 0 && (
            <View className="w-full bg-gray-50 p-4 rounded-xl mb-6">
              <Text className="font-semibold text-gray-800 mb-3">Participating Teams:</Text>
              {teamNames.map((team, index) => (
                <TouchableOpacity 
                  key={index} 
                  className={`w-full p-2 rounded-lg my-1 ${selectedTeam === team ? "bg-blue-300" : "bg-gray-300"}`}
                  onPress={() => setSelectedTeam(team)}
                >
                  <Text className="text-gray-700 font-medium">{team}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Current Votes */}
          {currentVotes.length > 0 && (
            <View className="w-full bg-gray-50 p-4 rounded-xl mb-6">
              <Text className="font-semibold text-gray-800 mb-2">Current Votes:</Text>
              {currentVotes.map((vote, i) => (
                <Text key={i} className="text-gray-700">
                  {vote}
                </Text>
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

export default DisputesModal;
