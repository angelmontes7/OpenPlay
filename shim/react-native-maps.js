// shim/react-native-maps.js
import React from 'react';
import { View, Text } from 'react-native';

// A dummy MapView for web
const MapView = (props) => (
  <View style={props.style}>
    <Text style={{ textAlign: 'center' }}>Map is not available on web.</Text>
  </View>
);

// Dummy Marker component; just render nothing
MapView.Marker = () => null;

export default MapView;
export { MapView as Marker };
