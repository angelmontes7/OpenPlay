import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

interface CloseWagerModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedWager: { id: string; } | null;  // Accept the selected wager
  onWager: () => void;
}

const CloseWagerModal: React.FC<CloseWagerModalProps> = ({ isVisible, onClose, selectedWager, onWager }) => {
  const [loading, setLoading] = useState(false);

  const wagerId = selectedWager?.id;

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
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white p-6 rounded-lg items-center">
          <Text className="text-lg font-bold mb-2">Close Wager</Text>
          <Text className="text-center text-gray-700 mb-4">Are you sure you want to close this wager?</Text>

          <View className="flex-row w-full justify-between">
            <TouchableOpacity className="flex-1 bg-gray-400 py-2 rounded-lg mr-2" onPress={onClose} disabled={loading}>
              <Text className="text-white text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-red-600 py-2 rounded-lg" onPress={handleCloseSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Submit</Text>}
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-red-600 py-2 rounded-lg" onPress={handleDisputeSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-semibold">Dispute</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CloseWagerModal;
