import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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
        setLoading(false);
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
    <BlurView intensity={80} tint="light" className="overflow-hidden rounded-2xl mb-4 mx-4">
      <LinearGradient
        colors={['rgba(38,38,42,0.8)', 'rgba(25,25,28,0.95)']}
        className="border border-white/50 p-5 rounded-2xl"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{item.name}</Text>
            <Text className="text-sm text-blue-200">{item.distance.toFixed(1)} miles away</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleOpenChat(item)}
            className="flex-row items-center justify-center"
          >
            <LinearGradient
              colors={['#4f46e5', '#3b82f6']}
              className="px-4 py-2 rounded-full"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="flex-row items-center">
                <Text className="text-white font-medium mr-2">Join Chat</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </BlurView>
  );

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View className="flex-1 pt-12 pb-6">
        <View className="flex-row items-center justify-center mb-8">
          <View className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
          <Text className="text-2xl font-bold text-white">Nearby Facilities</Text>
          <View className="w-2 h-2 rounded-full bg-blue-400 ml-2" />
        </View>

        {latitude && longitude ? (
          <View className="flex-row justify-center mb-6">
            <View className="bg-white/10 px-4 py-1 rounded-full flex-row items-center">
              <Ionicons name="location" size={16} color="#60a5fa" />
              <Text className="text-blue-200 text-xs ml-1">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : courtData.length > 0 ? (
          <FlatList
            data={courtData}
            keyExtractor={(item) => item.id}
            renderItem={renderFacility}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <Ionicons name="alert-circle-outline" size={48} color="#60a5fa" />
            <Text className="text-white text-center mt-4">No facilities found within 10 miles of your location</Text>
          </View>
        )}
      </View>

      {selectedFacility && (
        <ChatModal
          visible={modalVisible}
          onClose={handleCloseChat}
          facilityId={selectedFacility.id}
          facilityName={selectedFacility.name}
        />
      )}
    </LinearGradient>
  );
};

export default Chat;