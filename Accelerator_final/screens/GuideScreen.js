// ----------------------------------------------------------- file: GurdianAngelScreen.js -------------------------------------------------------------- //
/*
Summary: 
1. This screen provides guidelines for safety during rocket and missile alerts.
2. It includes collapsible sections with detailed instructions on how to act during different scenarios of missile attacks.
*/
// ---------------------------------------------------------------------------------------------------------------------------------------------- //

import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Animated, Easing, Platform } from 'react-native';
import { useFonts, Assistant_400Regular, Assistant_700Bold} from '@expo-google-fonts/assistant';

export default function GuideScreen() {

    const [fontsLoaded] = useFonts({
        Assistant_400Regular,
        Assistant_700Bold,
    });

    // State to manage collapsed sections
    const [collapsedSections, setCollapsedSections] = useState({
        section1: true,
        section2: true,
        section3: true,
        section4: true,
        section5: true,
        section6: true,
        section7: true,
        section8: true,
    });

    // Function to toggle section collapse/expand
    const toggleSection = (section) => {
        setCollapsedSections({
            ...collapsedSections,
            [section]: !collapsedSections[section],
        });
    };

    // Animation setup for rotating icons
    const rotateAnimation = new Animated.Value(0);

    // Function to rotate plus icon
    const rotatePlusIcon = () => {
        Animated.timing(rotateAnimation, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };

    // Function to rotate minus icon
    const rotateMinusIcon = () => {
        Animated.timing(rotateAnimation, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };

    // Interpolated animation value for rotation
    const spin = rotateAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    // Return null while waiting for fonts to load
    if (!fontsLoaded) {
        return null; 
    }

    return (
        <View style={styles.screenContainer}>
            <ScrollView style={styles.scrollView}>
                <Image source={require('../app/logo2.png')} style={styles.logo2} />
                <Text style={styles.Screen2Text}>הנחיות מצילות חיים</Text>

                <TouchableOpacity onPress={() => { toggleSection('section1'); collapsedSections.section1 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                            כיצד יש לפעול בעת קבלת התרעה על ירי רקטות וטילים?
                        </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section1 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section1 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                            בעת קבלת התרעה, יש להיכנס למרחב מוגן תוך פרק זמן העומד לרשותכם, ולשהות בו במשך 10 דקות.
                        </Text>
                    </View>
                )}

                <TouchableOpacity onPress={() => { toggleSection('section2'); collapsedSections.section2 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                            כיצד יש לנהוג בעת קבלת התרעה, אם המרחב המוגן שלנו הוא חדר מדרגות?
                        </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section2 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section2 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                            יש לשבת על גרם המדרגות ולא בחלל הקומה. בבניין מעל שלוש קומות - יש לשהות בגרם מדרגות שיש מעליו שתי קומות לפחות. בבניין מתחת לשלוש קומות - יש לשהות בגרם המדרגות של הקומה האמצעית.
                        </Text>
                    </View>
                )}

                <TouchableOpacity onPress={() => { toggleSection('section3'); collapsedSections.section3 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                            מה עלי לעשות בעת קבלת התרעה, אם אין לי ממ"ד או מקלט שניתן להגיע אליהם בזמן ההתגוננות העומד לרשותי, ואין בבית חדר ללא פתחים חיצוניים?
                        </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section3 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section3 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                            יש להיכנס לחדר פנימי עם כמה שפחות קירות חיצוניים, חלונות ופתחים, לשבת בצמוד לקיר פנימי מתחת לקו חלונות ולא מול הדלת. מטבח, מקלחת או שירותים אינם יכולים לשמש כחדר פנימי.
                        </Text>
                    </View>
                )}

                    <TouchableOpacity onPress={() => { toggleSection('section4'); collapsedSections.section4 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                        מה עליי לעשות בעת קבלת התרעה אם אני מתגורר בבית פרטי ישן ללא מקלט או ממ"ד?
                         </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section4 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section4 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                        בבתים ללא ממ"דים, מקלטים פרטיים או חדר מדרגות פנימי ללא קירות חיצוניים, חלונות ופתחים, יש להיכנס בעת קבלת התרעה לחדר פנימי בעל כמה שפחות קירות חיצוניים וחלונות, לשבת בצמוד לקיר פנימי, מתחת לקו חלונות ולא מול הדלת. מטבח, שירותים ומקלחת אינם יכולים לשמש כחדר פנימי.
                         </Text>
                    </View>
                )}

                <TouchableOpacity onPress={() => { toggleSection('section5'); collapsedSections.section5 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                        כיצד יש לנהוג אם מקבלים התרעה בעת שהייה במבנה בבנייה קלה?
                          </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section5 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section5 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                        אם מתקבלת התרעה בעת שהייה במבנה שאינו כולל תקרת בטון ו-4 קירות מבטון או מבלוקים, לרבות בנייה קלה, מבנה יביל, קרוואן ומבנה מגבס או מעץ, יש לצאת מהמבנה ולהיכנס למרחב מוגן בזמן ההתגוננות העומד לרשותנו. אם לא ניתן להיכנס למרחב מוגן בזמן ההתגוננות, יש לצאת מהמבנה, לשכב על הקרקע ולהגן על הראש באמצעות הידיים.                              </Text>
                    </View>
                )}

                <TouchableOpacity onPress={() => { toggleSection('section6'); collapsedSections.section6 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                        מה עלי לעשות אם מתקבלת התרעה בזמן אירוע רב משתתפים?  
                           </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section6 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section6 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                        אם מתקבלת התרעה בזמן אירוע רב משתתפים, באחריות המארגנים לעצור את האירוע מיד עם קבלת ההתרעה וליידע את הקהל. על כלל המשתתפים באירוע לשכב על הקרקע ולהגן על הראש באמצעות הידיים למשך 10 דקות. אם מתקבלת התרעה בזמן אירוע המתקיים בישיבה ואין אפשרות לשכב על הקרקע - יש להתכופף עד כמה שניתן כדי להנמיך את גובה הצללית של הגוף ולהגן עם הידיים על הראש. שימו לב - אין לרוץ למרחב מוגן מכיוון שריצה של כלל המשתתפים למרחב המוגן עלולה ליצור דוחק ועומס על דרכי היציאה, שעלול להוביל לרמיסה של אנשים ולפציעות.    
                        </Text>
                        </View>
                )}

                <TouchableOpacity onPress={() => { toggleSection('section7'); collapsedSections.section7 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                        מה צריך לעשות אם מזהים נפלים וחפצים בלתי מזוהים?                           </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0 }}>{collapsedSections.section7 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section7 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                        באזור בו נפלה רקטה או שבר יירוט, קיים חשש לנפלים שנשארו על הקרקע ולכן יש לנקוט במשנה זהירות. אם רואים נפלים או חפצים לא מזוהים - מתרחקים מהמקום, מרחיקים סקרנים ומדווחים למשטרת ישראל במוקד 100.                           
                        </Text>
                        </View>
                )}


                <TouchableOpacity onPress={() => { toggleSection('section8'); collapsedSections.section8 ? rotatePlusIcon() : rotateMinusIcon(); }}>
                    <View style={styles.collapseHeader}>
                        <Text style={styles.collapseHeaderText}>
                        מה עושים כשנמצאים בנסיעה במנהרה בזמן התרעה על ירי רקטות וטילים?
                       </Text>
                        <Animated.View style={[styles.collapsePlus, { transform: [{ rotate: spin }] }]}>
                            <Text style={{ color: 'rgb(251, 220, 106)', fontSize: 16, fontWeight: 'bold',bottom:Platform.OS === 'android' ? 3 : 0  }}>{collapsedSections.section8 ? '+' : '-'}</Text>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
                {!collapsedSections.section8 && (
                    <View style={styles.collapseContainer}>
                        <Text style={styles.collapseContent}>
                        בעת התרעה על ירי רקטות וטילים במהלך נסיעה במנהרה יש לעצור את הרכב בזהירות במפרץ הבטיחות ולהמתין בתוך הרכב עשר דקות מרגע הישמע ההתרעה.        
                        </Text>
                        </View>
                )}

            </ScrollView>
        </View>
    );
}

// style
const styles = StyleSheet.create({
    logo2: {
        position: 'absolute',
        width: 60,
        height: 30,
      },
    screenContainer: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
    },
    scrollView: {
        flex: 1,
    },
    Screen2Text: {
        fontFamily: 'Assistant_700Bold',
        color: 'white',
        fontSize: Platform.OS === 'android' ? 32 : 36,
        marginTop: 35,
        marginBottom: 20,
        textAlign: 'center',

    },
    collapseContent: {
        fontFamily: 'Assistant_400Regular',
        color: 'white',
        fontSize: Platform.OS === 'android' ? 14 :16,
        textAlign: 'right',
        lineHeight: 24,
    },
    collapseContainer: {
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 7,
        borderWidth: 1,
        borderColor: 'white', 
        padding: 7,
    },

    collapseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 15,
      paddingRight: 30,
    },
  collapseHeaderText: {
      flex: 1, 
      fontFamily: 'Assistant_700Bold',
      color: 'white',
      fontSize: Platform.OS === 'android' ? 16 : 18,
      textAlign: 'right',
      marginRight:7
  },
  collapsePlus: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    right: 3,
    top: 20,
    transform: [{ translateY: -10 }],
},
    
});



