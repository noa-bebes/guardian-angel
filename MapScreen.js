import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

function MapScreen() {
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Fetch current location address
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setCurrentLocationAddress(address[0].name);

      // Fetch shelters
      fetchShelters(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchShelters = async (latitude, longitude) => {
    // Fetch shelters based on current location
    const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=shelter&location=${latitude},${longitude}&radius=1000&key=AIzaSyAvspuwEEG6SSPj4ytIw2PLnbIT9EQBHsM`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log('Shelters:', data.results);
      setShelters(data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shelters:', error);
      setLoading(false);
    }
  };

  const handleNavigateToLocationScreen = (shelter) => {
    navigation.navigate('LocationScreen', { shelter, currentLocation, currentLocationAddress });
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Current Location"
            />
          )}
          {shelters.map((shelter, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: shelter.geometry.location.lat,
                longitude: shelter.geometry.location.lng,
              }}
              title={shelter.name}
              onPress={() => handleNavigateToLocationScreen(shelter)}
            />
          ))}
        </MapView>
      )}
      
    </View>
  );
}

export default MapScreen;