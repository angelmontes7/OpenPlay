import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, Dimensions, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { fetchAPI } from "@/lib/fetch";
import { useUser } from "@clerk/clerk-expo";

interface NoParticipantsModalProps {
    isVisible: boolean;
    onClose: () => void;
    selectedWager: { 
        id: number; 
        participant_details: { team_name: string; winning_vote: string }; 
        total_amount: number;
    }[] | null;
    userId: string;
    onConfirmed: () => void;
}

const { height } = Dimensions.get("window");

const NoParticipantsModal: React.FC<NoParticipantsModalProps> = ({
    isVisible,
    onClose,
    selectedWager,
    userId,
    onConfirmed
    }) => {
    const { user } = useUser();
    const [animatedValue] = useState(new Animated.Value(0));
  
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
            duration: 200,
            useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const handleClose = async () => {
        if (!selectedWager || selectedWager.length === 0) return;

        const wagerId = selectedWager[0].id; // Get the wager ID
        const selectedTeam = selectedWager[0].participant_details.team_name || ""; // Get the team name (if available)

        try {
            // Update the wager status in the database
            const response = await fetchAPI("/api/database/wager-confirm", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                wagerId,
                userId,
                winning_vote: selectedTeam,
            }),
            });

            if (response?.error) throw new Error(response.error || "Failed to update wager status");

            const wagerAmount = selectedWager[0].total_amount; 

            // Show an alert indicating the wager has been closed and funds refunded
            Alert.alert("Wager Closed", `Your wager of $${wagerAmount} has been refunded.`);

        } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
        }

        // Close the modal
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="none">
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
            <LinearGradient
                colors={["#1e3a8a", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-16 px-6 flex-row justify-between items-center"
            >
                <Text className="text-2xl font-bold text-white">No Participants</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <View className="p-6">
                <Text className="text-base text-gray-300 text-center mb-8">
                    No one has joined this wager yet. Would you like to close it?
                </Text>
                
                <View className="flex-row justify-between space-x-4">
                {/* No Button - Just closes modal */}
                <TouchableOpacity
                    className="flex-1 h-12 rounded-xl overflow-hidden"
                    onPress={onClose}
                >
                    <LinearGradient
                    colors={["#64748b", "#475569"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full justify-center items-center"
                    >
                    <Text className="text-white font-bold text-base">No</Text>
                    </LinearGradient>
                </TouchableOpacity>
                {/* Yes Button - Closes wager and refunds */}
                <TouchableOpacity
                    className="flex-1 h-12 rounded-xl overflow-hidden"
                    onPress={handleClose}
                >
                    <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full justify-center items-center"
                    >
                    <Text className="text-white font-bold text-base">Yes</Text>
                    </LinearGradient>
                </TouchableOpacity>
                </View>
            </View>
            </Animated.View>
        </BlurView>
        </Modal>
    );
};

export default NoParticipantsModal;