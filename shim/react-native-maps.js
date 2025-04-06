// shim/react-native-maps.js
import React from 'react';
import { View, Text } from 'react-native';

const MapView = (props) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' }}>
    <Text>Map is not available on web.</Text>
  </View>
);

const Marker = () => null;

export default MapView;
export { Marker };
