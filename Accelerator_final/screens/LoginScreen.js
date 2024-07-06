// ------------------------------------------------------ file: LoginScreen.js ----------------------------------------------------- //
/*
Summary: 
This screen is a login screen for existing users.
On this screen the user enters the following details: Name, Email.

Functions:
1. "handleLogin": checks whether a user exists in the db and if so approves his entry into the app.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries and files
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import useCrossCheckScheduler from '../useCrossCheckScheduler'; 
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../server';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Assistant_400Regular,
  Assistant_700Bold,
} from '@expo-google-fonts/assistant';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync(); 

// Main function
export default function LoginScreen({ setUser, route }) {

    // consts for: fonts ("assitant"), navigation, screen's name, db, username, email
    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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

    // Function 1: "handleLogin"
    const handleLogin = async () => {

        // create a conection to the db
        const db = getDatabase(app);
        const usersRef = ref(db, 'users');

        try {
            // search the user in the db using the name and email the user provided
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                let userFound = false;
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    // if user found print its data to the console and pass its data to the "HomeScreen.js"
                    if (userData.username === name && userData.email === email) {
                        console.log('User found:', userData);
                        userFound = true;
                        setUser(userData);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home', params: { user: userData } }],
                        });
                        return true;
                    }
                });

                // if user wasnt found in the db, print an error
                if (!userFound) {
                    console.log('No user found');
                    alert('המשתמש לא קיים, אנא בדוק את הפרטים ונסה שוב.');
                }
            // if the db is empty
            } else {
                console.log('No user data found');
                alert('אין משתמשים במערכת');
            }
        // if exception accured, print error
        } catch (error) {
            console.error('Error retrieving user data:', error);
            alert('שגיאה בעת טעינת המשתמשים');
        }
    };

    // Return null while waiting for fonts to load
    if (!fontsLoaded) {
        return null; 
    }

    // Screen components
    return (
        <ImageBackground source={require('../app/login_background.png')} style={styles.background}>
        <Image source={require('../app/logo2.png')} style={styles.logo} />
            <View style={styles.container}>
                <Text style={styles.screenText}>התחברות</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="person" size={24} color="white" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder=" שם "
                        placeholderTextColor="white"
                        textAlign="right"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={24} color="white" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="  מייל"
                        placeholderTextColor="white"
                        textAlign="right"
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>אישור</Text> 
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('UserScreen')}>
                    <Text style={styles.registerLink}>
                        <Text style={styles.registerLinkWhite}>עדיין לא רשום? </Text>
                        <Text style={styles.registerLinkYellow}>לחץ כאן להרשמה</Text>
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
        marginTop: 60, // added margin bottom for spacing
    },
    logo: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 60,
        height: 30,
    },
    screenText: {
        color: 'white',
        fontFamily: 'Assistant_700Bold',
        fontSize: 42, // increased font size
        marginBottom: 30, // added margin bottom for spacing
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // 30% transparency
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        color: 'white',
    },
    button: {
        backgroundColor: 'rgb(251, 220, 106)', // same style as "הרשם" button
        paddingVertical: 10,
        paddingHorizontal: 65,
        borderRadius: 5,
        marginTop: 40, // added space between button and input fields
        marginBottom: 20,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Assistant_700Bold',
    },
    registerLink: {
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    registerLinkWhite: {
        color: 'white',
    },
    registerLinkYellow: {
        color: 'rgb(251, 220, 106)',
    },
});