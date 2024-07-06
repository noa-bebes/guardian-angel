
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, StyleSheet, Alert,Platform } from 'react-native';
import { StackActions, CommonActions } from '@react-navigation/native';
import { printData } from '../NotificationHandler';
import useCrossCheckScheduler from '../useCrossCheckScheduler'; // Importing the useCrossCheckScheduler hook
import PushNote from '../PushNote'; // Import PushNote
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation, route }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = route.params;

  // Use the useCrossCheckScheduler hook unconditionally
  useCrossCheckScheduler(navigation);
  
  useEffect(() => {
    if (!user) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } else {
      printData();
    }
  }, [user]);

  const handleMenuItemPress = (screenName) => {
    if (screenName === 'MapScreen' || screenName === 'NotificationsScreen' || screenName === 'GuideScreen' 
    || screenName === 'LocationScreen' || screenName === 'GurdianAngelScreen' ) {
      navigation.navigate(screenName);
    } else if (screenName === 'NewShelterNavReact') {
      // Pass the user data received from the LoginScreen directly to the smsScreen
      navigation.navigate(screenName, { user });
    }
    setMenuVisible(false); // Close menu after navigation
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleSignOut = () => {
    Alert.alert(
      'יש ללחוץ על כפתור אישור על מנת לצאת מהאפליקציה',
      '',
      [
        { text: 'ביטול', onPress: () => console.log('Canceled') },
        { text: 'אישור', onPress: () => signOut() },
      ],
      { cancelable: false },
    );
  };

  const signOut = () => {
    navigation.dispatch(StackActions.replace('Login')); // Navigate to the Login screen
  };

  return (
    <ImageBackground source={require('../app/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../app/logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Text style={styles.menuButtonText}>תפריט</Text>
          <Image source={require('../app/menu_Vector.png')} style={styles.menuVendorImage} />
        </TouchableOpacity>
        {menuVisible && (
          <View style={styles.dropdownMenu}>
          
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('NewShelterNavReact')}>
              <Text style={styles.menuItemText}>ניווט חי</Text>
              <Ionicons name="navigate-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('MapScreen')}>
              <Text style={styles.menuItemText}>מפת ממ"דים</Text>
              <Ionicons name="map-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('NotificationsScreen')}>
              <Text style={styles.menuItemText}>התרעות ועדכונים</Text>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('GuideScreen')}>
              <Text style={styles.menuItemText}> הנחיות מצילות חיים</Text>
              <Image source={require('../app/guide_Vector.png')} style={styles.menuVendorImage2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('GurdianAngelScreen')}>
              <Text style={styles.menuItemText}>אודות </Text>
              <Image source={require('../app/angel.png')} style={styles.menuVendorImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <Text style={styles.menuItemText}>התנתק</Text>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
         <PushNote currentScreen={route.name} navigation={navigation} user={user} /> 
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: Platform.OS === 'android' ? 340: 370,
    height: Platform.OS === 'android' ? 35: 40,
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 100, 
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    right: 20, 
    flexDirection: 'row',
    alignItems: 'center',
    width:Platform.OS === 'android' ? 320: 350,
    justifyContent: 'flex-end',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'android' ? 18: 20,
    textAlign: 'right',
    marginLeft: 10, 
    marginRight: 10,
    fontFamily: 'Assistant_700Bold',

  },
  menuVendorImage: {
    width: 20,
    height: 20,
    marginRight: 3
  },

  menuVendorImage2: {
    width: 17,
    height: 20,
    marginRight: 3
  },
  dropdownMenu: {
    position: 'absolute',
    top: 150, 
    right: 20, 
    backgroundColor: 'black',
    borderRadius: 10,
    elevation: 5, 
    zIndex: 2, 
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    right: -10, 
    flexDirection: 'row',
    alignItems: 'center',
    width:Platform.OS === 'android' ? 320: 350,
    justifyContent: 'flex-end', 
  },
  menuItemText: {
    color: '#fff',
    fontSize: Platform.OS === 'android' ? 18: 20,
    textAlign: 'right',
    paddingRight: 10,
    fontFamily: 'Assistant_400Regular',
  },
});