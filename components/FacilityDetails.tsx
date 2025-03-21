import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

interface FacilityDetailsProps {
  visible: boolean;
  onClose: () => void;
  courtName: string;
  courtDetails: string;
}

const FacilityDetails: React.FC<FacilityDetailsProps> = ({ visible, onClose, courtName, courtDetails }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-lg p-6 w-4/5 max-w-lg">
          <Text className="text-xl font-semibold text-center mb-4">{courtName}</Text>
          <Text className="text-gray-600 text-center mb-6">{courtDetails}</Text>

          <TouchableOpacity
            className="bg-blue-500 py-2 px-4 rounded-lg"
            onPress={onClose}
          >
            <Text className="text-white text-center font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FacilityDetails;