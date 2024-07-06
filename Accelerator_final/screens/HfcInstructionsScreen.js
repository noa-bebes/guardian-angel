// ----------------------------------------------------------- file: HfcInstructionsScreen.js -------------------------------------------------------------- //
/*
Summary: 
This screen is responsible for displaying instructions from the Home Front Command.
The user reaches this screen if the following conditions have been met, during a real time event (from screen: SheltersNavReact.jsx):
1. The duration of the navigation to a protected space is greater than the duration of the defense (ie: the duration of the arrival
to the protected space is greater than a minute and a half).
2. The user chose to navigate to this screen, after clicking the "הנחיות פיקוד העורף" button upon receiving the notification.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries
import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Platform } from 'react-native';
import {
  useFonts,
  Assistant_400Regular,
  Assistant_700Bold,
} from '@expo-google-fonts/assistant';

// Main function
export default function HfcInstructions() {
  let [fontsLoaded] = useFonts({
    Assistant_400Regular,
    Assistant_700Bold,
  });

  // Guidelines (title+text+image X4)
  const guidelines = [
    {
      title: "במבנה",
      text: [
        "נכנסים למרחב המוגן",
        "סוגרים את החלונות",
        "נועלים את הדלת"
      ],
      image: require('../app/building.png')
    },
    {
      title: "בנסיעה",
      text: [
        "עוצרים בצד הדרך",
        "יוצאים מכלי הרכב",
        "אם לא ניתן מגוננים על הראש עם הידיים"
      ],
      image: require('../app/car.png')
    },
    {
      title: "בחוץ",
      text: [
        "בשטח בנוי נכנסים למבנה קרוב",
        "בשטח פתוח שוכבים על הקרקע ומגוננים על הראש עם הידיים"
      ],
      image: require('../app/outside.png')
    },
    {
      title: "בתחבורה ציבורית",
      text: [
        "באוטובוס עירוני יוצאים ונכנסים למבנה קרוב",
        "באוטובוס בין עירוני וברכבת מתכופפים מתחת לקו חלונות ומגוננים על הראש עם הידיים"
      ],
      image: require('../app/bus.png')
    }
  ];

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  // screen display
  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Image source={require('../app/logo2.png')} style={styles.logo} />
      <Text style={styles.title}>הנחיות פיקוד העורף</Text>
      <Text style={styles.explanationText}>
        בהישמע אזעקה יש להיכנס למרחב מוגן במסגרת הזמן שעומדת לרשותך ולפעול עפ"י ההנחיות הבאות
      </Text>
      <Text style={styles.importantText}>חשוב! יש להישאר במרחב המוגן 10 דקות.</Text>
      <View style={styles.guidelinesContainer}>
        {guidelines.map((item, index) => (
          <View key={index} style={styles.guideline}>
            <Text style={styles.guidelineTitle}>{item.title}</Text>
            <View style={styles.guidelineContentContainer}>
              <Image source={item.image} style={styles.sectionImage} />
              <View style={styles.textContainer}>
                {item.text.map((textItem, textIndex) => {
                  const firstWord = textItem.split(' ')[0];
                  const restOfSentence = textItem.substring(firstWord.length);
                  return (
                    <Text key={textIndex} style={styles.guidelineText}>
                      <Text style={styles.boldText}>{firstWord}</Text>
                      {restOfSentence}
                    </Text>
                  );
                })}
              </View>
            </View>
            {index < guidelines.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// style
const styles = StyleSheet.create({
  screenContainer: {
    flexGrow: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    width: 60,
    height: 30,
    position: 'absolute',
    left: 20, 
    top: Platform.OS === 'android' ? 20 : 30,
  },
  title: {
    color: 'white',
    fontFamily: 'Assistant_700Bold',
    fontSize: Platform.OS === 'android' ? 32 : 36,
    marginTop: 40, 
    textAlign: 'center',
    marginRight:Platform.OS === 'android' ? 10 : 0,
},
  explanationText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Assistant_400Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  importantText: {
    color: 'red',
    fontFamily: 'Assistant_400Regular',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 20,
  },
  guidelinesContainer: {
    marginTop: 40,
    width: '90%',
  },
  guideline: {
    marginBottom: 10,
  },
  guidelineTitle: {
    color: 'rgb(251, 220, 106)',
    fontSize: 20,
    fontFamily: 'Assistant_700Bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  guidelineContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  guidelineText: {
    color: 'white',
    fontFamily: 'Assistant_400Regular',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'right',
  },
  boldText: {
    fontWeight: 'bold',
  },
  sectionImage: {
    flex: 0.2,
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
});