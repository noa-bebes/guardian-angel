// ------------------------------------------------------ file: ContactDetailsScreen.js -------------------------------------------- //
/*
Summary: 
This is step 2 (2/2) of the registration process.
On this screen, the user enters the contact information: name, phone number.
In a real live event, the user will be able to update the contacts about reaching a shelter, with the push of a button (smsScreen.js).

Functions:
1. "handleContactNameChange"- updates the name of a specific contact in the contacts array.
2. "handleContactPhoneNumberChange"- updates the phone number of a specific contact in the contacts array.
3. "validatePhoneNumber"- validates the phone number (9 digitis and starts with: 052/053/054/055)
4. "handleContinue"- Performs validations on data entered by the user in the various fields and save the user and its contacts in the db.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries and files
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ImageBackground, Platform, KeyboardAvoidingView } from 'react-native';
import { getDatabase, ref, push, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { app } from '../server';
import useCrossCheckScheduler from '../useCrossCheckScheduler'; // Importing the useCrossCheckScheduler hook
import CheckBox from 'expo-checkbox'; // Import CheckBox from expo-checkbox
import {
    useFonts,
    Assistant_400Regular,
    Assistant_700Bold,
} from '@expo-google-fonts/assistant';

// Main function
export default function ContactDetailsScreen({ route }) {

    // consts for: fonts ("assitant"), navigation, screen's name, db, username, age, email, contant's name , contant's phonenumber
    const currentScreenName = route.name;
    const navigation = useNavigation();
    const { username, age, email } = route.params;
    const db = getDatabase(app);
    const [contacts, setContacts] = useState([
        { name: '', phoneNumber: '' },
        { name: '', phoneNumber: '' },
        { name: '', phoneNumber: '' },
    ]);
    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });

    // State for checkbox
    const [isChecked, setIsChecked] = useState(false); // State for checkbox

    // call function "useCrossCheckScheduler" from "useCrossCheckScheduler.js"
    useCrossCheckScheduler(currentScreenName);

    // Function 1: "handleContactNameChange"
    const handleContactNameChange = (index, newName) => {
        // updating the contant's name
        const updatedContacts = [...contacts];
        updatedContacts[index].name = newName;
        setContacts(updatedContacts);
    };

    // Function 2: "handleContactPhoneNumberChange"
    const handleContactPhoneNumberChange = (index, newPhoneNumber) => {
        // updating the contant's phone number
        const updatedContacts = [...contacts];
        updatedContacts[index].phoneNumber = newPhoneNumber;
        setContacts(updatedContacts);
    };

    // Function 3: "validatePhoneNumber"
    const validatePhoneNumber = (phoneNumber) => {
        // validates the phone number (9 digitis and starts with: 052/053/054/055)
        const phoneRegex = /^05[2-5][0-9]{7}$/;
        return phoneRegex.test(phoneNumber);
    };

    // Function 4: "handleContinue"
    const handleContinue = async () => {

        // For all 3 contacts 
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];

            // check if the user entered "name", otherwise returns an alert 
            if (!contact.name.trim()) {
                alert('שים לב! עלייך להזין את שמו של איש הקשר');
                return;
            }

            // check if the user entered "phoneNumber", otherwise returns an alert
            if (!contact.phoneNumber.trim()) {
                alert('שים לב! עלייך להזין את מספר הטלפון של איש הקשר');
                return;
            }

            // check if the phone number is valid, otherwise returns an alert (call function "validatePhoneNumber")
            if (!validatePhoneNumber(contact.phoneNumber)) {
                alert('שים לב! מספר הטלפון שהוזן שגוי');
                return;
            }

            // check if the user entered difreent phonenumbers for contacts, otherwise returns an alert 
            for (let j = i + 1; j < contacts.length; j++) {
                if (contacts[j].phoneNumber === contact.phoneNumber) {
                    alert('שים לב! הזנת מספרי טלפון זהים עבור 2 אנשי קשר שונים');
                    return;
                }
            }
        }

        // check if user marked the checkbox, otherwise returns an alert 
        if (!isChecked) {
            alert('יש לאשר את תנאי השימוש');
            return;
        }

        // if all the fields pass the valdiations test, add the user and the contacts to the db
        try {
            // create const: newUserRef, userId, userData, contactsData
            const newUserRef = push(ref(db, 'users')); 
            const userId = newUserRef.key;
            const userData = {
                id: userId,
                username: username,
                age: age,
                email: email
            };
            const contactsData = contacts.map(contact => ({
                userId: userId,
                contactName: contact.name,
                phoneNumber: contact.phoneNumber
            }));

            // add the user to the db
            await set(newUserRef, userData);

            // add the contacts to the db
            const contactsRef = ref(db, 'contacts');
            await Promise.all(contactsData.map(contact => push(contactsRef, contact)));

            // Navigate to Home screen
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home', params: { user: userData } }],
                })
            );
            // if the registration process was succesful
            console.log('User data and contacts saved successfully');
        
        // if there was error in saving the data in the db
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    // Screen components
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ImageBackground source={require('../app/login_background.png')} style={styles.background}>
                <View style={styles.container}>
                    <Image source={require('../app/logo2.png')} style={styles.logo} />
                    <Text style={styles.title}>הרשמה</Text>
                    <Text style={styles.subtitle}> פרטי אנשי קשר</Text>
                    <Text style={styles.instructionsText}>אנא הזן את פרטי אנשי הקשר</Text>
                    <Text style={styles.instructionsText}>אותם תרצה לעדכן בשעת חירום</Text>
                    <View style={styles.miniContainer}>
                        {contacts.map((contact, index) => (
                            <View key={index} style={styles.contactRow}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={contact.phoneNumber}
                                        onChangeText={(newPhoneNumber) => handleContactPhoneNumberChange(index, newPhoneNumber)}
                                        placeholder="טלפון"
                                        placeholderTextColor="white"
                                        keyboardType="numeric"
                                        textAlign="right"
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={contact.name}
                                        onChangeText={(newName) => handleContactNameChange(index, newName)}
                                        placeholder="שם"
                                        placeholderTextColor="white"
                                        textAlign="right"
                                    />
                                </View>
                            </View>
                        ))}
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.checkboxLabel}>אני מאשר/ת את תנאי השימוש</Text>
                            <CheckBox
                                value={isChecked}
                                onValueChange={setIsChecked}
                                style={[styles.checkbox, isChecked ? styles.checkboxChecked : styles.checkboxUnchecked]}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <Text style={styles.buttonText}>סיום</Text>
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
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    miniContainer: {
        marginTop: 30, // added margin bottom for spacing
        marginBottom: 30,
        alignItems: 'center',
    },
    logo: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 60,
        height: 30,
    },
    title: {
        color: 'white',
        fontFamily: 'Assistant_700Bold',
        fontSize: 42, // increased font size
        marginTop: 110, // added margin bottom for spacing
        marginBottom: 10, // added margin bottom for spacing
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
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 10,
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 30, // Ensures the input containers are tall enough
    },
    input: {
        flex: 1,
        color: 'white',
        fontFamily: 'Assistant_400Regular',
        height: 30, // Ensures the input fields are tall enough
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        color: 'white',
        marginRight: 10, // Change margin to right to align properly
        fontFamily: 'Assistant_400Regular',
        fontSize: 16,

    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 3,
        borderWidth: 1,
    },
    checkboxUnchecked: {
        borderColor: 'white',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        borderColor: 'rgb(251, 220, 106)',
        backgroundColor: 'brown',
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