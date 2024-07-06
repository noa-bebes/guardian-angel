// ----------------------------------------------------------- file: App.js -------------------------------------------------------------- //
/*
Summary: 
This file serves as the central hub for setting up the app's:
1. Navigation structure.
2. handling global state.
3. rendering the main components.
It sets up the necessary navigation and notification handling logic and provides a foundation for the rest of the app's functionality. 
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries
import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PushNote from './PushNote';
import * as Notifications from 'expo-notifications';

// Import app's screens
import WelcomeScreen from './screens/WelcomeScreen'; 
import HomeScreen from './screens/HomeScreen'; 
import SmsScreen from './screens/SmsScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import MapScreen from './screens/MapScreen';
import GuideScreen from './screens/GuideScreen';
import HfcInstructions from './screens/HfcInstructionsScreen';
import SheltersNavReact from './screens/SheltersNavReact';
import UserScreen from './screens/UserScreen'; 
import ContactDetailsScreen from './screens/ContactDetailsScreen'; 
import GurdianAngelScreen from './screens/GurdianAngelScreen'; 
// Creat "stack navigator"
// ("stack navigator": provides transition between screens where each new screen is placed on top of a stack.)
const Stack = createStackNavigator();

// Create the root component of the app
export default function App() {

  // Components
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [user, setUser] = useState(null);
  const navigationRef = useRef();

  // Setting up notification handling
  useEffect(() => {
    /* 
    listener for notification responses from "PushNote.js", get: 
    1. User's data
    2. The name of the screen to navigate to ("NewSheltersNavReact")
    */
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("Notification Data:", data); 
      const screen = data.screen;
      const userData = {
        username: data.username,
        age: data.age,
        email: data.email,
        id: data.id
      };
      // if the notification passed corectly the user's data and the screen's name, navigate there and pass the user's data
      if (screen && navigationRef.current) {
        console.log("Navigating to screen:", screen);
        console.log("This is user data:", userData);
        setUser(userData);
        navigationRef.current.navigate(screen, { user: userData });
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Defining the screen components: pecifies the name of the screen and the component to render for that screen.
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenListeners={{
          state: (e) => {
            const route = e.data.state.routes[e.data.state.index];
            setCurrentScreen(route.name);
          },
        }}
      >       
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login">
          {props => <LoginScreen {...props} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} user={user} />}
        </Stack.Screen>
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="SmsScreen" component={SmsScreen} />
        <Stack.Screen name="GuideScreen" component={GuideScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="NewShelterNavReact" component={SheltersNavReact} />
        <Stack.Screen name="HfcInstructions" component={HfcInstructions} />
        <Stack.Screen name="UserScreen" component={UserScreen} />
        <Stack.Screen name="ContactDetailsScreen" component={ContactDetailsScreen} />
        <Stack.Screen name="GurdianAngelScreen" component={GurdianAngelScreen} />
      </Stack.Navigator>
      <PushNote currentScreen={currentScreen} navigation={navigationRef.current} user={user}/>
    </NavigationContainer>
  );
}