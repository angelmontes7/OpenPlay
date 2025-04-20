import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import ChatModal from '@/components/ChatModal';
import { getUserLocation, watchUserLocation } from "@/lib/location";
import { fetchFacilities } from "@/lib/fetchFacilities";

interface Facility {
  id: string;
  name: string;
  distance: number;
}

const Chat = () => {
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [courtData, setCourtData] = useState<Facility[]>([]);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getUserLocation();
      if (location) {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const subscription = watchUserLocation((location) => {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
    });

    return () => {
      subscription?.then((sub) => sub?.remove());
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilities = await fetchFacilities(latitude, longitude);
        const nearbyFacilities = facilities.filter((facility) => Number(facility.distance) <= 10);
        setCourtData(nearbyFacilities);
      } catch (error) {
        console.log("Error on fetching facilities: ", error);
      } finally {
        setLoading(false); // ✅ Set loading to false whether success or error
      }
    };

    if (latitude && longitude) {
      fetchData();
    }
  }, [latitude, longitude]);

  const handleOpenChat = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  const handleCloseChat = () => {
    setModalVisible(false);
    setSelectedFacility(null);
  };

  const renderFacility = ({ item }: { item: Facility }) => (
    <View className="bg-white rounded-2xl shadow p-4 mb-4 mx-4">
      <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleOpenChat(item)}
        className="mt-2 bg-blue-500 px-4 py-2 rounded-full"
      >
        <Text className="text-white text-center font-medium">Join Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-6">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-4">Facility Chat Rooms</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <FlatList
          data={courtData}
          keyExtractor={(item) => item.id}
          renderItem={renderFacility}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {selectedFacility && (
        <ChatModal
          visible={modalVisible}
          onClose={handleCloseChat}
          facilityId={selectedFacility.id}
          facilityName={selectedFacility.name}
        />
      )}
    </View>
  );
};

export default Chat;
