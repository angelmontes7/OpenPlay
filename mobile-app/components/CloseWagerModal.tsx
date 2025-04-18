import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { fetchAPI } from "@/lib/fetch"
interface CloseWagerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedWager: { id: number; participant_details: { team_name: string; winning_vote: string } }[] | null;
  userId: string;
  onConfirmed: () => void;
}

const { height } = Dimensions.get("window");

const CloseWagerModal: React.FC<CloseWagerModalProps> = ({ isVisible, onClose, selectedWager, onConfirmed, userId }) => {
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [currentVotes, setCurrentVotes] = useState<string[]>([]);
  const [animatedValue] = useState(new Animated.Value(0));
  const wagerId = selectedWager?.[0]?.id;
  
  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible]);

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

    try {
      const response = await fetchAPI("/api/wager-confirm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            wagerId: wagerId ,
            userId: userId,
            winning_vote: selectedTeam,
        }),
      });

      if (response?.error) throw new Error(response.error || "Failed to update wager status");

      Alert.alert("Success", "You have voted.");
      onConfirmed()
      onClose(); 
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleDisputeSubmit = async () => {
    
    try {
      const response = await fetchAPI("/api/wager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            wagerId: wagerId ,
            status: "disputed" 
        }),
      });
      
      if (response?.error) throw new Error(response.error || "Failed to update wager status");

      handleResetVotes();
      Alert.alert("Success", "Wager has been disputed. Each user must vote again in the disputes section.");
      onConfirmed()
      onClose(); 
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleResetVotes = async () => {
    try {
      const response = await fetchAPI("/api/wager-reset-votes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            wagerId: wagerId 
        }),
      });

      
      if (response?.error) throw new Error(response.error || "Failed to reset votes");
  
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Unknown error");
    }
  };
  
  return (
    <Modal visible={isVisible} transparent animationType="none">
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
            <Text className="text-2xl font-bold text-white">Confirm Winner</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View className="p-6">
            <Text className="text-center text-blue-300 text-base mb-6">
              Please select the winning team:
            </Text>

            {teamNames.length > 0 && (
              <View className="w-full bg-gray-800/50 p-4 rounded-xl mb-6 border border-gray-700">
                <Text className="text-sm text-blue-400 mb-3 font-medium">PARTICIPATING TEAMS</Text>
                {teamNames.map((team, index) => (
                  <TouchableOpacity 
                    key={index} 
                    className={`w-full p-3 my-1 rounded-lg border flex-row justify-between items-center ${
                      selectedTeam === team 
                        ? "bg-blue-900/70 border-blue-500" 
                        : "bg-gray-800 border-gray-700"
                    }`}
                    onPress={() => setSelectedTeam(team)}
                  >
                    <Text className={`font-medium ${selectedTeam === team ? "text-white" : "text-gray-300"}`}>
                      {team}
                    </Text>
                    {selectedTeam === team && (
                      <Ionicons name="checkmark-circle" size={20} color="#60a5fa" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Current Votes */}
            {currentVotes.length > 0 && (
              <View className="w-full bg-gray-800/50 p-4 rounded-xl mb-6 border border-gray-700">
                <Text className="text-sm text-blue-400 mb-3 font-medium">CURRENT VOTES</Text>
                {teamNames.map((team, i) => (
                  <View key={i} className="flex-row justify-between py-2 border-b border-gray-700 last:border-b-0">
                    <Text className="text-gray-300">{team}</Text>
                    <Text className={`
                      ${currentVotes[i] === "Not voted" ? "text-yellow-400" : "text-green-400"} font-medium
                    `}>
                      {currentVotes[i]}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Button layout */}
            <View className="w-full space-y-3">
              <View className="flex-row w-full justify-between space-x-3">
                <TouchableOpacity 
                  className="flex-1 h-12 rounded-xl overflow-hidden" 
                  onPress={handleCloseSubmit}
                  disabled={!selectedTeam}
                >
                  <LinearGradient
                    colors={selectedTeam ? ['#3b82f6', '#2563eb'] : ['#64748b', '#475569']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full justify-center items-center"
                  >
                    <Text className="text-white font-bold text-base">SUBMIT</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 h-12 rounded-xl overflow-hidden" 
                  onPress={handleDisputeSubmit}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full justify-center items-center"
                  >
                    <Text className="text-white font-bold text-base">DISPUTE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                className="w-full h-12 bg-gray-800 rounded-xl border border-gray-700 justify-center items-center" 
                onPress={onClose} 
              >
                <Text className="text-gray-300 font-bold text-base">CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default CloseWagerModal;
