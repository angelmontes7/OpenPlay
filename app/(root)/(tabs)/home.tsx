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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { icons } from '@/constants';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import FacilityDetails from '@/components/FacilityDetails';
import * as Location from 'expo-location'

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
  distance: number; // in miles
  popularity: number; // star rating (1-5)
  type: string; // "Free" or "Paid"
  capacity: number;
  coordinate: { latitude: number; longitude: number }; // added coordinate field
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
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
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
    watchUserLocation();
  }, []);


  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('/(api)/sports_facilities'); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch facilities');
        }
        const data = await response.json();
  
        // Map the API response to the `Court` interface
        const mappedData: Court[] = data.map((facility: any) => {
          const courtLatitude = parseFloat(facility.coordinates.x); // Assuming `coordinates` is a POINT type
          const courtLongitude = parseFloat(facility.coordinates.y);
  
          return {
            id: facility.id.toString(),
            name: facility.name,
            address: facility.address,
            available: true, // Set this based on your logic
            sport: facility.sports,
            distance: calculateDistance(latitude, longitude, courtLatitude, courtLongitude), // Calculate distance
            popularity: 0, // Placeholder, as it's not in your database
            type: facility.free_vs_paid,
            capacity: parseInt(facility.capacity, 10),
            coordinate: {
              latitude: courtLatitude,
              longitude: courtLongitude,
            },
          };
        });
  
        setCourtData(mappedData);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setErrorMsg('Failed to load facilities');
      }
    };
  
    if (latitude && longitude) {
      fetchFacilities();
    }
  }, [latitude, longitude]); // Re-fetch facilities when the user's location changes


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
  
    return parseFloat((distance * 0.621371).toFixed(1)); // Convert to miles and round to 1 decimal place
  };
  

  const watchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status !== "granted") {
      setErrorMsg('Permission to location was not granted');
      return;
    }
  
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    );
  };

  const handleViewDetails = (courtName: string, courtDetails: string) => {
    setSelectedCourt({ name: courtName, details: courtDetails });
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
        newPos = Math.min(Math.max(newPos, 0), maxSheetPos);
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
        style={[styles.bookButton, { backgroundColor: item.available ? 'green' : 'gray' }]}
        disabled={!item.available}
        onPress={() => handleViewDetails(item.name, `Address: ${item.address}\nSport: ${item.sport}\nCapacity: ${item.capacity}`)} // Pass court details
      >
        <Text style={styles.bookButtonText}>
          {item.available ? 'View Details' : 'Unavailable'}
        </Text>
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
          placeholderTextColor="grey"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
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
        <MapView
          style={styles.map}
          region={region}
        >
          {/* User Location Marker */}
          {latitude && longitude && (
            <Marker
              coordinate={{ latitude, longitude }}
              title="Your Location"
              pinColor="blue"
            />
          )}
          {/* Render markers for each filtered court */}
          {filteredCourts.map(court => (
            <Marker
              key={court.id}
              coordinate={court.coordinate}
              title={court.name}
              description={`${court.sport} - ${court.location}`}
            />
          ))}
        </MapView>
      </View>
      
      {/* Details Modal */}
      {selectedCourt && (
        <FacilityDetails
          visible={isFacilityDetailsVisible}
          onClose={closeModal}
          courtName={selectedCourt.name}
          courtDetails={selectedCourt.details}
        />
      )}

      {/* Draggable List Sheet */}
      {filteredCourts.length > 0 ? (
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY: sheetPosition }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          <FlatList
            data={filteredCourts}
            keyExtractor={(item) => item.id}
            bounces={false}
            scrollEnabled={scrollEnabled}
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
  container: { flex: 1, backgroundColor: '#fff' },
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
    backgroundColor: '#eee',
  },
  filterButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  filtersContainer: {
    position: 'absolute',
    top: SHEET_TOP,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
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
  },
  filterOption: { marginBottom: 10 },
  filterLabel: { fontWeight: 'bold', marginBottom: 5 },
  filterOptionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  filterOptionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
    marginRight: 5,
    marginBottom: 5,
  },
  filterOptionButtonSelected: { backgroundColor: '#007bff' },
  filterOptionText: { color: 'black' },
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
    position: 'absolute',
    top: SHEET_TOP,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  listContent: {
    backgroundColor: 'white',
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  listItem: {
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  listItemText: { fontSize: 18, fontWeight: 'bold' },
  listItemSubText: { color: 'gray', marginTop: 5 },
  bookButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: { color: 'white' },
});