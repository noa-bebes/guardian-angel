import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'

function LocationScreen({ route, navigation }) {
  const { shelter, currentLocation, currentLocationAddress } = route.params;
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    const { geometry } = shelter;
    const { location } = geometry;
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${location.lat},${location.lng}&key=AIzaSyAvspuwEEG6SSPj4ytIw2PLnbIT9EQBHsM`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setRouteData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching route data:', error);
        setLoading(false);
      });
  }, []);

  const renderRoute = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#red" />;
    }

    if (routeData && routeData.routes && routeData.routes.length > 0) {
      const { overview_polyline } = routeData.routes[0];
      const polylinePoints = overview_polyline.points;

      return (
        <>
          <Polyline
            coordinates={decodePolyline(polylinePoints)}
            strokeWidth={5}
            strokeColor="blue"
          />
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="נקודת מוצא"
          />
          <Marker
            coordinate={{
              latitude: shelter.geometry.location.lat,
              longitude: shelter.geometry.location.lng,
            }}
            title="נקודת יעד"
          />
        </>
      );
    }

    return <Text style={styles.infoText}>אין נתוני מסלול זמינים</Text>;
  };

  const handleLiveNavigation = () => {
    const { geometry } = shelter;
    const { location } = geometry;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    Linking.openURL(url);
  };

  // Function to decode polyline points
  const decodePolyline = (encoded) => {
    let index = 0;
    let len = encoded.length;
    let lat = 0;
    let lng = 0;
    const polyline = [];

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      polyline.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return polyline;
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {renderRoute()}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>{`נקודת מוצא: ${currentLocationAddress}`}</Text>
        <Text style={styles.infoText}>{`נקודת יעד: ${shelter.name}`}</Text>
        <Text style={styles.infoText}>
          {routeData && routeData.routes && routeData.routes.length > 0
            ? `מרחק: ${routeData.routes[0].legs[0].distance.text}`
            : 'מחשב את המרחק...'}
        </Text>
        <Text style={styles.infoText}>
          {routeData && routeData.routes && routeData.routes.length > 0
            ? `משך זמן: ${routeData.routes[0].legs[0].duration.text}`
            : 'מחשב את משך הזמן...'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProtectedSpaceScreen')}>
          <Text style={styles.Textbutton}>לניווט חי למקלט</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  infoContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0', // Light gray background color
    direction: 'rtl', // Set text direction to right-to-left
    width: '100%', // Take up full width of the screen
    alignItems: 'center', // Center items vertically
  },
  
  infoText: {
    fontFamily: 'Helvetica-Bold', // Set your impressive font family
    fontSize: 18, // Increase font size for emphasis
    textAlign: 'right', // Align text to the right
    fontWeight: 'bold', // Set the font weight to bold
    color: 'purple', // Dark gray text color
  },

  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(181, 179,185, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  
  },
  Textbutton: {
    fontFamily: 'Helvetica-Bold', 
    color: 'rgba(21,49,255, 0.4)',
    fontSize: 16,
    fontWeight: 'bold',
  }
};

export default LocationScreen;
