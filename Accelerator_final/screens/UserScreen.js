// ------------------------------------------------------ file: UserScreen.js --------------------------------------------- //
/*
Summary: 
This is step 1 (1/2) of the registration process.
On this screen the user enters personal details: name, age, email.
* Name + Email: will be used by the user when logging in (Login.js)
* Age: will be used by us for the purpose of creating content personalization (smsScreen.js)

Functions:
1. "checkEmailExists"- Checkes whether the email entered by the user already exists in the DB.
2. "handleContinue" - Performs validations on data entered by the user in the various fields.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries and files
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ImageBackground, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { app } from '../server';
import useCrossCheckScheduler from '../useCrossCheckScheduler'; // Importing the useCrossCheckScheduler hook
import {
    useFonts,
    Assistant_400Regular,
    Assistant_700Bold,
  } from '@expo-google-fonts/assistant';

// Main function
export default function UserScreen({ route }) {

    // consts for: fonts ("assitant"), navigation, screen's name, db, username, age, email
    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });
    const currentScreenName = route.name;
    const navigation = useNavigation();
    const db = getDatabase(app);
    const [username, setName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');

    // call function "useCrossCheckScheduler" from "useCrossCheckScheduler.js"
    useCrossCheckScheduler(currentScreenName);

    // Function 1: "checkEmailExists"
    const checkEmailExists = async (email) => {
        // Check if the email entered by the user already exists in the DB
        const usersRef = ref(db, 'users');
        const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(emailQuery);
        return snapshot.exists();
    };

    // Function 2: "handleContinue"
    const handleContinue = async () => {

        // check if the user entered "name", otherwise returns an alert
        if (!username.trim()) {
            alert('שים לב! השדה "שם" הינו שדה חובה.');
            return;
        }

        // check if the user entered "age", otherwise returns an alert
        if (!age.trim()) {
            alert('שים לב! השדה "גיל" הינו שדה חובה.');
            return;
        }

        // check if the user entered valid "age", otherwise returns an alert
        if (parseInt(age) < 12) {
            alert('שים לב! גיל חייב להיות מעל גיל  12');
            return;
        }

        // check if the user entered "email", otherwise returns an alert
        if (!email.trim()) {
            alert('שים לב! השדה "מייל" הינו שדה חובה.');
            return;
        }

        // check if the user entered valid "email", otherwise returns an alert
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('שים לב! הזנת מייל שגוי, אנא נסה שוב');
            return;
        }

        // check if the user entered new "email", otherwise returns an alert (call function "checkEmailExists")
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            alert('שים לב! המייל כבר קיים במערכת');
            return;
        }

        // if all fields passed the valdiations, navigate to the "ContactDetailsScreen.js" with the entered details
        navigation.navigate('ContactDetailsScreen', { username, age, email });
    };

    // Screen components
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ImageBackground source={require('../app/login_background.png')} style={styles.background}>
            <Image source={require('../app/logo2.png')} style={styles.logo} />
                <View style={styles.container}>
                    <Text style={styles.title}>הרשמה</Text>
                    <Text style={styles.subtitle}>פרטים אישיים</Text>
                    <Text style={styles.instructionsText}>ברוכים הבאים ל GuardianAngel!</Text>
                    <Text style={styles.instructionsText}>יש למלא את הפרטים הבאים על מנת להמשיך </Text>
                    <View style={styles.miniContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setName}
                                placeholder="שם"
                                placeholderTextColor="white"
                                textAlign="right"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                placeholder="גיל"
                                placeholderTextColor="white"
                                textAlign="right"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholder="מייל"
                                placeholderTextColor="white"
                                textAlign="right"
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <Text style={styles.buttonText}>המשך</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
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
        marginTop: 120,
    },
    logo: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 60,
        height: 30,
    },
    miniContainer: {
        marginTop: 30, 
        marginBottom: 30,
    },
    title: {
        color: 'white',
        fontFamily: 'Assistant_700Bold',
        fontSize: 42, 
        marginTop: -20, 
        marginBottom: 10, 
    },
    subtitle: {
        color: 'rgb(251, 220, 106)',
        fontFamily: 'Assistant_700Bold',
        fontSize: 20,
    },
    instructionsText: {
        color: 'white',
        fontFamily: 'Assistant_400Regular',
        fontSize: 18,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 30,
        color: 'white',
        fontFamily: 'Assistant_400Regular',

    },
    button: {
        backgroundColor: 'rgb(251, 220, 106)',
        paddingVertical: 10,
        paddingHorizontal: 65,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        fontFamily: 'Assistant_700Bold',
        color: 'black',
        fontSize: 16,
    },
});