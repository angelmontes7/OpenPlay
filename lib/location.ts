import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export const getUserLocation = async (): Promise<UserLocation | null> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied.");
      return null;
    }

    // Get the user's current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;
    return { latitude, longitude };
  } catch (error) {
    console.error("Error getting user location:", error);
    return null;
  }
};

export const watchUserLocation = async (
  onLocationUpdate: (location: UserLocation) => void
): Promise<Location.LocationSubscription | null> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied.");
      return null;
    }

    // Watch the user's location
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        onLocationUpdate({ latitude, longitude });
      }
    );

    return subscription;
  } catch (error) {
    console.error("Error watching user location:", error);
    return null;
  }
};