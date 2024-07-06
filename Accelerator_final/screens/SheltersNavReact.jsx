//---------Tikva's addition to the code-------:
//If you want to see the changes that were made write: "-- changed by tikva"
//If you want to see the changes that were made write: "-- changed by Adi"


import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Text, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, Polyline, Callout } from 'react-native-maps';
//-- changed by tikva (removed line 9 since object "navigation" is already passed)
//import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook to navigate between screens 
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios'; // Import the axios library to make HTTP requests, this will be used to navigate to the closest shelter using the Google Maps API Distance Matrix service
import { useFonts, Assistant_400Regular, Assistant_700Bold } from '@expo-google-fonts/assistant'; //-- changed by tikva (added fonts)
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 


function SheltersNavReact({ navigation, route }) { // -- changed by tikva (the () were empty, now they contains "navigation" and "route" in order to navigate between screens and pass the user's data)
  const defaultLocation = { latitude: 32.0868, longitude: 34.7897 }; // Kikar HaMedina, Tel Aviv
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [streetViewLat, setStreetViewLat] = useState(null);
  const [streetViewLng, setStreetViewLng] = useState(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [minRoute, setRoute] = useState([]); // -- changed by tikva
  const [isPanning, setIsPanning] = useState(false); // Used to show a loading indicator while panning to the user's location
  const [directions, setDirections] = useState([]);

  // -- changed by tikva (removed line 27 since object "navigation" is already passed)
  // const navigation = useNavigation(); // Get the navigation object to navigate between screens

  // -- changed by tikva (added fonts)
  const [fontsLoaded] = useFonts({
    Assistant_400Regular,
    Assistant_700Bold,
  });


  //-- changed by tikva (added const "user" in order to pass user's data)
  const { user } = route.params;
  //-- changed by tikva (added const "start_point" + "end_point" + "travelTime" for better Visualization)
  const [start_point, setStartPoint] = useState(null); // Initial start point in format of "street+city"
  const [end_point, setEndPoint] = useState(null); // Chosen shelter end point in format of "street+city"
  const [travelTime, setTravelTime] = useState(null); // Travel duration
  const [minDistance, setMinDistance] = useState(0); // Initialize minDistance state

  // Get user's location and initialize the map when the component mounts and location is defined (if location is not defined, the map will be centered on the default location); also update the user's location every 5 seconds
  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setUserLocation(defaultLocation);
      }
      else {
        console.log("location status:", status);
        const position = await Location.getCurrentPositionAsync({});
        console.log("position acquired:", position);
        const initialLocation = {latitude: position.coords.latitude, longitude: position.coords.longitude};
        console.log("initial location:", initialLocation);
        setUserLocation(initialLocation);
        addCustomControls();
        initMap(initialLocation);

        // Set an interval to update the user's location
        const locationInterval = setInterval(async () => {
          const newPosition = await Location.getCurrentPositionAsync({});
          const newCoords = {
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
          };
          setUserLocation(newCoords);
        }, 30000); // Update every 30 seconds

        // Clear interval on component unmount
        return () => clearInterval(locationInterval);
      }
    };
    getUserLocation();
  }, []);

  // when user location changes, remove old user location marker and add new one
  useEffect(() => {
    if (userLocation) {
      setMarkers((currentMarkers) => currentMarkers.filter(marker => marker.key !== 'userLocationMarker')); // remove old user location marker
      centerMapOnLocation(userLocation);
    }
  }, [userLocation]);

  // Initialize the map and search for shelters
  const initMap = async (location) => {
    console.log('Map initialized');
    centerMapOnLocation(location);
    
    // search for shelters and navigate to closest shelter
    let appxRadius = 0.01; //-- changed by Adi (from 0.05 to 0.01)
    /* approximate radius in degrees to search around the user's location, every 0.1 degree is about 11km; use a value large enough to ensure that normally more than one shelter is found, to allow user choice between them */
    let shelterResults = [];
    while (shelterResults.length === 0 && appxRadius < 0.5) {
      console.log("Searching for shelters around:", location);
      shelterResults= await nearbySearch(location, appxRadius);
      if (shelterResults.length === 0) {
        console.log(`No shelters found within ${appxRadius} of user's location, expanding search radius`);
        appxRadius += 0.001;
      }
    }//end while loop
    if (shelterResults.length > 0) {
      console.log('Shelters found, navigating to closest shelter');
      NavigateToShelter(location, shelterResults);
    } else {
      console.log("No shelters found within 5km of user's location");
    }
  };//end initMap function 

  // Get directions to the given location
  const getDirectionsToLocation = async (lat, lng) => {
    const chosenShelter = { latitude: lat, longitude: lng };
    console.log("Navigating to point:", chosenShelter);
    const chosenShelterCoords = `${chosenShelter.latitude},${chosenShelter.longitude}`; //shelter's location in Google Maps format
    const googleLocation = `${userLocation.latitude},${userLocation.longitude}`; //user's location in Google Maps format
  
    // Directions API request -- changed by tikva (changed the API to hebrew)
    const directionsResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${googleLocation}&destination=${chosenShelterCoords}&mode=walking&language=iw&key=AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE`
    ); 
    //console.log('Directions API response:', directionsResponse.data); // uncomment for debugging - small amount of not very useful data
    console.log('Destination:', chosenShelter);
    handleDirections(directionsResponse);
  };//end getDirectionsToLocation function

  const handleDirections = async (response) => {
    // Extract step-by-step instructions
    const steps = response.data.routes[0].legs[0].steps;
    //console.log('Steps:', steps); // uncomment for debugging - large amount of data 
    const instructions = steps.map(step => {
      // Extract direction and type of road from html_instructions
      const directionMatch = step.html_instructions.match(/<b>(.*?)<\/b>/);
      const direction = directionMatch ? directionMatch[1] : '';
      const roadNameMatch = step.html_instructions.match(/<div style="font-size:0.9em">(.*?)<\/div>/);
      const roadName = roadNameMatch ? roadNameMatch[1] : '';
      const destinationRegex = /(Destination will be.*?)<\/div>/;
      const destinationMatch = step.html_instructions.match(destinationRegex);
      const destination = destinationMatch ? destinationMatch[1].trim() : '';
      // Format the instruction
      return `פנה ל${direction} ${roadName} במשך ${step.distance.text}. ${destination}`.trim();
    });
    console.log('Instructions:', instructions);
    setDirections(instructions);

    //-- changed by tikva (added const for better visualization)
    // Extract initial location ("start point"), closest shelter location ("end point") and the duration to the closest shelter location ("travelTime")
    const initialLocation = response.data.routes[0].legs[0].start_address;
    const chosenShelter = response.data.routes[0].legs[0].end_address;
    const duration = response.data.routes[0].legs[0].duration.text;

    //-- changed by tikva (added const for better visualization)
    // Remove the country part from the address
    const initialLocationWithoutCountry = initialLocation.replace(/, ישראל$/, '');
    const chosenShelterWithoutCountry = chosenShelter.replace(/, ישראל$/, '');

    //-- changed by tikva (added const for better visualization)
    // Set start point, end point, and travel time
    setStartPoint(initialLocationWithoutCountry);
    setEndPoint(chosenShelterWithoutCountry);
    setTravelTime(duration);

    // Draw the route on the map
    const routeCoordinates = [];
    steps.forEach((step) => {
      // Add the start location of each step
      routeCoordinates.push({
        latitude: step.start_location.lat,
        longitude: step.start_location.lng,
      });
      // Add the end location of each step
      routeCoordinates.push({
        latitude: step.end_location.lat,
        longitude: step.end_location.lng,
      });
    });
    // set the route and fit the map to the route
    setRoute(routeCoordinates);
    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };//end handleDirections function

  // Open Google Street View at the given location
  const openStreetViewCustom = async (lat, lng) => {
    const streetViewRequest = {
      location: `${lat},${lng}`,
      radius: 50, // Set the radius to a small value to check if street view is available nearby
      key: 'AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE'
    };
  
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/streetview/metadata`,
        { params: streetViewRequest }
      );
  
      if (response.data.status === "OK") {
        // Street view is available
        console.log("Opening street view at", lat, lng);
        setStreetViewLat(lat);
        setStreetViewLng(lng);
        setShowStreetView(true);
      } else {
        // Street view is not available
        console.log("Street view is not available at this location");
        Alert.alert("Street view is not available at this location");
      }
    } catch (error) {
      console.log("Error checking street view availability", error);
      Alert.alert("Error checking street view availability");
    }
  };//end openStreetViewCustom function  

  // Search for "bomb shelter" near user's location
  const nearbySearch = async (location, appxRadius) => {
    /*  
      appxRadius is the approximate radius in degrees to search around the location.
      Each degree is approximately 11km, so 0.1 degree is about 1km, and 0.005 is about 500m  
    */
   
   let request;
   if (location) {
      console.log(`searching around user's location within ${appxRadius * 100}km radius`);
      
      // Define the search request
      request = {
        query: "מקלט", // -- changed by Adi (from "bomb shalter" to "מקלט")
        location: `${location.latitude},${location.longitude}`,
        radius: appxRadius * 111000, // Convert degrees to meters (approximate)
        key: 'AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE',
        opennow: true,
        language: 'iw',
      };
    } else {
      console.log("Location is null");
    }
    
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      { params: request }
    );
    //console.log("response:", response.data); // uncomment for debugging - large amount of data
  
    if (response.data.results.length) {
      //console.log("results found:", response.data.results); // uncomment for debugging - large amount of data
  
      const placesAsArray = response.data.results.map((place) => ({
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        name: place.name,
        address: place.formatted_address,
        businessStatus: place.business_status,
      }));
      //console.log("places as array:", placesAsArray) // uncomment for debugging - large amount of data

      // Fit the map to the search results bounds
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(placesAsArray, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
  
      return placesAsArray;
    } else {
      console.log(`NearbySearch returned no results within ${appxRadius * 100}km radius`);
      return null;
    }
  };//end nearbySearch function

  // Load shelters and calculate distance to each shelter, then draw path to closest shelter
  const NavigateToShelter = async (location, sheltersArray) => {
    // console.log("distance matrix using shelters array:", sheltersArray); // uncomment for debugging - large amount of data

    // convert user location to Google Maps format
    const googleLocation = `${location.latitude},${location.longitude}`; //user's location in Google Maps format
    console.log("calculating distance matrix at location:", location);

    // Prepare destinations for the Distance Matrix API request
    const destinations = sheltersArray.map(
      (shelter) => `${shelter.latitude},${shelter.longitude}`
    ).join('|');

    // Distance Matrix API request -- changed by tikva (changed the API to hebrew)
    const distanceMatrixResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${googleLocation}&destinations=${destinations}&mode=walking&avoid=highways&language=iw&key=AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE`
    ); 
    //console.log('Distance Matrix API response:', distanceMatrixResponse.data); // uncomment for debugging - large amount of data

    // Set variables for closest shelter calculation
    const results = distanceMatrixResponse.data.rows[0].elements; // array of distances to each shelter
    let minDistance = 1000000; // smallest distance to shelter, initialize to large number to ensure first distance is smaller
    let minIndex = 0; // index of closest shelter

    // Loop through the results to find the closest shelter
    for (let j = 0; j < results.length; j++) {
      const element = results[j];
      const distanceAsText = element.distance.text;
      const distanceAsValue = element.distance.value;
      if (distanceAsValue < minDistance) {
        minDistance = distanceAsValue;
        minIndex = j;
      }
      const duration = element.duration.text;
      const to = distanceMatrixResponse.data.destination_addresses[j];
      console.log(`Distance to ${to} is ${distanceAsText} and takes ${duration}`);
      
      // Add marker at shelter location
      setMarkers((currentMarkers) => [
        ...currentMarkers,
        {
          coordinate: sheltersArray[j],
          key: `shelterMarker_${j}`,
          name: sheltersArray[j].name,
          address: sheltersArray[j].address,
          businessStatus: sheltersArray[j].businessStatus,
        },
      ]);
    };//end for loop
    

    // If duration is more than 2 minutes, show an alert and offer to show Homefront Command instructions or continue to closest shelter
    const minDurationAsValue = results[minIndex].duration.value;
    const minDurationAsText = results[minIndex].duration.text;
    if (minDurationAsValue > 120) {
      //-- changed by tikva (changed the alert text to hebrew)
      Alert.alert(
        `אזהרה!`,
        'זמן ההגעה המשוער למרחב מוגן ארוך מזמן ההתגוננות. במצב זה ממולץ לפעול לפי הנחיות פיקוד העורף.',
        [
          {
            text: 'הנחיות פיקוד העורף',
            onPress: () => navigateHfcInstructions(),
          },
          {
            text: 'המשך בניווט',
            onPress: () => console.log('Cancel Pressed'),
          }
        ]
      );//end Alert
    }//end if statement

    // Log the closest shelter and distance 
    console.log(`Closest shelter is ${results[minIndex].distance.text} away, trip will take ${results[minIndex].duration.text}`);

    // --tikva added
    const translateDistanceToHebrew = (distanceText) => {
      return distanceText.replace('km', 'ק"מ').replace('m', 'מטרים');
    };
    const closestShelterDistance = translateDistanceToHebrew(results[minIndex].distance.text);
    setMinDistance(closestShelterDistance);
    
    // Directions API request
    let chosenShelter = sheltersArray[minIndex];
    let chosenShelterCoords = `${chosenShelter.latitude},${chosenShelter.longitude}`;
    // -- changed by tikva (changed the API to hebrew)
    const directionsResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${googleLocation}&destination=${chosenShelterCoords}&mode=walking&language=iw&key=AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE`

    );
    //console.log('Directions API response:', directionsResponse.data); // uncomment for debugging - small amount of not very useful data
    handleDirections(directionsResponse);
    console.log('Destination:', chosenShelter);
  };//end NavigateToShelter function

  // Center the map on the user's location
  const centerMapOnLocation = async (location) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000); // Animate the map to the new location over 1 second
    } else {
      console.log("handling location error")
      handleLocationError(true, defaultLocation);
    }
    
    // Add marker at user's location
    setMarkers((currentMarkers) => [
      ...currentMarkers,
      {
        coordinate: location,
        key: 'userLocationMarker',
        pinColor: 'rgb(251, 220, 106)',
      },
    ]);
  };//end centerMapOnLocation function
  
  // Add custom controls to the map
  const addCustomControls = () => {
    const panToCurrentLocation = async () => {
      setIsPanning(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        handleLocationError(false, defaultLocation);
        setIsPanning(false);
        return;
      }
     
      let location = await Location.getCurrentPositionAsync({});
      const pos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
  
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...pos,
          latitudeDelta: 0.0015,
          longitudeDelta: 0.0015,
        });
        setIsPanning(false) // End panning when animation is complete
      } else {
        handleLocationError(true, pos);
        setIsPanning(false); 
      }
    };
  
    return (
      <>
        <TouchableOpacity
          style={styles.customMapControlButton}
          onPress={panToCurrentLocation}
        >
          <Text style={styles.buttonText}>איפוס המפה למיקום הנוכחי</Text> 
        </TouchableOpacity>
        {isPanning && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color="rgb(251, 220, 106)" />
          </View>
        )}
      </>
    );
  };//end addCustomControls function

  // Handle geolocation errors
  const handleLocationError = (browserHasGeolocation, pos) => {
    Alert.alert(
      'Geolocation Error',
      browserHasGeolocation
        ? 'The Geolocation service failed.'
        : "Your device doesn't support geolocation.",
      [{ text: 'OK' }]
    );
  
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: pos.latitude,
        longitude: pos.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };//end handleLocationError function

  
  // Navigate to send smsScreen (smsScreen.js) 
  const navigateSmsScreen = () => {
    navigation.navigate('SmsScreen', { user }); //-- changed by tikva (added "user" to the command)
  };

  // Navigate to Homefront Command Instructions page (HfcInstructions.js)
  const navigateHfcInstructions = () => {
    navigation.navigate('HfcInstructions', { user }); //-- changed by tikva (added "user" to the command)
  };

  // -- added by tikva
  const darkModeStyle = [
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
  ];

   // Return null while waiting for fonts to load
  if (!fontsLoaded) {
    return null;
}
  
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={MapView.PROVIDER_GOOGLE} // this doesn't work for some reason
        customMapStyle={darkModeStyle} // Apply dark mode style here
      >
        {userLocation && (
          <Circle
            center={userLocation}
            radius={10}
            strokeColor="rgba(0,0,255,0.5)"
            fillColor="rgba(0,0,255,0.1)"
          />
        )}
        {markers.map((marker) => (
          // TODO: add full address, isOpen status and operating hours to the Marker Callout
          <Marker 
            key={marker.key} 
            coordinate={marker.coordinate}
            pinColor={marker.pinColor}
            >
            <Callout>
              <Text>{marker.name}</Text>
              <Text>{marker.address}</Text>
              <TouchableOpacity
                onPress={() => openStreetViewCustom(marker.coordinate.latitude, marker.coordinate.longitude)}
              >
                <Text style={styles.buttonText}>Open Street View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => getDirectionsToLocation(marker.coordinate.latitude, marker.coordinate.longitude)}
              >
                <Text style={styles.buttonText}>Navigate Here</Text>
              </TouchableOpacity>
            </Callout>
          </Marker>
        ))}
        {minRoute.length > 0 && (
          <Polyline
            coordinates={minRoute}
            strokeWidth={4}
            strokeColor="rgb(251, 220, 106)"
          />
        )}
      </MapView>
    </View>

      {/* -- changed by tikva (change the visualization)*/}

      <View style={styles.routeDetailContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.endpointName}>{end_point}</Text>
          <FontAwesome name="map-marker" size={24} color="red" style={styles.icon} />
        </View>
        <View style={styles.subheadingContainer}>
          <Text style={styles.subheadingText}>
          {`מרחק: ${minDistance}`}
          </Text>
          <Text style={styles.subheadingText}>
          {`משך המסלול: ${travelTime}`}
          </Text>
        </View>
        <ScrollView style={styles.trackDetailContainer}>
          {directions.map((instruction, index) => (
            <Text key={index} style={styles.instructionText}>
              <Text style={styles.instructionStep}>{index + 1}. {instruction.split('.')[0]}</Text>
              <Text style={styles.instructionDetail}>{instruction.slice(instruction.indexOf('.') + 1)}</Text>
            </Text>
          ))}
            <TouchableOpacity
              onPress={navigateSmsScreen}
              style={styles.button}
            >
              <Text style={styles.buttonText2}>סיים ניווט</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>

      {showStreetView && (
        <>
          <WebView
            javaScriptEnabled={true}
            source ={{ uri: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewLat},${streetViewLng}&key=AIzaSyC2F7dlN17uOyRf3zrppyGUaHijaKIdzqE` }}
            style={styles.StreetView}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onLoadStart={() => console.log('WebView started loading')}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowStreetView(false)}
          >
            <Text style={styles.closeButtonText}>Close StreetView</Text>
          </TouchableOpacity>
        </>
      )}
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      {!showStreetView && (addCustomControls())}
    </View>
  );//end return statement
}//end SheltersNavReact function

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'stretch', 
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMapControlButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    padding: 10,
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
    zIndex: 1,
  },
  buttonText: {
    color: 'blue',

  },
  errorText: {
    color: 'red',
    fontSize: 16,
    margin: 10,
  },
  loadingIndicator: {
    position: 'absolute', 
    top: '50%', // Center it vertically
    left: '50%', // Center it horizontally
    zIndex: 1, // Make sure it's in front of map
    transform: [{ translateX: -25 }, { translateY: -25 }], // Offset for half the height and width of the indicator
  },
  StreetView: {
    position: 'absolute', 
    height: 300,
    width: 300,
    zIndex: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    padding: 10,
    zIndex: 4,
  },
  closeButtonText: {
    color: '#000',
  },
  directionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(251, 220, 106)',
    maxHeight: '40%',
    padding: 10,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 5,
  },

  highlightedText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16, // Adjust the font size as needed
    fontFamily: "Assistant_400Regular"
  },
  boldText: {
    fontFamily: "Assistant_700Bold",
  },
  // Style for the button
  button: {
    backgroundColor: 'black', // Gray background color
    borderRadius: 5,
    padding: 10,
    alignSelf: 'center', // Center the button horizontally
  },
  buttonText: {
    color: 'black', // Black text color
    fontFamily: 'Assistant_700Bold',
  },
  buttonText2: {
    color: 'white', // Black text color
    fontFamily: 'Assistant_700Bold',
  },
  mapContainer:{
    height: '70%'
  },
  routeDetailContainer: {
    height: '30%',
    backgroundColor:'rgb(251, 220, 106)',
    padding: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    fontFamily: 'Assistant_700Bold',
    height: '20%',
  },
  endpointName: {
    fontSize: 20,
    fontFamily: 'Assistant_700Bold',
  },
  icon: {
    marginLeft: 8, // Adjust this value to control the space between the text and the icon
  },
  subheadingContainer: {
    flexDirection: 'column',
    height: '20%',
    marginBottom: 10,
    marginRight: 20,


  },
  subheadingText: {
    fontSize: 14,
    fontFamily: 'Assistant_700Bold',
  },
  trackDetailContainer: {
    height: '60%',
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'right',
    fontFamily: 'Assistant_400Regular',
    marginRight: 20,
  },
  instructionStep: {
    textAlign: 'right',
   
  },
  instructionDetail: {
    textAlign: 'right',
    
  },
});

export default SheltersNavReact;