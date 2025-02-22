import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import { useUser } from '@clerk/clerk-expo';

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

  return (
    <SafeAreaView style={styles.container}>
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
