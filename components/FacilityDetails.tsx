import React from 'react';
import { Modal, View, Text, TouchableOpacity, Linking, ScrollView, SafeAreaView } from 'react-native';

interface FacilityDetailsProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  address: string;
  sports: string;
  capacity: string;
  description: string;
  amenities: string;
  website: string;
  stars: number;
}

const FacilityDetails: React.FC<FacilityDetailsProps> = ({
  visible,
  onClose,
  name,
  address,
  sports,
  capacity,
  description,
  amenities,
  website,
  stars,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={false} // This ensures it takes up the entire screen
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Placeholder for image (empty space for now) */}
          <View className="w-full h-40 bg-gray-300 rounded-lg mb-4" />

          {/* Name */}
          <Text className="text-3xl font-bold text-center mb-2">{name}</Text>

          {/* Stars */}
          <Text className="text-yellow-500 text-center mb-2">
            {'★'.repeat(stars)}{' '}
            {'☆'.repeat(5 - stars)} {/* Display stars */}
          </Text>

          {/* Address */}
          <Text className="text-lg text-gray-700 mb-2">{address}</Text>

          {/* Sports */}
          <Text className="text-gray-600 mb-2">
            <Text className="font-semibold">Sports: </Text>{sports}
          </Text>

          {/* Capacity */}
          <Text className="text-gray-600 mb-2">
            <Text className="font-semibold">Capacity: </Text>{capacity}
          </Text>

          {/* Description */}
          <Text className="text-gray-600 mb-2">
            <Text className="font-semibold">Description: </Text>{description}
          </Text>

          {/* Amenities */}
          <Text className="text-gray-600 mb-2">
            <Text className="font-semibold">Amenities: </Text>{amenities}
          </Text>

          {/* Website link */}
          <TouchableOpacity
            onPress={() => Linking.openURL(website)}
            className="mb-4"
          >
            <Text className="text-blue-500 text-center">Visit Website</Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            className="bg-blue-500 py-2 px-4 rounded-lg"
            onPress={onClose}
          >
            <Text className="text-white text-center font-bold">Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default FacilityDetails;
