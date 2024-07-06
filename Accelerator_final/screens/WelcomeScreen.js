// ------------------------------------------------------ file: WelcomeScreen.js --------------------------------------------- //
/*
Summary: 
This file is the first screen the user sees when he first enters the app.
This screen allows the user to:
1. Register for the app - for new users.
2. Connect to the app - for existing users.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries and files
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useCrossCheckScheduler from '../useCrossCheckScheduler'; // Importing the useCrossCheckScheduler hook
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Assistant_400Regular,
  Assistant_700Bold,
} from '@expo-google-fonts/assistant';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Main function
export default function WelcomeScreen({ route }) {

    // consts for: fonts ("assitant"), navigation, screen's name
    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });
    const navigation = useNavigation();
    const currentScreenName = route.name;

    // call function "useCrossCheckScheduler" from "useCrossCheckScheduler.js"
    useCrossCheckScheduler(currentScreenName);

    // Hide the splash screen once fonts are loaded
    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync(); 
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Return null while waiting for fonts to load
    }

    // Screen components
    return (
        <ImageBackground source={require('../app/welcome_background.png')} style={styles.background}>
            <View style={styles.container}>
                <Image source={require('../app/logo2.png')} style={styles.logo} />
                <Text style={styles.welcomeText}>ברוכים הבאים</Text>
                <Text style={styles.title}>GuardianAngel</Text>
                <Text style={styles.subtitle}>אפליקציית ביטחון אישי במרחב הציבורי</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserScreen')}>
                    <Text style={styles.buttonText}>הרשם</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>
                        <Text style={styles.loginLinkWhite}>כבר יש לך משתמש? </Text>
                        <Text style={styles.loginLinkYellow}>התחבר</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

// Screen style
const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Platform.OS === 'ios' ? 20 : 15,
        position: 'relative',
    },
    logo: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 60,
        height: 30,
    },
    welcomeText: {
        fontFamily: 'Assistant_700Bold',
        color: 'white',
        fontSize: 42,
        marginBottom: 0,
    },
    title: {
        fontFamily: 'Assistant_700Bold',
        color: 'rgb(251, 220, 106)',
        fontSize: 42,
        marginTop: -10,
    },
    subtitle: {
        fontFamily: 'Assistant_400Regular',
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 40,
        marginTop: 15,
    },
    button: {
        backgroundColor: 'rgb(251, 220, 106)',
        paddingVertical: 10,
        paddingHorizontal: 65,
        borderRadius: 5,
        marginBottom: 20,
        marginTop: 30,
    },
    buttonText: {
        fontFamily: 'Assistant_700Bold',
        color: 'black',
        fontSize: 16,
    },
    loginLink: {
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    loginLinkWhite: {
        color: 'white',
    },
    loginLinkYellow: {
        color: 'rgb(251, 220, 106)',
    },
});