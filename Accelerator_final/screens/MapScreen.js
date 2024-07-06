import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFonts, Assistant_400Regular, Assistant_700Bold } from '@expo-google-fonts/assistant';
import { KeyboardAvoidingView } from 'react-native';

function MapScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationAddress, setCurrentLocationAddress] = useState('');
  const [shelters, setShelters] = useState([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [foundLocation, setFoundLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const API_KEY = 'AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE';

  const [fontsLoaded] = useFonts({
    Assistant_400Regular,
    Assistant_700Bold,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setCurrentLocationAddress(address[0].name);

        fetchBombShelters(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error fetching current location:', error);
      }
    })();
  }, []);

 const fetchBombShelters = async (latitude, longitude) => {
   const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bomb+shelter&location=${latitude},${longitude}&radius=1000&key=${API_KEY}`;
   try {
     const response = await fetch(apiUrl);
     const data = await response.json();
     console.log('Bomb Shelters:', data.results);

     // Filter shelters based on distance (5 minutes walking distance)
     const filteredShelters = data.results.filter(shelter => {
       if (shelter.geometry && shelter.geometry.location) {
         const shelterLocation = shelter.geometry.location;
         const distance = calculateDistance(latitude, longitude, shelterLocation.lat, shelterLocation.lng);
         // Assuming average walking speed as 1.4 m/s, 5 minutes = 5 * 60 seconds = 300 seconds
         const maxDistance = 300 * 1.4; // Maximum distance in meters for 5 minutes walking
         return distance <= maxDistance;
       }
       return false;
     });

     if (filteredShelters.length === 0) {
       Alert.alert('לא נמצאו מרחבים מוגנים קרובים לכתובת');
     }
     setShelters(filteredShelters);
   } catch (error) {
     console.error('Error fetching bomb shelters:', error);
     Alert.alert('Error fetching bomb shelters');
   }
 };

 const calculateDistance = (lat1, lon1, lat2, lon2) => {
   const R = 6371e3; // Radius of the Earth in meters
   const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
   const φ2 = lat2 * Math.PI / 180;
   const Δφ = (lat2 - lat1) * Math.PI / 180;
   const Δλ = (lon2 - lon1) * Math.PI / 180;

   const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
     Math.cos(φ1) * Math.cos(φ2) *
     Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

   const d = R * c; // Distance in meters
   return d;
 };

 const handleSearch = async () => {
   if (!searchAddress.trim()) {
     Alert.alert('Please enter an address');
     return;
   }

   try {
     const encodedAddress = encodeURIComponent(searchAddress);
     const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}&language=iw}&mode=walking`;
     const response = await fetch(apiUrl);
     const data = await response.json();

     if (data.status === 'OK' && data.results.length > 0) {
       const location = data.results[0].geometry.location;
       setFoundLocation(location);

       // Fetch bomb shelters based on this location
       fetchBombShelters(location.lat, location.lng);

       // Update current location marker to searched location
       setCurrentLocation({
         latitude: location.lat,
         longitude: location.lng,
       });

       // Center the map on the searched location
       mapRef.animateToRegion({
         latitude: location.lat,
         longitude: location.lng,
         latitudeDelta: 0.01,
         longitudeDelta: 0.01,
       });

       // Clear previous shelters
       setShelters([]);
     } else if (data.status === 'ZERO_RESULTS') {
       Alert.alert('Address not found');
       setShelters([]);
     } else {
       Alert.alert('Error fetching address');
       setShelters([]);
     }
   } catch (error) {
     console.error('Error fetching address:', error);
     Alert.alert('Error fetching address');
     setShelters([]);
   }
 };

 const calculateWalkingTime = (distance) => {
   const walkingSpeed = 1.2; // Average walking speed in meters per second
   const timeInSeconds = distance / walkingSpeed;
   const minutes = Math.floor(timeInSeconds / 60);
   const seconds = Math.floor(timeInSeconds % 60);
   return `${minutes} דקות ${seconds} שניות`;
 };

 // Return null while waiting for fonts to load
 if (!fontsLoaded) {
   return null;
 }

 return (
  <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} behavior="padding">
   <View style={{ flex: 1 }}>
     <View style={{ flex: 0.10, backgroundColor:'rgb(251, 220, 106)', padding: 10}}>
       <View style={{ flexDirection: 'row', alignItems: 'center', width: '90%', alignSelf: 'center'}}>
         <TouchableOpacity
           style={{
             backgroundColor: 'black',
             width: '25%',
             height: '100%',
             alignItems: 'center',
             justifyContent: 'center',
             borderRadius: 10,
           }}
           onPress={handleSearch}
         >
           <Text style={{ color: 'white', fontFamily: 'Assistant_700Bold', fontSize: 18 }}>חיפוש</Text>
         </TouchableOpacity>
         <TextInput
           style={{
            height: '100%',
             width: '75%',
             borderColor: 'gray',
             fontFamily: 'Assistant_400Regular',
             borderWidth: 2,
             backgroundColor: 'white',
             borderRadius: 10,
             paddingHorizontal: 10,
             marginLeft: 5, // Space between the button and the search box
           }}
           onChangeText={text => setSearchAddress(text)}
           value={searchAddress}
           placeholder="רבנו ירוחם 2, תל אביב יפו"
         />
         
       </View>
     </View>
     <View style={{ flex: 0.90 }}>
        <MapView
          ref={ref => setMapRef(ref)}
          style={{ flex: 1 }}
          region={{
            latitude: foundLocation ? foundLocation.lat : currentLocation ? currentLocation.latitude : 0,
            longitude: foundLocation ? foundLocation.lng : currentLocation ? currentLocation.longitude : 0,
            latitudeDelta: 0.01, // More zoomed-in view
            longitudeDelta: 0.01, // More zoomed-in view
          }}
          customMapStyle={[
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#212121"
                }
              ]
            },
            {
              "elementType": "labels.icon",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#212121"
                }
              ]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "administrative.country",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            },
            {
              "featureType": "administrative.land_parcel",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#bdbdbd"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#181818"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#1b1b1b"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [
                {
                  "color": "#2c2c2c"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#8a8a8a"
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#373737"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#3c3c3c"
                }
              ]
            },
            {
              "featureType": "road.highway.controlled_access",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#4e4e4e"
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#000000"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#3d3d3d"
                }
              ]
            }
          ]}
        >
         {currentLocation && (
           <Marker
             coordinate={{
               latitude: currentLocation.latitude,
               longitude: currentLocation.longitude,
             }}
             title="מיקום נוכחי"
             pinColor='rgb(251, 220, 106)'
           />
         )}
         {foundLocation && (
           <Marker
             coordinate={{
               latitude: foundLocation.lat,
               longitude: foundLocation.lng,
             }}
             title="כתובת היעד"
             pinColor='rgb(251, 220, 106)'
           />
         )}
         {foundLocation && shelters.map((shelter, index) => (
           <Marker
             key={index}
             coordinate={{
               latitude: shelter.geometry.location.lat,
               longitude: shelter.geometry.location.lng,
             }}
             title={shelter.name}
             pinColor="black"
           >
             <Callout>
               <View>
                 <Text>נקודת מוצא: {searchAddress}</Text>
                 <Text>נקודת יעד: {shelter.name}</Text>
                 <Text>מרחק: {(calculateDistance(foundLocation.lat, foundLocation.lng, shelter.geometry.location.lat, shelter.geometry.location.lng) / 1000).toFixed(2)} ק"מ</Text>
                 <Text>זמן: {calculateWalkingTime(calculateDistance(foundLocation.lat, foundLocation.lng, shelter.geometry.location.lat, shelter.geometry.location.lng))}</Text>
               </View>
             </Callout>
           </Marker>
         ))}
       </MapView>
     </View>
   </View>
   </KeyboardAvoidingView>
 );
}

export default MapScreen;