import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated
} from "react-native";
import { fetchAPI } from "@/lib/fetch";
import { CreditCard } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

interface StoredCardModalProps {
  visible: boolean;
  onClose: () => void;
  clerkId: string;
}

const StoredCardModal: React.FC<StoredCardModalProps> = ({
  visible,
  onClose,
  clerkId,
}) => {
  const [storedCards, setStoredCards] = useState<any[]>([]);
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchStoredCards = async () => {
      try {
        const response = await fetchAPI(`/(api)/charge_cards?clerkId=${clerkId}`, {
          method: "GET",
        });

        if (response.cards && Array.isArray(response.cards)) {
          setStoredCards(response.cards);
        } else {
          setStoredCards([]);
        }
      } catch (error) {
        console.error("Error fetching stored cards:", error);
        Alert.alert("Error", "Failed to fetch stored cards.");
      }
    };

    if (visible) {
      fetchStoredCards();
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
      }).start(() => {
        setRevealedIndex(null);
      });
    }
  }, [clerkId, visible]);

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
          {/* Header */}
          <LinearGradient
            colors={["#4338ca", "#3b82f6", "#0ea5e9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-16 px-6 flex-row justify-between items-center"
          >
            <Text className="text-2xl font-bold text-white">Stored Cards</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Card List */}
        <ScrollView className="p-6 mb-4 max-h-[65vh]">
          {storedCards.length > 0 ? (
            storedCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setRevealedIndex(revealedIndex === index ? null : index)}
                activeOpacity={0.9}
                className="mb-4"
              >
                <LinearGradient
                  colors={["#1e3a8a", "#3b82f6", "#0ea5e9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-full rounded-2xl p-5 shadow-lg border border-blue-500"
                >
                  <View className="flex-row justify-between items-center mb-6">
                    <CreditCard size={24} color="white" />
                    <Text className="text-white text-xs">VISA</Text>
                  </View>

                  <Text className="text-white text-lg tracking-widest font-semibold mb-4">
                    {revealedIndex === index
                      ? card.card_number
                      : `**** **** **** ${card.card_number.slice(-4)}`}
                  </Text>

                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-blue-200 text-xs">Card Holder</Text>
                      <Text className="text-white font-medium">
                        {card.holder_name || "John Doe"}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-blue-200 text-xs">Expires</Text>
                      <Text className="text-white font-medium">
                        {card.expiry_month}/{card.expiry_year}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-center text-gray-400">No cards stored.</Text>
          )}
        </ScrollView>
          {/* Footer Button */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              className="w-full h-12 bg-gray-800 rounded-xl border border-gray-700 justify-center items-center"
              onPress={onClose}
            >
              <Text className="text-gray-300 font-bold text-base">CLOSE</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default StoredCardModal;
