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
import MapView from 'react-native-maps';
import { useUser } from '@clerk/clerk-expo';
import { fetchAPI } from '@/lib/fetch';
import { icons } from '@/constants';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';

const { height } = Dimensions.get('window');
const SEARCH_BAR_HEIGHT = 60; 

// Define the type for a court.
interface Court {
  id: string;
  name: string;
  location: string;
  available: boolean;
}

export default function Home() {
  const { user } = useUser();

  // Consts for DOB check
  const [dob, setDob] = useState<string | null>(null);
  const [showDOBModal, setShowDOBModal] = useState(false);
  const [data, setData] = useState<{ dob: string } | null>(null);
  

  const [search, setSearch] = useState('');
  // When the sheet is fully expanded (i.e. near 0), we allow inner list scrolling.
  const [scrollEnabled, setScrollEnabled] = useState(false);

  // The animated value controls the vertical position of the sheet.
  const sheetPosition = useRef(new Animated.Value(height * 0.5)).current;
  const sheetPositionValue = useRef(height * 0.5);
  sheetPosition.addListener(({ value }) => {
    sheetPositionValue.current = value;
  });
  const lastSheetPosition = useRef(sheetPositionValue.current);

  // Track the inner list’s scroll offset.
  const listScrollOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
        // If the sheet isn’t fully expanded, always capture the gesture.
        // When expanded, only capture a downward gesture if the inner list is scrolled to the top.
        if (!scrollEnabled) {
          return true;
        } else if (scrollEnabled && gestureState.dy > 0 && listScrollOffset.current <= 0) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        // Record the current sheet position when the gesture starts.
        lastSheetPosition.current = sheetPositionValue.current;
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        let newPos = lastSheetPosition.current + gestureState.dy;
        // Constrain the sheet's position between fully expanded (0) and its collapsed position.
        newPos = Math.min(Math.max(newPos, 0), height * 0.5);
        sheetPosition.setValue(newPos);
      },
      onPanResponderRelease: () => {
        // Instead of snapping to a fixed position, we leave the sheet at the current position.
        // If it's nearly fully expanded (close to 0), enable inner list scrolling.
        if (sheetPositionValue.current < 20) {
          setScrollEnabled(true);
        } else {
          setScrollEnabled(false);
        }
        // Flatten any offsets (optional here since we’re not using setOffset)
        sheetPosition.flattenOffset();
      },
    })
  ).current;

  // Sample court data.
  const courtData: Court[] = [
    { id: '1', name: 'Downtown Basketball Court', location: '5th Avenue', available: true },
    { id: '2', name: 'Central Park Tennis Court', location: 'Main Street', available: false },
    { id: '3', name: 'City Soccer Field', location: 'Broadway', available: true },
    { id: '4', name: 'Westside Gym Court', location: '7th Street', available: true },
    { id: '5', name: 'Lakeside Volleyball Court', location: 'Lake Avenue', available: false },
    { id: '6', name: 'Highland Park Tennis Court', location: 'Highland Blvd', available: true },
  ];

  // Use the first court as a sticky header.
  const headerCourt = courtData[0];
  const listData = courtData.slice(1);

  // Render an individual court item.
  const renderCourtItem = ({ item }: { item: Court }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item.name}</Text>
      <Text style={styles.listItemSubText}>{item.location}</Text>
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: item.available ? 'green' : 'gray' }]}
        disabled={!item.available}
      >
        <Text style={styles.bookButtonText}>{item.available ? 'Book Now' : 'Unavailable'}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the sticky header using the first court.
  const ListHeader = () => (
    <View style={styles.headerItem}>
      <Text style={styles.listItemText}>{headerCourt.name}</Text>
      <Text style={styles.listItemSubText}>{headerCourt.location}</Text>
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: headerCourt.available ? 'green' : 'gray' }]}
        disabled={!headerCourt.available}
      >
        <Text style={styles.bookButtonText}>
          {headerCourt.available ? 'Book Now' : 'Unavailable'}
        </Text>
      </TouchableOpacity>
    </View>
  );


  // Collecting DOB if not set
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
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search for courts..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.searchFilters}>

      </View>

      {/* Interactive Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>

      {/* Draggable List Sheet */}
      <Animated.View
        style={[styles.sheetContainer, { transform: [{ translateY: sheetPosition }] }]}
        {...panResponder.panHandlers}
      >
        {/* Drag handle indicator */}
        <View style={styles.dragIndicator} />
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          bounces={false}
          scrollEnabled={scrollEnabled}
          onScroll={(e) => {
            listScrollOffset.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          renderItem={renderCourtItem}
          // Render the first court as a sticky header.
          ListHeaderComponent={ListHeader}
          stickyHeaderIndices={[0]}
          // Extra bottom padding so the last item isn’t hidden by the nav bar.
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    backgroundColor: 'transparent',
    padding: 15,
    justifyContent: 'center',
    zIndex: 10,
  },
  searchInput: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  searchFilters: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    backgroundColor: 'Transparent',
    padding: 15,
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    zIndex: 0,
  },
  map: {
    flex: 1,
  },
  sheetContainer: {
    position: 'absolute',
    top: 0,
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
    paddingBottom: 100, // Ensure the last item isn't hidden under the nav bar.
  },
  headerItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
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
  listItemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItemSubText: {
    color: 'gray',
  },
  bookButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
  },
});
