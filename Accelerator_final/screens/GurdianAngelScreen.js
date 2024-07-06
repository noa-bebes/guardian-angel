// ----------------------------------------------------------- file: GurdianAngelScreen.js -------------------------------------------------------------- //
/*
Summary: 
This file defines the Gurdian Angel screen, which provides information about the application, including:
1. An introduction to Gurdian Angel.
2. The story behind the app's creation.
3. The app's goals and objectives.
4. Information about the team members.
*/
// -------------------------------------------------------------------------------------------------------------------------------------------- //

import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, FlatList, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { useFonts, Assistant_400Regular, Assistant_700Bold } from '@expo-google-fonts/assistant';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const teamMembers = [
    { id: '1', name: 'תקוה מקונן', age: 27, location: 'בת ים', image: require('../app/tikva.png'), linkedin: 'https://www.linkedin.com/in/tikvamec/' },
    { id: '2', name: 'נעה בבס', age: 25, location: 'תל אביב', image: require('../app/noa.png'), linkedin: 'https://www.linkedin.com/in/noa-bebes-80791624b/' },
    { id: '3', name: 'יואב גולדהרן', age: 30, location: 'יד חנה', image: require('../app/yoav.png'), linkedin: 'https://www.linkedin.com/in/yoav-goldhorn/' },
    { id: '4', name: 'עדי רון', age: 24, location: 'מונוסון', image: require('../app/adi.png'), linkedin: 'https://www.linkedin.com/in/adi-ron-9ab775282/' },
];

const TeamMemberCard = ({ member, isFirst, isLast }) => (
    <TouchableOpacity style={styles.card} onPress={() => Linking.openURL(member.linkedin)}>
        {!isLast && <Ionicons name="arrow-back-circle" size={24} color="black" style={styles.prevIcon} />}
        <View style={styles.imgContainer}>
            <Image source={member.image} style={styles.img} />
        </View>
        <View style={styles.nameContainer}>
            <Text style={styles.rectangleText}>{member.name}</Text>
        </View>
        <View style={styles.detailsContainer}>
            <Text style={styles.rectangleText2}>{member.age}, {member.location}</Text>
        </View>
        {!isFirst && <Ionicons name="arrow-forward-circle" size={24} color="black" style={styles.nextIcon} />}
    </TouchableOpacity>
);

export default function GurdianAngelScreen() {
    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });

    // Return null while waiting for fonts to load
    if (!fontsLoaded) {
        return null;
    }

    const renderItem = ({ item, index }) => (
        <TeamMemberCard
            member={item}
            isFirst={index === 0}
            isLast={index === teamMembers.length - 1}
        />
    );

    return (
        <View style={styles.screenContainer}>
            <ScrollView style={styles.scrollView}>
                {/* Logo */}
                <Image source={require('../app/logo2.png')} style={styles.logo2} />
                
                {/* Main Title */}
                <Text style={styles.title}>אודות Gurdian Angel</Text>
                
                {/* Introduction Text */}
                <Text style={styles.Text}>
                    שמחים שבחרתם להצטרף ל Gurdian Angel- אפליקצית ביטחון אישי במרחב הציבורי!
                </Text>
                
                {/* Our Story Section */}
                <Text style={styles.title2}>הסיפור שלנו</Text>
                <Text style={styles.Text}>
                    בעקבות אירועי ה-7 באוקטובר, התעורר בנו הצורך לקיים שגרה תחת מלחמה ואי ודאות. מתוך חשש לשגרה היומיומית, החלטנו לפתח את Gurdian Angel – אפליקציה שמטרתה לספק לכם תחושת ביטחון ושלווה בכל מקום ובכל זמן.
                </Text>
                
                {/* Our Goal Section */}
                <Text style={styles.title2}>המטרה שלנו</Text>
                <Text style={styles.Text}>
                    המטרה שלנו היא להעניק לכם כלים וטכנולוגיות מתקדמות שיעזרו לשמור על ביטחונכם האישי במרחב הציבורי. אנו מחויבים להמשיך לפתח ולשפר את האפליקציה על מנת להתמודד עם אתגרים חדשים ולענות על הצרכים שלכם.
                </Text>
                
                {/* Team Members Section */}
                <Text style={styles.title2}>חברי הצוות</Text>
                <FlatList
                    data={teamMembers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    inverted 
                    style={{ marginVertical: 20 }}
                />
            </ScrollView>
        </View>
    );
}

// style
const styles = StyleSheet.create({
    logo2: {
        width: 60,
        height: 30,
        position: 'absolute',
        top: Platform.OS === 'android' ? 20 : 30,
        left: 20, 
    },
    screenContainer: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Assistant_700Bold',
        color: 'white',
        fontSize: Platform.OS === 'android' ? 32 : 36,
        marginTop: 60, 
        marginBottom: 20,
        textAlign: 'center',
    },
    title2: {
        color: 'rgb(251, 220, 106)',
        fontFamily: 'Assistant_700Bold',
        fontSize: 20,
        marginTop: 20,
        textAlign: 'center',
    },
    textContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        flex: 1,
    },
    card: {
        backgroundColor: 'rgb(251, 220, 106)',
        borderRadius: 7,
        width: Dimensions.get('window').width - 100, // slightly smaller than screen width
        margin: 10,
        padding: 10,
        flexDirection: 'column', // Change layout to column
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgContainer: {
        flex: 7, // 70% of the card height
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    nameContainer: {
        flex: 2, // 20% of the card height
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    detailsContainer: {
        flex: 1, // 10% of the card height
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    img: {
        resizeMode: 'contain', // Adjust the image to cover the container
        width: 80, // Adjust this value to make the image smaller
        height: 80, // Adjust this value to make the image smaller
    },
    rectangleText: {
        color: 'black',
        fontSize: 18,
        fontFamily: 'Assistant_700Bold',
        textAlign: 'center',
    },
    rectangleText2: {
        color: 'black',
        fontSize: 18,
        fontFamily: 'Assistant_400Regular',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    Text: {
        color: 'white',
        fontFamily: 'Assistant_400Regular',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        marginHorizontal: 10,
    },
    prevIcon: {
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    nextIcon: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
});