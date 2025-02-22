// StoredCards.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Alert, Modal, Button, SafeAreaView } from "react-native";
import { fetchAPI } from "@/lib/fetch"; // Assuming this fetch function is already set up

interface StoredCardModalProps {
  visible: boolean;
  onClose: () => void;
  clerkId: string; // The clerkId to fetch the cards
}

const StoredCardModal: React.FC<StoredCardModalProps> = ({ visible, onClose, clerkId }) => {
  const [storedCards, setStoredCards] = useState<any[]>([]); // State to store the list of cards

  useEffect(() => {
    const fetchStoredCards = async () => {
      try {
        const response = await fetchAPI(`/(api)/charge_cards?clerkId=${clerkId}`, {
          method: "GET",
        });

        if (response.cards && Array.isArray(response.cards)) {
          setStoredCards(response.cards);
        } else {
          Alert.alert("No Cards", "No cards stored.");
        }
      } catch (error) {
        console.error("Error fetching stored cards:", error);
        Alert.alert("Error", "Failed to fetch stored cards.");
      }
    };

    fetchStoredCards();
  }, [clerkId]); // Fetch cards when clerkId changes

  const renderStoredCards = () => {
    return storedCards.map((card, index) => {
      // Check if card and card properties exist before trying to access them
      if (card && card.card_number && card.expiry_month && card.expiry_year) {
        return (
          <View key={index} className="p-4 border-b border-gray-200">
            <Text>Card Number: {card.card_number}</Text>
            <Text>Expiry: {card.expiry_month}/{card.expiry_year}</Text>
          </View>
        );
      } else {
        return (
          <View key={index} className="p-4 border-b border-gray-200">
            <Text>Invalid card data</Text>
          </View>
        );
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ScrollView className="w-full">
          {storedCards.length > 0 ? renderStoredCards() : <Text>No cards stored.</Text>}
        </ScrollView>
        <Button title="Close" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
};

export default StoredCardModal;
