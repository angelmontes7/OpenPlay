import React, { useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Linking, 
  ScrollView, 
  SafeAreaView,
  Animated,
  Image,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
  facilities_pic_url: string;
  headCount: number;
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  image?: any; // Optional image source
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
  facilities_pic_url,
  headCount,
  isCheckedIn,
  onCheckIn,
  onCheckOut,
  image,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const screenHeight = Dimensions.get('window').height;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const InfoItem = ({ label, content }) => (
    <View className="mb-4 bg-gray-700/50 p-3 rounded-xl shadow-sm">
      <Text className="text-blue-400 text-sm mb-1">{label}</Text>
      <Text className="text-white text-base">{content}</Text>
    </View>
  );

  // Calculate star display
  const renderStars = () => {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View className="flex-row justify-center mb-4">
        {[...Array(fullStars)].map((_, i) => (
          <Ionicons key={`full-${i}`} name="star" size={20} color="#FACC15" />
        ))}
        {halfStar && <Ionicons name="star-half" size={20} color="#FACC15" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Ionicons key={`empty-${i}`} name="star-outline" size={20} color="#FACC15" />
        ))}
      </View>
    );
  };
  console.log("Facilities pic: ", facilities_pic_url)
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50">
        <SafeAreaView className="flex-1">
          <Animated.View 
            className="flex-1 bg-gray-900 rounded-t-3xl overflow-hidden"
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: screenHeight * 0.001, // .1% from top
            }}
          >
            {/* Header with close button */}
            <View className="px-4 pt-4 flex-row justify-between items-center">
              <TouchableOpacity 
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => Linking.openURL(website)}
                className="py-2 px-4 rounded-full bg-gray-100 flex-row items-center"
              >
                <Ionicons name="globe-outline" size={16} color="#3B82F6" />
                <Text className="text-blue-500 ml-1 font-medium">Website</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              className="flex-1 mt-2"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Image with gradient overlay */}
              <View className="w-full h-56 mb-4 overflow-hidden">
                <Image
                  source={{ uri: facilities_pic_url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={(e) => console.log("Image load error: ", e.nativeEvent.error)}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'transparent']}
                  className="absolute top-0 left-0 right-0 h-20"
                />
              </View>

              
              {/* Content */}
              <View className="px-6">
                {/* Name and stars */}
                <Text className="text-3xl font-bold text-white mb-1">{name}</Text>
                {renderStars()}
                
                {/* Address */}
                <View className="flex-row items-center mb-6">
                  <Ionicons name="location" size={18} color="#4B5563" />
                  <Text className="text-white ml-1 flex-1">{address}</Text>
                </View>
                
                {/* Head count with background */}
                <View className="bg-gray-700/50 p-4 rounded-2xl mb-6">
                  <Text className="text-center text-gray-600 mb-2">Current Capacity</Text>
                  <View className="flex-row justify-center items-center">
                    <Ionicons name="people" size={24} color="#4F46E5" />
                    <Text className="text-indigo-600 text-2xl font-bold ml-2">{headCount}</Text>
                    <Text className="text-gray-500 ml-1">/ {capacity}</Text>
                  </View>
                </View>
                
                {/* Check In/Out Button */}
                <TouchableOpacity
                  onPress={isCheckedIn ? onCheckOut : onCheckIn}
                  className={`py-4 px-6 rounded-xl mb-6 ${isCheckedIn ? 'bg-red-500' : 'bg-blue-500'}`}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    {isCheckedIn ? 'Check Out' : 'Check In'}
                  </Text>
                </TouchableOpacity>
                
                {/* Info sections */}
                <View className="mb-4">
                  <Text className="text-xl font-semibold text-white mb-3">Facility Info</Text>
                  <InfoItem label="Sports Available" content={sports} />
                  <InfoItem label="Description" content={description} />
                  <InfoItem label="Amenities" content={amenities} />
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FacilityDetails;