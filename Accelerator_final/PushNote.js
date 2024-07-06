// ------------------------------------------------------ file: PushNotes.js ---------------------------------------------------- //
/*
Summary: 
This file handles push notifications and navigate to screen "SheltersNavReact.js"

Functions:
1. "registerForPushNotificationsAsync"- an asynchronous function that registers the device for push notifications and retrieves
the Expo push token.
2. "simulateEvent"- helps to simulate real live event.
3. "sendNotification"- send the notification useing Expo go services.
4. "checkCrossCheckData" - checks for a triger, and activate sendNotification if there is a triger.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries
import { useState, useEffect } from "react";
import {Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { printcrossCheckData } from './NotificationHandler'; // Example import statement

// Customize the behavior of notifications when they are received or interacted with.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// List of screens on which the test to check for a real event should not be performed.
const excludedScreens = ['Welcome', 'Login', 'UserScreen', 'ContactDetailsScreen'];

// Main function
export default function PushNote({ currentScreen, user, navigation }) {
  // Create use states
  const [expoPushToken, setExpoPushToken] = useState("");
  const [lastNotificationTime, setLastNotificationTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Create useEffect
  useEffect(() => {
    // call function: "registerForPushNotificationsAsync" 
    registerForPushNotificationsAsync()
      // "token": unique identifier assigned to a specific device or user by the push notification service provider.
      .then((token) => {
        console.log("Push Token:", token); 
        setExpoPushToken(token);
      })
      .catch((err) => console.log("Error registering for push notifications:", err));
    // sets up a listener for received notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received in foreground:", notification);
    });
    // if user opened the notification, delay the next one in 10 minutes  
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification clicked:", response);
      setLastNotificationTime(Date.now());
      setIsPaused(true);
      setTimeout(() => {
        setIsPaused(false);
      }, 60 * 30 * 1000); // Unpause after 30 seconds (60*30*1000 == 10 min)

      // recive user's data + screen name to navigatet to
      const data = response.notification.request.content.data;
      console.log("Notification Data:", data); 
      const screen = data.screen;
      const userData = {
        username: data.username,
        age: data.age,
        email: data.email,
        id: data.id
      };
      // if values are'nt empty navigate to screen "SheltersNavReact.jsx" and pass the user's data 
      if (screen && navigation) {
        console.log("Navigating to screen:", screen);
        console.log("This is user data:", userData);
        navigation.navigate(screen, { user: userData });
      }
    });
    // check again in 10 sec'.
    const intervalId = setInterval(() => {
      if (!excludedScreens.includes(currentScreen) && !isPaused) {
        checkCrossCheckData(currentScreen);
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      subscription.remove();
      responseSubscription.remove();
    };
  }, [currentScreen, isPaused]);

  // Function 1: "registerForPushNotificationsAsync"
  const registerForPushNotificationsAsync = async () => {
    
    // try to retrieve the Expo push token from AsyncStorage     
    let token = await AsyncStorage.getItem("expoPushToken");

    // If the token doesn't exist, proceeds to register the device for push notifications
    if (!token) {
      // for android we need to set a channel (to display notifications properly)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // if it's a physical device, check existing notification permissions
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        // save the existing permission status
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        // if the final status is "not granted" it means the user denied permission to send push notifications
        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }
        // else (final status is "granted"), retrieve the Expo push token 
        token = (await Notifications.getExpoPushTokenAsync()).data;
        await AsyncStorage.setItem("expoPushToken", token);
      // if the user uses device that is not a physical device (like emulator) send an error. 
      // Push notifications can only be tested on physical devices.
      } else {
        alert("Must use physical device for Push Notifications");
      }
    }
    return token;
  };

  // Function 2: "simulateEvent"
  const simulateEvent = () => {
    // create: event type + event area
    const type = "ירי רקטות וטילים"; 
    const area = "תל-אביב"; 
    // call function: "sendNotification"
    sendNotification(type, area);
  };

  // Function 3: "sendNotification"
  const sendNotification = async (type, area) => {
    // Ensure expoPushToken is available
    const token = await registerForPushNotificationsAsync();
    if (!token) {
      console.error("No expoPushToken available");
      return;
    }
    // create: user + message 
    const { username, age, email, id } = user;
    const message = {
      to: token, // Use the retrieved token
      sound: "default",
      title: "Alert Notification",
      body: `חשש ל${type} באיזור ${area}. בוא נתחיל בניווט למרחב המוגן`, 
      data: { screen: "NewShelterNavReact", username: username, age: age, email: email, id: id },
      ios: { _displayInForeground: true },
      android: { channelId: "default" },
    };
    console.log("Notification message:", message); // Log the notification message
  
    // Request to the Expo push notification service to send a push notification
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
      },
      body: JSON.stringify(message),
    });
  
    // Check the response from the Expo push notification service
    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to send notification:", data);
    } else {
      console.log("Notification sent successfully:", data);
    }
  };

  // Function 4: "checkCrossCheckData"
  const checkCrossCheckData = async (screen) => {
    try {
      // call function "printcrossCheckData" from "NotificationHandler.js"
      const crossCheckResult = await printcrossCheckData();

      // check for the triger. 
      // trigger = "true event" && screen.name!= ['Welcome', 'Login', 'UserScreen', 'ContactDetailsScreen'] 
      if (crossCheckResult === "No new events" && !excludedScreens.includes(screen)) { // No new events
        console.log("Current screen:", screen);

        // if triger accured, call function "simulateEvent" and activate sending notification
        simulateEvent();
      }
    } catch (error) {
      console.error("Error in checkCrossCheckData:", error);
    }
  };
  return null;
}