import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { icons } from '@/constants';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import FacilityDetails from '@/components/FacilityDetails';
import * as Location from 'expo-location'
import { fetchFacilities } from "@/lib/fetchFacilities";
import { getUserLocation, watchUserLocation } from "@/lib/location";
import { LinearGradient } from 'expo-linear-gradient';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

const { height } = Dimensions.get('window');
const SEARCH_BAR_HEIGHT = 60;
const TAB_BAR_HEIGHT = 60; // adjust as needed
const SHEET_TOP = 80; // sheet container starts below the search bar

// The height available for the sheet container
const containerHeight = height - SHEET_TOP;

interface Court {
  id: string;
  name: string;
  address: string;
  available: boolean;
  sport: string;
  distance: number; // in miles BECAUSE THIS AMERICA RAHHHHHHHH
  popularity: number; // star rating (1-5)
  type: string; // "Free" or "Paid"
  capacity: number;
  coordinate: { latitude: number; longitude: number }; // added coordinate field
  description: string;
  amenities: string; 
  website: string; 
  stars: number; 
}

export default function Home() {
  const { user } = useUser();
  const [courtData, setCourtData] = useState<Court[]>([]);

  const [isFacilityDetailsVisible, setIsFacilityDetailsVisible] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<{ name: string; details: string } | null>(null);
  // Consts for DOB check
  const [dob, setDob] = useState<string | null>(null);
  const [showDOBModal, setShowDOBModal] = useState(false);
  const [data, setData] = useState<{ dob: string } | null>(null);
  
  // Location
  const [errorMsg, setErrorMsg] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [region, setRegion] = useState({
    latitude: 41.7725,
    longitude: -88.1535,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Filter states
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [selectedProximity, setSelectedProximity] = useState<string | null>(null);
  const [selectedPopularity, setSelectedPopularity] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  // Track FlatList content height.
  const [contentHeight, setContentHeight] = useState(0);
  // Compute the available visible area for content (container height minus tab bar)
  const visibleArea = containerHeight - TAB_BAR_HEIGHT;
  const maxSheetPos = Math.max(0, visibleArea - contentHeight);

  // Animated value for the sheet’s vertical position.
  const sheetPosition = useRef(new Animated.Value(maxSheetPos)).current;
  const sheetPositionValue = useRef(maxSheetPos);
  sheetPosition.addListener(({ value }) => {
    sheetPositionValue.current = value;
  });
  const lastSheetPosition = useRef(sheetPositionValue.current);
  const listScrollOffset = useRef(0);

  // New state for check-in and head count
  const [currentCheckInCourt, setCurrentCheckInCourt] = useState<string | null>(null);
  const [liveHeadCount, setLiveHeadCount] = useState<number>(0);

  // Function to check in a user
  const handleCheckIn = async (courtId: string) => {
    try {
      const response = await fetchAPI("/(api)/check_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, courtId }),
      });
      if (response.error) {
        Alert.alert("Error", response.error);
      } else {
        setCurrentCheckInCourt(courtId);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to check in");
    }
  };

  // Function to check out a user
  const handleCheckOut = async (courtId: string) => {
    try {
      const response = await fetchAPI("/(api)/check_out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, courtId }),
      });
      if (response.error) {
        Alert.alert("Error", response.error);
      } else {
        setCurrentCheckInCourt(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to check out");
    }
  };

  // Poll the head count every 5 seconds for the selected court
  useEffect(() => {
    let interval: NodeJS.Timeout;
  
    if (selectedCourt) {
      const fetchHeadCount = async () => {
        try {
          if (!selectedCourt.id) {
            console.error("Selected court does not have an ID:", selectedCourt);
            return;
          }
  
          const response = await fetchAPI(`/(api)/head_count?courtId=${selectedCourt.id}`);
          console.log("Raw response:", response);
          setLiveHeadCount(response.count);
        } catch (error) {
          console.error("Error fetching head count:", error);
        }
      };
  
      fetchHeadCount();
      interval = setInterval(fetchHeadCount, 10000);
    }
  
    return () => interval && clearInterval(interval);
  }, [selectedCourt]);

  // Check if user has DOB set.
  useEffect(() => {
    const checkUserDOB = async () => {
        if (!user?.id) return;
        try {
            const response = await fetchAPI(`/(api)/user?clerkId=${user.id}`);
            console.log(response);  // Log the response data for debugging
            setData(response);
            console.log('Fetched user data:', response);
      
            if (response?.dob === null) {
              setShowDOBModal(true);  // Show the modal if DOB is null
            }
        } catch (error) {
          console.error("Error fetching DOB:", error);
        }
    };
    checkUserDOB();
  }, [user?.id]);

  useEffect(() => {
    if (sheetPositionValue.current > maxSheetPos) {
      Animated.timing(sheetPosition, {
        toValue: maxSheetPos,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        lastSheetPosition.current = maxSheetPos;
      });
    }
  }, [contentHeight, maxSheetPos, sheetPosition]);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getUserLocation();
      if (location) {
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const subscription = watchUserLocation((location) => {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    });

    return () => {
      subscription?.then((sub) => sub?.remove());
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilities = await fetchFacilities(latitude, longitude);
        setCourtData(facilities);
      } catch (error) {
        setErrorMsg("Failed to load facilities");
      }
    };
  
    if (latitude && longitude) {
      fetchData();
    }
  }, [latitude, longitude]);
  
  const handleViewDetails = (court: Court) => {
    setSelectedCourt(court);
    setIsFacilityDetailsVisible(true);
  };

  const closeModal = () => {
    setIsFacilityDetailsVisible(false);
    setSelectedCourt(null);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
        if (!scrollEnabled) return true;
        if (scrollEnabled && gestureState.dy > 0 && listScrollOffset.current <= 0)
          return true;
        return false;
      },
      onPanResponderGrant: () => {
        lastSheetPosition.current = sheetPositionValue.current;
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        let newPos = lastSheetPosition.current + gestureState.dy;
        newPos = Math.min(Math.max(newPos, 0), 335);
        sheetPosition.setValue(newPos);
      },
      onPanResponderRelease: () => {
        if (sheetPositionValue.current < 20) {
          setScrollEnabled(true);
        } else {
          setScrollEnabled(false);
        }
        sheetPosition.flattenOffset();
      },
    })
  ).current;

  // Filter option arrays.
  const sportOptions = ["Soccer", "Basketball", "Football", "Baseball", "Tennis", "Pickle-ball", "Lacrosse"];
  const availabilityOptions = ["Open", "Currently in Use"];
  const proximityOptions = ["< 5 Miles", "5-15 Miles", "> 15 Miles"];
  const popularityOptions = [1, 2, 3, 4, 5];
  const typeOptions = ["Free", "Paid"];
  const sizeOptions = ["< 10 People", "10-50 People", "> 50 People"];

  // Compute filtered courts.
  const filteredCourts = courtData.filter(court => {
    let matches = true;
    if (selectedSport) {
      matches = matches && court.sport === selectedSport;
    }
    if (selectedAvailability) {
      if (selectedAvailability === "Open") {
        matches = matches && court.available === true;
      } else if (selectedAvailability === "Currently in Use") {
        matches = matches && court.available === false;
      }
    }
    if (selectedProximity) {
      if (selectedProximity === "< 5 Miles") {
        matches = matches && court.distance < 5;
      } else if (selectedProximity === "5-15 Miles") {
        matches = matches && (court.distance >= 5 && court.distance <= 15);
      } else if (selectedProximity === "> 15 Miles") {
        matches = matches && court.distance > 15;
      }
    }
    if (selectedPopularity) {
      matches = matches && court.popularity === selectedPopularity;
    }
    if (selectedType) {
      matches = matches && court.type === selectedType;
    }
    if (selectedSize) {
      if (selectedSize === "< 10 People") {
        matches = matches && court.capacity < 10;
      } else if (selectedSize === "10-50 People") {
        matches = matches && (court.capacity >= 10 && court.capacity <= 50);
      } else if (selectedSize === "> 50 People") {
        matches = matches && court.capacity > 50;
      }
    }
    return matches;
  });

  const renderCourtItem = ({ item }: { item: Court }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item.name}</Text>
      <Text style={styles.listItemSubText}>
        {item.address} | {item.sport} | {item.distance} Miles | {item.popularity} Star{item.popularity > 1 ? 's' : ''} | {item.type} | Capacity: {item.capacity}
      </Text>
      <TouchableOpacity
        disabled={!item.available}
        onPress={() => handleViewDetails(item)} // Pass the entire court object
      >
        <LinearGradient
          colors={['#4338ca', '#3b82f6', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bookButton, { opacity: item.available ? 1 : 0.5 }]} // Adjust opacity if unavailable
        >
          <Text style={styles.bookButtonText}>
            {item.available ? 'View Details' : 'Unavailable'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const handleSaveDOB = async () => {
    if (!dob) {
      Alert.alert("Error", "Please enter your Date of Birth.");
      return;
    }

    if(!validateDOB(dob)) {
      return;
    }

    try {
      const response = await fetchAPI("/(api)/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user?.id,
          dob: dob,
        }),
      }); 
      setData(response)
      setShowDOBModal(false);
      setDob(dob); // Update state with the saved DOB
      Alert.alert("Success", "Your DOB has been updated.");
      
    } catch (error) {
      console.error("Error updating DOB:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }

  };
  const formatDOB = (value: string) => {
    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    // Format the value as MM-DD-YYYY
    if (value.length > 2 && value.length <= 4) {
        value = value.slice(0, 2) + '-' + value.slice(2);
    } else if (value.length > 4) {
        value = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
    }

    return value;
  };

  const validateDOB = (dob: string) => {
    // Ensure the input is not empty
    if (!dob) {
        Alert.alert("Invalid Date", "Date of birth is required.");
        return false;
    }

    // Split the date string into components
    const [month, day, year] = dob.split('-').map(Number);

    // Check if the date components are valid numbers
    if (!month || !day || !year) {
        Alert.alert("Invalid Date", "The entered date is not valid.");
        return false;
    }

    // Create a date object from the components
    const date = new Date(year, month - 1, day);

    const today = new Date();

    if (year < 1900 || date > today) {
        Alert.alert("Invalid Date", "The entered date must be between 1900 and the current year.");
        return false;
    }

    return true;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Modal for entering DOB */}
      <Modal
        visible={showDOBModal}
        onRequestClose={() => setShowDOBModal(false)}
      >
        <View className='flex-1 justify-center items-center bg-black bg-opacity-50'>
          <View className='bg-white rounded-lg p-6 w-4/5 max-w-lg'>
            <Text className='text-xl font-semibold text-center mb-4'>Please enter your date of birth:</Text>

            <InputField 
              label="Date of Birth"
              placeholder="MM-DD-YYYY"
              placeholderTextColor="#A0A0A0"
              icon={icons.calendar} 
              value={dob}
              onChangeText={(value) => {
                const formattedValue = formatDOB(value);  // Format the input value
                setDob(formattedValue);  // Update the state with the formatted value
              }}
              keyboardType="number-pad"
            />

            <CustomButton 
              title="Save DOB" 
              onPress={handleSaveDOB} 
            />
          </View>
        </View>
      </Modal>


      {/* Fixed Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for courts..."
          placeholderTextColor="white"
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: 'white' }]}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersHeader}>Filters</Text>
          {/* Sport */}
          <View style={styles.filterOption}>
            <Text style={styles.filterLabel}>Sport</Text>
            <View style={styles.filterOptionsRow}>
              {sportOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedSport(selectedSport === option ? null : option)}
                  style={[
                    styles.filterOptionButton,
                    selectedSport === option && styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text style={selectedSport === option ? styles.filterOptionTextSelected : styles.filterOptionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Availability */}
          <View style={styles.filterOption}>
            <Text style={styles.filterLabel}>Availability</Text>
            <View style={styles.filterOptionsRow}>
              {availabilityOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedAvailability(selectedAvailability === option ? null : option)}
                  style={[
                    styles.filterOptionButton,
                    selectedAvailability === option && styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text style={selectedAvailability === option ? styles.filterOptionTextSelected : styles.filterOptionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Proximity */}
          <View style={styles.filterOption}>
            <Text style={styles.filterLabel}>Proximity</Text>
            <View style={styles.filterOptionsRow}>
              {proximityOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedProximity(selectedProximity === option ? null : option)}
                  style={[
                    styles.filterOptionButton,
                    selectedProximity === option && styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text style={selectedProximity === option ? styles.filterOptionTextSelected : styles.filterOptionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Popularity */}
          <View style={styles.filterOption}>
            <Text style={styles.filterLabel}>Popularity</Text>
            <View style={styles.filterOptionsRow}>
              {popularityOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedPopularity(selectedPopularity === option ? null : option)}
                  style={[
                    styles.filterOptionButton,
                    selectedPopularity === option && styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text style={selectedPopularity === option ? styles.filterOptionTextSelected : styles.filterOptionText}>
                    {option} Star{option > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Type */}
          <View style={styles.filterOption}>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.filterOptionsRow}>
              {typeOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedType(selectedType === option ? null : option)}
                  style={[
                    styles.filterOptionButton,
                    selectedType === option && styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text style={selectedType === option ? styles.filterOptionTextSelected : styles.filterOptionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Size */}
          <View style={styles.filterOption}>
            <Text style={styles.filterLabel}>Size</Text>
            <View style={styles.filterOptionsRow}>
              {sizeOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedSize(selectedSize === option ? null : option)}
                  style={[
                    styles.filterOptionButton,
                    selectedSize === option && styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text style={selectedSize === option ? styles.filterOptionTextSelected : styles.filterOptionText}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Interactive Map Section */}
      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' && MapView ? (
            <MapView
            style={styles.map}
            region={region}
            >
            {latitude && longitude && (
                <Marker
                coordinate={{ latitude, longitude }}
                title="Your Location"
                pinColor="blue"
                />
            )}
            {filteredCourts.map(court => (
                <Marker
                key={court.id}
                coordinate={court.coordinate}
                title={court.name}
                description={`${court.sport} - ${court.location}`}
                />
            ))}
            </MapView>
        ) : (
            <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text>Map is not available on web.</Text>
            </View>
        )}
        </View>

      
      {/* Facility Details Modal with Check-In/Out functionality */}
      {selectedCourt && (
        <FacilityDetails
          visible={isFacilityDetailsVisible}
          onClose={closeModal}
          name={selectedCourt.name}
          address={selectedCourt.address}
          sports={selectedCourt.sport}
          capacity={selectedCourt.capacity.toString()}
          description={selectedCourt.description}
          amenities={selectedCourt.amenities}
          website={selectedCourt.website}
          stars={selectedCourt.stars}
          // Pass whether this court is the one the user is checked into
          isCheckedIn={currentCheckInCourt === selectedCourt.id}
          // Provide the check in/out handlers
          onCheckIn={() => handleCheckIn(selectedCourt.id)}
          onCheckOut={() => handleCheckOut(selectedCourt.id)}
          // Live head count for the selected court
          headCount={liveHeadCount}
        />
      )}

      {/* Draggable List Sheet */}
      {filteredCourts.length > 0 ? (
        <Animated.View
        style={[styles.sheetContainer, { transform: [{ translateY: sheetPosition }] }]}
      >
        {/* Drag Indicator with panResponder handlers */}
        <LinearGradient
          colors={['#4338ca', '#3b82f6', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dragIndicator}
          {...panResponder.panHandlers} // Pass pan handlers to the LinearGradient
        />
        
        {/* The FlatList for your items */}
        <FlatList
          data={filteredCourts}
          keyExtractor={(item) => item.id}
          bounces={false}
          scrollEnabled={true}  // Let the list scroll independently
          onScroll={(e) => { listScrollOffset.current = e.nativeEvent.contentOffset.y; }}
          onContentSizeChange={(_, h) => setContentHeight(h)}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          renderItem={renderCourtItem}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
      
      ) : (
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY: sheetPosition }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <Text style={{ padding: 20 }}>No courts found.</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  searchContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  filterButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  filtersContainer: {
    position: 'absolute',
    top: SHEET_TOP,
    left: 15,
    right: 15,
    backgroundColor: '#111827',
    borderRadius: 5,
    padding: 10,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  filtersHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  filterOption: { marginBottom: 10 },
  filterLabel: { color: 'white', fontWeight: 'bold', marginBottom: 5 },
  filterOptionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  filterOptionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    marginRight: 5,
    marginBottom: 5,
  },
  filterOptionButtonSelected: { backgroundColor: '#007bff' },
  filterOptionText: { color: 'white' },
  filterOptionTextSelected: { color: 'white' },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    zIndex: 0,
  },
  map: { flex: 1 },
  sheetContainer: {
    backgroundColor:"#111827",
    position: 'absolute',
    top: SHEET_TOP,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  dragIndicator: {
    width: 80,
    height: 1,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 20,
    paddingVertical: 10,
  },
  listContent: {
    backgroundColor: '#111827',
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  listItem: {
    padding: 15,
    backgroundColor: '#rgba(31, 41, 55, 0.9)',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  listItemText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  listItemSubText: { color: 'white', marginTop: 5 },
  bookButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: { color: 'white' },
});
