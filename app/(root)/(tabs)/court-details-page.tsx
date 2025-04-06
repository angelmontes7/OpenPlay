// CourtDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';

interface Court {
  id: string;
  name: string;
  address: string;
  sport: string;
  capacity: number;
  description: string;
  amenities: string;
  website: string;
  stars: number;
}

interface RouteParams {
  court: Court;
}

export default function CourtDetailsPage() {
  const route = useRoute();
  console.log('Route parameters:', route.params);
  const { court } = route.params as RouteParams || {};
  const navigation = useNavigation();
  const { user } = useUser();

  if (!court) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: Court data not found.</Text>
      </SafeAreaView>
    );
  }

  // State for check-in/out functionality
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [headCount, setHeadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchHeadCount = async () => {
    try {
      const res = await fetch(`/api/database/check_in?courtId=${court.id}`);
      const data = await res.json();
      setHeadCount(Number(data.headCount));
    } catch (error) {
      console.error('Error fetching head count:', error);
    }
  };

  useEffect(() => {
    fetchHeadCount();
  }, [court]);

  const handleCheckInOut = async () => {
    setLoading(true);
    try {
      if (!isCheckedIn) {
        const res = await fetch(`/api/database/check_in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, courtId: court.id }),
        });
        if (!res.ok) {
          const err = await res.json();
          Alert.alert('Error', err.error || 'Failed to check in.');
          return;
        }
        setIsCheckedIn(true);
      } else {
        const res = await fetch(`/api/database/check_out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, courtId: court.id }),
        });
        if (!res.ok) {
          const err = await res.json();
          Alert.alert('Error', err.error || 'Failed to check out.');
          return;
        }
        setIsCheckedIn(false);
      }
      fetchHeadCount();
    } catch (error) {
      console.error('Error during check in/out:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{court.name}</Text>
        <Text style={styles.subtitle}>{court.address}</Text>
        <Text>Sports: {court.sport}</Text>
        <Text>Capacity: {court.capacity}</Text>
        <Text>Description: {court.description}</Text>
        <Text>Amenities: {court.amenities}</Text>
        <Text>Website: {court.website}</Text>
        <Text>Stars: {court.stars}</Text>

        <TouchableOpacity
          onPress={handleCheckInOut}
          style={[styles.button, { backgroundColor: isCheckedIn ? 'red' : 'green' }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isCheckedIn ? 'Check Out' : 'Check In'}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.headCount}>Current head count: {headCount}</Text>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 10 },
  button: { padding: 15, borderRadius: 8, marginVertical: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  headCount: { fontSize: 16 },
  closeButton: { marginTop: 20, alignSelf: 'center' },
  closeButtonText: { color: 'blue' },
  errorText: { fontSize: 18, color: 'red' },
});
