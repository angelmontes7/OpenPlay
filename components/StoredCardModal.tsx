import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { fetchAPI } from "@/lib/fetch";
import { CreditCard } from "lucide-react-native";
import CustomButton from "@/components/CustomButton";

interface StoredCardModalProps {
  visible: boolean;
  onClose: () => void;
  clerkId: string;
}

const StoredCardModal: React.FC<StoredCardModalProps> = ({ visible, onClose, clerkId }) => {
  const [storedCards, setStoredCards] = useState<any[]>([]);
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);

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

    if (visible) fetchStoredCards();
  }, [clerkId, visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-gray-100 p-4">
        <Text className="text-lg font-semibold text-center mb-4">Stored Cards</Text>
        <ScrollView className="w-full">
          {storedCards.length > 0 ? (
            storedCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white p-4 rounded-lg shadow-md mb-3 flex-row items-center"
                onPress={() => setRevealedIndex(revealedIndex === index ? null : index)}
              >
                <CreditCard size={24} className="text-blue-500 mr-3" />
                <View>
                  <Text className="text-sm font-medium">
                    {revealedIndex === index ? card.card_number : `**** **** **** ${card.card_number.slice(-4)}`}
                  </Text>
                  <Text className="text-xs text-gray-500">Exp: {card.expiry_month}/{card.expiry_year}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-center text-gray-500">No cards stored.</Text>
          )}
        </ScrollView>
        <CustomButton onPress={onClose} title="Close" bgVariant="danger" textVariant="default" className="mt-4" />
      </SafeAreaView>
    </Modal>
  );
};

export default StoredCardModal;
