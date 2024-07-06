// ------------------------------------------------------ file: NotificationJandler.js --------------------------------------------- //
/*
Summary: 
This file fetch and compare the user's current location with the last alert data from HomeFront command ("server_hc.js").

Functions:
1. "getCurrentLocation"- recive user's current location + timestamp.
2. "getLastAlert"- recive the last alert data from HomeFront command("server_hc.js").
3. "crossCheckData"- compate the user's location and time with the last alert data and determines the current status.
4. "printData"- prints to the console: user's corrent Location, last alert info, status.
5. "printcrossCheckData"- prints to the console: status.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries
import * as Location from 'expo-location';
import axios from 'axios';

// Create API component
const ALERTS_API_URL = 'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json';

// Function 1: "getCurrentLocation" 
export const getCurrentLocation = async () => {
  try {
    // Check if location services are enabled
    const isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
    // if location services are enabled print to the console error
    if (!isLocationServicesEnabled) {
      console.log('Location services are disabled. Please enable them to get your location.');
      return null;
    }
    // Else, request permissions for location services
    const { status } = await Location.requestForegroundPermissionsAsync();
    // if permissions for location services wasnt granted print to the console error
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }
    // Else, get the current location
    const location = await Location.getCurrentPositionAsync({});
    const [reverseGeocode] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode) {
      // Generate current timestamp in ISO format
      const currentTimestamp = new Date().toISOString();
      // return: location(latitude, longitude) + city + country + timestamp
      return {
        exactLocation: location,
        city: reverseGeocode.city,
        country: reverseGeocode.country,
        timestamp: currentTimestamp,
      };
    }
    return null;
  // if exception accured return error
  } catch (error) {
    console.error('Error fetching current location:', error);
    return null;
  }
};

// Function 2: "getLastAlert"
export const getLastAlert = async () => {
  try {
    // retrive the last alert (within 24 hours)
    const response = await axios.get(ALERTS_API_URL);
    const data = response.data;
    if (data && data.length > 0) {
      const lastAlert = data[0];
      return {
        timestamp: lastAlert.alertDate,
        eventType: lastAlert.title,
        area: lastAlert.data
      };
    }
  // if exception accured, return error
  } catch (error) {
    console.error('Error fetching last alert:', error);
    return null;
  }
  return null;
};

// Function 3: "crossCheckData"
export const crossCheckData = async () => {
  try {
    // call functions: "getCurrentLocation", "getLastAlert"
    const currentLocation = await getCurrentLocation();
    const lastAlert = await getLastAlert();

    // if values arent empty
    if (currentLocation && lastAlert) {
      // check if the last alert is in the user's current city
      const isSpaceMatch = currentLocation.city === lastAlert.area;
      // check the user's timestemp
      const currentTime = new Date(currentLocation.timestamp);
      // check the the last alert;s timestamp
      const alertTime = new Date(lastAlert.timestamp);
      // find if currentTime == alertTime by difference (if difference == 0 it means there is a live event)
      const timeDifference = Math.abs(currentTime.getTime() - alertTime.getTime()) / 60000; // Difference in minutes

      // "True Alert": time and space are matched 
      if (isSpaceMatch && timeDifference <= 0.5) {
        return 'True alert!';
      // "Prev Event, User location": the last event was in user's location, but there is no live event (only space matched)
      } else if (isSpaceMatch && timeDifference > 0.5) {
        return 'There are no new events in your current location only';
      // "Live event": there is a True Alert but not in the user's current location (only time matched)
      } else if (!isSpaceMatch && timeDifference <= 0.5) {
        return 'There is a new alert but not in your current location';
      // "No new event": time and space arent matched 
      } else {
        return 'No new events';
      }
    // if one of the values is empty, return error
    } else {
      return 'Unable to fetch current location or last alert data';
    }
  // if exception accured, return error
  } catch (error) {
    console.error('Error in crossCheckData:', error);
    return 'Error in cross-checking data';
  }
};

// Function 4: "printData"
export const printData = async () => {
  try {
    // call functions: "etCurrentLocation", "getLastAlert", "crossCheckData"
    const currentLocation = await getCurrentLocation();
    const lastAlert = await getLastAlert();
    const crossCheckResult = await crossCheckData();

    // print to the console: User Corrent Location, Last Alert info, Cross-Check Status
    console.log('-'.repeat(140));
    console.log('Important info:');
    console.log('1. User Corrent Location');
    console.log('2. Last Alert info');
    console.log('3. Cross-Check Status');
    console.log('\n');
    console.log('### User Current Location (Exact Location, City, Country, timestemp): ###');
    console.log(currentLocation);
    console.log('\n');
    console.log('### Last Alert: ###');
    console.log(lastAlert);
    console.log('\n');
    console.log('### Cross-Check Status: ###');
    console.log(crossCheckResult);
    console.log('-'.repeat(140));
  } catch (error) {
    console.error('Error in printData:', error);
  }
};

// Function 5: "printcrossCheckData"
export const printcrossCheckData = async () => {
  try {
    // call function: "crossCheckData"
    const crossCheckResult = await crossCheckData();
    // print to the console Cross-Check Status (Log the crossCheckResult regardless of its value)
    console.log('### Printing only Cross-Check Status: ###');
    console.log(crossCheckResult);
    // return the value of crossCheckResult
    return crossCheckResult; // Return the value of crossCheckResult
  } catch (error) {
    console.error('Error in printData:', error);
    throw error; 
  }
};