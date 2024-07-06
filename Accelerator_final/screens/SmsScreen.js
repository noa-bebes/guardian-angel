// ------------------------------------------------------ file: smsScreen.js ----------------------------------------------------- //
/*
Summary: 
This is the receiver standby screen. This screen allows the user to:
1. Send an SMS to the contacts he defined during registration, in order to inform them that he has arrived at the shelter
2. Enjoy personalized content while waiting at the shelter

Functions:
1. "handleOkayPress"- handels sending sms messages to user's contacts
2. "CheckboxExample" - a functional component that renders content in a few categorized checkboxes based on the user's age
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries and files
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Image, ScrollView,Platform } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../server';
import * as SMS from 'expo-sms';
import useCrossCheckScheduler from '../useCrossCheckScheduler'; // Importing the useCrossCheckScheduler hook
import * as SplashScreen from 'expo-splash-screen';
import Checkbox from 'expo-checkbox';
import {
  useFonts,
  Assistant_400Regular,
  Assistant_700Bold,
} from '@expo-google-fonts/assistant';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync(); 

// Main function
export default function SmsScreen({ navigation, route }) {
  // consts for: fonts ("assistant"), navigation, db, user
  const user = route.params?.user;
  const [fontsLoaded] = useFonts({
    Assistant_400Regular,
    Assistant_700Bold,
  });

  // Check if user data is available
  if (!user) {
    console.error("User data is missing");
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.Screen2Text}>משתמש לא זוהה</Text>
      </View>
    );
  }
  const db = getDatabase(app);

  // call function "useCrossCheckScheduler" from "useCrossCheckScheduler.js"
  useCrossCheckScheduler(navigation);

  // Function 1: "handleOkayPress"
  const handleOkayPress = async () => {
    try {
      // search for user in DB
      const userId = user.id;
      const userRef = ref(db, `users`);
      const userSnapshot = await get(userRef);
      let userData = null;

      // if user exist in the DB, print to the console its data
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
        console.log("User data:", userData);

      // if user data is NOT found: print error message to the console and exit the function ("handleOkayPress")
      } else {
        console.log("User data not found");
        return; 
      }

      // if user exist, check for its contacts
      const contactsRef = ref(db, 'contacts');
      const contactsSnapshot = await get(contactsRef);
      let userContactsData = [];

      // if they exist: send them a message + print the contact's data to the console
      if (contactsSnapshot.exists()) {
        contactsSnapshot.forEach((childSnapshot) => {
          const contact = childSnapshot.val();
          if (contact.userId === userId) {
            userContactsData.push(contact);
          }
        });
        console.log("User contacts:", userContactsData);

      // if they DONT exist: print error message to the console and exit the function ("handleOkayPress")
      } else {
        console.log("Contacts data not found");
        return; 
      }

      // combine all phone numbers into one string, and print all phone numbers 
      const recipients = userContactsData.map(contact => contact.phoneNumber).join(',');
      console.log("Recipients:", recipients);

      // send SMS to all contacts
      const message = "היי, הייתה עכשיו אזעקה אבל אני בסדר, הגעתי למרחב מוגן";
      const { result } = await SMS.sendSMSAsync(recipients, message);
      console.log(`Result for sending SMS: ${result}`);

      // Note- in android result is always "unknown"
      if (result === 'unknown' || result === 'sent') {
        console.log(`SMS sent to all contacts: ${recipients}: ${message}`);
      } else {
        console.log(`Error sending SMS to all contacts`);
      }
    
    // if exception occurs
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  // Screen components
  return (
    <View style={styles.screenContainer}>
        <ScrollView style={styles.scrollView}>
    <Image source={require('../app/logo2.png')} style={styles.logo2} />
      <Text style={styles.title}>שהייה במרחב המוגן</Text>
      <Text style={styles.instructionsText}>
      שמחים שהגעת למרחב מוגן!{'\n'}
      עפ"י הנחיות פיקוד העורף יש להמתין במשך 10 דקות במרחב המוגן.{'\n'}
      בנוסף, לנוחיותך ובכדי להעביר את הזמן, מצורפים תכנים מותאמים אישית.{'\n'}
      <Text>
        <Text style={{ fontFamily: 'Assistant_700Bold', color: 'red' }}>רק לא לשכוח! </Text>!
        עדכן את הקרובים אלייך שהגעת למרחב מוגן, הם ישמחו לדעת שהגעת למרחב מוגן בבטחה
      </Text>
    </Text>
      <Text style={styles.subtitle}> שליחת SMS </Text>
      <Text style={styles.instructionsText}> לשליחת הודעת 'אני בסדר' לחץ כאן:</Text>
      <TouchableOpacity onPress={handleOkayPress} style={styles.button}>
        <Text style={styles.buttonText}>אישור</Text>
      </TouchableOpacity>

      <CheckboxComp user={user} />
</ScrollView>
    </View>
  );

}

// Checkbox component
function CheckboxComp({ user }) {
  const [checkedItem, setCheckedItem] = useState(null);
  const userAge = user.age; // Assuming user object contains age field

  // Define content for each category based on user's age
  const contentByCategory = {
    fashion: {
    young: [
      'אמש הגיעו חגיגיים ויפים עומר אדם ויעל שלביה לבית הנשיא בגרוז. הזמר האהוב קיבל את הכבוד וההוקרה עבור תרומתו הנדיבה למען החיילים בחודשי המלחמה האחרונים. בשל כך הוחלט להעניק לו את פרס ירושלים לאחדות ישראל מנשיא המדינה יצחק (בוזי) הרצוג. מעבר לנוכחותו של עומר, הוענקו פרסים ותעודות הוקרה לאמנים נוספים שהיו חלק מהמערך הציבורי התומך לאחרונה וביניהם נוכחת נוספת שהגיעה להרים לבויפרנד - יעל שלביה. באווירת שבועות מופלאה, הגיעה הדוגמנית למחיאות כפיים וצילומים רשמיים לצד הנשיא ורעייתו מיכל, תוך כדי שהיא מעלה סטוריז של בת זוג גאה, ובצדק. בסטיילינג של דניאלה קפלוטו, נבחרה עבורה שמלת מקסי לבנה, מאוד מכבדת וצנועה בחזית הצוואר ובשרווליה הארוכים, כשמאחורה מסתתר לו מחשוף גב רחב ומפולפל.',
      'ללא פאה או תוספות: את ריהאנה עוד לא ראינו ככה, וראינו בכל שנות הקריירה שלה, בין אם המוזיקלית ובין אם העסקית, הצליחה ריהאנה להתנסות כמעט בכל תספורת אפשרית. היא הוכיחה כל פעם מחדש שגם תלתלי יזהר כהן, מוהיקן או גילוח חצי ראש יכולים להפוך לבסטיז של אישה, כל עוד יש לה את הבטחון המלא ללכת על זה בכל הכוח. בשבוע שעבר חשפה ריהאנה אתFenty Hair-  קו המוצרים החדש שלה לשיער וכפרזנטורית מובילה של עסקיה החליטה הזמרת, אשת העסקים והמאמא בת ה-36 לאמץ לוק חדש-ישן. אתמול התרוצצה לה סולו ברחבי הביג אפל, בעודה מרגשת (ומעצבנת) את המעריצים כשהיא מציגה את שיערה הטבעי ובאופן נדיר - ללא תוספות או פאה.',
      'כמו באייטיז, אבל עם האפקט ההפוך: המסקרה החומה חזרה למדפים הפעם בחרנו רק מוצרים שהרימו לנו במיוחד, ככה רגע לפני החג: שפתון מושלם, מוצרי שיער מוצלחים במחיר נגיש, קונסילר מצטיין, בושם לחלוק בזוג ומסקרה קצת אחרת כבר עפנו כאן לא מעט על הבלאק האני המיתולוגי של קליניק שמצליח בדרך פלא להתאים לכל גוון עור, נראה מעולה בכל תאורה ועתיר לחות. הגרסה הקיצית החדשה שלו עושה את אותו הדבר בדיוק, רק בורדרד נעים, בריא ומשמח שלא יורד לנו מהשפתיים. קליניק, Pink Honey - 119 שקלים. המסקרה המעולה של MAC מגיעה הקיץ בצבע חום ערמוני, מוצר מתבקש למי שטורחות על נו-מייקאפ מייקאפ. כל מי שנשמה פה אוויר כבר בשנות ה-90 זוכרת בחלחלה את המסקרות הצבעוניות של התקופה, רק שהפעם מדובר באפקט ההפוך: יותר מעודן ורך מהמסקרות השחורות, פחות דרמטי, ויתאים במיוחד לבהירות אבל לא רק. כל יתר הפיצרים נשארו בדיוק כמו במוצר המקורי - מברשת מצוינת, ופורמולה נטולת גושים שלא מתפוררת. מאק, MACSTACK מסקרה חומה - 150 שקלים.',
    ],
    old: [
      'הטיקטוק משקשק: דמי מור מתנסה בטרנד הויראלי בביקיני מנומר. דמי מור ממשיכה להוכיח שעדיין יש לה את זה. השחקנית בת ה-61 לא חוששת להתהדר בפיגורה דקיקה ולהניח עליה שלל גזרות ביקיני קטנטנות. היא מעולם לא נמנעה מלהשוויץ (ובצדק) בתמונות חוף או חוויות מחופשות שונות ברשתות החברתיות. והיא חזרה לעשות זאת בחופשה המשפחתית האחרונה, כזו שדיווחה עליה בסרטון וקיישן מתוק, תחת הכיתוב: "כיף משפחתי בשמש!". מור ומשפחתה - בנותיה ונכדתה, ניסו את טרנד הטיקטוק האחרון בו משתתפי הסרטון "קופצים" מתוך הבית לצד השני של המסך, צד החוף החולי, הלבן והבוהק - זאת כמובן הודות לטריקי עריכה. בסרטון נראית השחקנית ההורסת פותחת את הפריים כשהיא לובשת מכנסיי קרגו לבנים וגופיית סבא תואמת ופשוטה, ולאחר מכן נראית בסט שני חלקים בהדפס מנומר, בעודה נכנסת לדמות הויראלית שאימצה.',
      'את חודש מאי 2023 נטלי פורטמן לעד תזכור כתקופה בה דלפו שמועות על בגידה מצד בעלה, הרקדן והכוריאוגרף בנגמין מילפייה, שהובילו מהר מאוד להפרדת כוחות שהסתיימו בגירושין. מאז, זוכת האוסקר נותרה שקטה למדי בכל הנוגע למצב המשפחתי, מלבד כמה פרטים מינימליים אך גלויי לב על מתקפת סיקור הפרידה המתוקשרת - כחלק מראיון נלווה לשער שלה במגזין Vanity Fair. עכשיו, כשהיא כבר לגמרי חזרה לשוק בתור אחת הרווקות הטריות והמבוקשות של התעשייה ההוליוודית, השחקנית הישראלית עושה את המהלך הנקמני, החם והידוע בספר - לוק נקמה. כי אם זו לא נקמה, אז מה כן תגידו?! פורטמן בחרה בפרשנות משלה ללבוש שיגרום לאקס הבוגדני להתחרט ולאכול את עצמו על מעשיו',
    'הברבי הנצחית של המגרשים: לנה גרקה כבר מוכנה ליורו. ואתן? היציעים הגדולים בעולם הם (גם) המקום שבו אופנה וכדורגל נפגשים, או לפחות מתנגשים. אבל מעטות הפעמים שאנחנו נתקלות באושיית רשת, טלוויזיה ואופנה שעל אף שאיננה ספורטאית בעצמה, הצליחה להפוך את ענף הספורט הפופולרי לחלק מהדי אן איי שלה ומהייחודיות שלה בתוך בליל שבעיקרו עוד מאותו הדבר. כשטורניר היורו 2024 ממש מעבר לפינה (שישי הקרוב ליתר דיוק), ומשהפעם גרמניה מארחת לבדה את חגיגת הכדורגל הגדולה של אירופה - זה הזמן להכיר את: לנה גרק, דוגמנית ומנחת טלוויזיה גרמניה שהיא התגלמות הסטייל על המגרשים ומחוצה להם.'
    ],
  },
  sports: {
    young: [
      'לאו מסי: אינטר מיאמי תהיה הקבוצה האחרונה בה אשחק. בזמן שכולם מתכוננים ליורו 2024 שייצא לדרך ביום שישי הקרוב, לאו מסי ונבחרת ארגנטינה חושים על הקופה אמריקה, שתצא לדרך בשישי הבא. בינתיים הכוכב בן ה-37 מלהטט באינטר מיאמי, שנמצאת בפסגת הקונפרנס המזרחי ב-MLS. אם יש כאלה שפינטזו על קאמבק של הפרעוש לאירופה, בריאיון ל-ESPN הוא הבהיר כי הקבוצה האמריקאית תהיה האחרונה שלו בקריירה.',
     'עוד רגע נגמר: סיפור העונה המטורפת של מכבי תא העונה של מכבי תל אביב בכדורסל תסתיים בקרוב אחרי שתפגוש את הפועל תא או קריית אתא בסדרת גמר פלייאוף רותחת, אבל לפני כן ניסיתי לקבץ לכם את נבחרי ורגעי העונה של הצהובים: השחקן המצטיין: הוא אומנם נפצע פעמיים, אך ווייד בולדווין הוביל את מכבי תל אביב לפלייאוף נוסף ביורוליג כשהוא אחד המועמדים לתואר ה־MVP של המפעל. הגארד האמריקאי העמיד ממוצעים של 17.4 נקודות עם 4.9 אסיסטים, אבל חוסר מזל מנע ממנו וממכבי תא לסיים את העונה אולי עם פיינל פור אירופי.  השחקן המשתפר: לא רק במכבי תא, אולי גם ביורוליג כולה. גוש ניבו הפך השנה למפלצת וצפוי להימכר בקיץ, ככל הנראה למילאנו. הסנטר היה אחד הבולטים במפעל עם ממוצעים של 11.2 נקודות, והוביל את היורוליג בריבאונדים עם 7.1 בממוצע למשחק. השחקן המאכזב: כשהגיע בקיץ האחרון לישראל לא ציפו מגיימס ווב להוביל את מכבי תא, אך הפורוורד אפילו לא היה קרוב להיות שחקן משלים ביורוליג. הוא קלע קצת יותר משש נקודות למשחק, אבל לא היה יעיל',
      'ילד הפלא של יורו 2024: ארבעה שיאים שלאמין ימאל יכול לשבור בגרמניה. הוא יחגוג יום הולדת 17 רק ב-13 ביולי, יום לפני גמר יורו 2024, אבל ללאמין ימאל, ילד הפלא של ברצלונה, צפוי להיות תפקיד משמעותי מאוד בנבחרת ספרד, אחת המועמדות המובילות לזכייה בטורניר בגרמניה.  שחקן הכנף, שכבש שבעה שערים וסיפק 10 בישולים בכל המסגרות בעונת הבוגרים הראשונה שלו, כבר רגיל לעשות היסטוריה. הצעיר ביותר שפותח במשחק בלה ליגה, הצעיר ביותר שכובש בלה ליגה, הצעיר ביותר שמבשל בלה ליגה, בצעיר ביותר שעורך בכורה בליגת האלופות במדי ברצלונה, הצעיר ביותר שפותח במשחק צמפיונס, הצעיר ביותר שכובש במוקדמות היורו - זו רשימה חלקית בלבד של השיאים שהוא קבע. ',
    ],
    old: [
      'דיווח: מאמן ריינגרס לשעבר מועמד לאמן את מכבי ת"א - לפני חמישה ימים בלבד הודיע רובי קין כי לא ימשיך כמאמן מכבי תא. על פי הדיווחים בסקוטלנד, לצהובים יש על הכוונת מחליף אפשרי - מייקל ביל, שאימן בין השאר את ריינגרס. על פי הסאן הסקוטי, ביל בן ה-43 הוא אחד המועמדים המובילים לרשת את קין. הוא אימן בסך הכל שלוש קבוצות, ביניהן מועדון הפאר מגלאזגו. במשך שנים הוא שימש כעוזר מאמן, בין השאר אצל סטיבן גרארד באסטון וילה. ביוני 2022 קיבל ביל את ההזדמנות הראשונה בקריירה שלו כמאמן ראשי, וזה קרה על הקווים של קווינס פארק ריינגרס מליגת המשנה באנגליה. לאחר פתיחה נפלאה לעונה, שכללה שמונה ניצחונות ב-11 מחזורים, הוא מונה למאמנה של גלאזגו ריינגרס והחליף את אותו גרארד תחתיו הוא עבד בווילה. לאחר שנה פוטר ביל מתפקידו בקבוצה הסקוטית וחודשיים לאחר מכן מונה למאמנה של סנדרלנד, אך גם שם הדברים לא הסתדרו והוא פוטר במהלך העונה.',
      'נוח על משכבך בשלום, לוגו: ב-NBA נפרדים מגרי ווסט-  עולם הספורט בארהב נפרד מאחד הענקים שידע ענף הכדורסל - גרי ווסט - שהלך היום (רביעי) לעולמו בגיל 86. כדורסלן העבר, המאמן והגנרל-מנגר האגדי מת בביתו לצד אשתו, קארן. ווסט נחשב במשך שנים לפנים של ה-NBA ודמותו מעטרת עד היום את הלוגו של הליגה',
      'אחד מהמשחקים הגדולים בתולדות היורו-  יורו 1960, חצי גמר: יוגוסלביה - צרפת 4:5 . זה יהיה הוגן לקבוע שהיורו היה טורניר מוצלח מאוד מהרגע הראשון שלו באוויר העולם, מאחר שהמשחק הראשון בתולדות האליפות כלל דרמת ענק ולא פחות מתשעה שערים, ועד היום מדובר במשחק הכי פורה בהיסטוריה של התחרות.  המארחת צרפת הוציאה לדרך את הטורניר - שנקרא -גביע האומות האירופי וכלל ארבע נבחרות בלבד - וגם בלי זיסט פונטיין, שכבש 13 שערים במונדיאל רק שנתיים קודם לכן, הובילה 2:4 על יוגוסלביה כשנותרו 15 דקות בלבד לשריקת הסיום. אלא שחמש דקות לאחר מכן היוגוסלבים כבר השלימו מהפך ענק, והצליחו לשמור על היתרון עד לשריקת הסיום.',
    ],
  },
  music: {
    young: [
     'אודיה: הביקורות על צניעות לא מגיעות מאנשים דתיים - רק מחילוניים, שזה אבסורד, כבר כמה שנים טובות שאודיה מככבת בתחנות הרדיו ובפלייליסטים הכי נחשבים וחמים ועשתה לעצמה שם של אחת המוזיקאיות הבולטות והמסקרנות של תקופתנו. אבל עם פרוץ המלחמה, באופן מובן – היא הרגישה מחסום. אני זוכרת שביום אחד הייתי בשלוש שבעות. איפה חווים דברים כאלה חוץ מבמדינה הזו? הרגיש לי לא נכון להיכנס לדברים שמכאיבים לי ברמה האישית, זה כיבה את היצירתיות. והיו גם הופעות כמובן, הייתי בהרבה בסיסים. הלהקה שלי ואני שרנו להרבה חיילים וזה היה מרגש מאוד. היא רק בת 23 וכבר ארבע שנים בקדמת הבמה, עם קהל מעריצים שהולך וגדל. למרות שנראה שההצלחה הגיעה במהירות ובקלות, היא מספרת: מה שאנשים לא יודעים זה שעבדתי וכתבתי שירים בערך מגיל 15.',
      'שחר טבוך: שאלתי את הרב אם להכניס את הציציות כשאני והחבר שלי מתנשקים ברחוב,  שחר טבוך אומנם רק בן 25, אבל יש לו וותק לא מבוטל בתעשיית הבידור: 12 שנה חלפו מאז שהפציע לראשונה על המסך של ערוץ הילדים, ומאז ביסס את מעמדו ככוכב נוער וכשחקן מוערך, בין היתר בזכות תפקידו הזכור בסדרה שעת נעילה.  לאחרונה סביר להניח שגם שמעתם אותו הרבה – הודות לשיר החדש שלו ושל הבסטי אגם בוחבוט: נאדי באדי, שהפך ללהיט הממכר של האביב ונכלל באלבומו הראשון היי, זה שחר, שיצא בחודש שעבר. ',
      'פחד אלוהים ישמור- הלהיט פחד אלוהים הפך את כפיר צפריר מראפר אלמוני לכוכב שמשתף פעולה עם נטע ברזילי ואנה זק ומקבל קמפיינים מבוקשים. אבל עד לרגע הזה החיים שלו באמת היו פחד אלוהים ישמור: חמש הדקירות שחטף בגב, הביקור אצל דוד שלו בכלא שנועד להפחיד אותו, השוטרים שפשטו על הבית של סבתא בליל הסדר וההברחה לחול כדי שהעבריינים לא יגיעו אליו ויגמרו את הסיפור. הריאיון המלא עם כפיר מחכה בגיליון סוף השבוע של ידיעות אחרונות.',
    ],
    old: [
      'פנינה רוזנבלום: אני נראית פצצה גם היום. אין הרבה נשים שמתקרבות לגיל 70 ונראות כמוני, לא בארץ ולא בעולם.  בדיוק חזרתי ממיאמי, מספרת פנינה רוזנבלום. אני מכניסה לארהב את המוצרים שלי, את הסדרה הירוקה מצמח הקאנביס, 18 חנויות בקניונים הכי גדולים בארה"ב וגם ברשתות השיווק פה בארץ.',
      'מאשימים אותך בגזענות, את מתה להגיב, אבל צריכה לסתום- באוקטובר החלה רותם שפי להרגיש לא נוח בעורה. כלומר, בעור של שפיטה, הדמות שיצרה ושבשמלותיה עטורות הפאייטים תמיד חשה הכי בבית בעולם. בריאיון שיתפרסם ביום ו במוסף -7 לילות היא מסבירה למה. מאז שהתחילה המלחמה אני לא רוצה לשמוע ערבית בכלל, למרות שאני דמות שמדברת בערבית. אבל אז מפונים במלונות ביקשו שאבוא. כשהמפיקה שלי אמרה להן, אוקיי, אז היא תבוא בתור רותם אמרו לה, לא, לא, הם ממש יתבאסו אם היא לא תבוא בתור שפיטה,  ואני עומדת שמה, מול המפונים, כל אחד עם הטראומות שלו, ומתחילה עם המבטא ובא לי להקיא מעצמי קצת, אבל הם שמחו, עד כמה שאפשר לשמוח. אני עצובה. שפיטה היא אפרית, היא טורבו. כשאני עושה את שפיטה, הכוח שלי זה בחדות. כשאומרים לי משהו ואני מיד יורה תשובה שלא מצפים לה בכלל. כשאת בעצב, לא פשוט לך לעשות את זה.',
      'תוכן מוזיקה 3 לקבוצת גילאים מעל ל-40',
    ],
  },
  celebrities: {
    young: [
      'ראשון: נחשף פרט שלא ידעתם על טל מורד - ואיך זה קשור למאיה קיי? טל מורד מהמם אותנו ב"רוקדים עם כוכבים" וגורם לנו לתהות לגביי מגוון שאלות. כעת, נחשף פרט סודי על הכוכב שגרם לנו להתרגש ובעיקר לחזק אותו. טל מורד כבש את רחבת הריקודים בפרק הפתיחה של ״רוקדים עם כוכבים״ לצידה של הפרטנרית הלוהטת סנה סוקול כשהוא מתחרה ראש בראש נגד האקסית מאיה קיי. מורד זכה לשלל מחמאות לא רק על יכולותיו על הרחבה אלא על הנראות שלו, כשהרשת הוצפה בשלל קומפלימנטים על כמה הוא לוהט וחתיך.',
      'מרגי נותן הצצה נדירה לזוגיות עם אנה זק: "הוקרת תודה על האדם הזה שנכנס לי לחיי". מרגי ואנה זק הפכו לאחד הזוגות המפתיעים בביצה ומשתדלים לשמור על מערכת היחסים שלהם הרחק מאור הזרקורים. כעת, נותן הזמר הצצה נדירה ומרגשת למערכת היחסים של השניים. אחרי ששחרר את ה-EP הבינלאומי שזכה לסיקור נרחב והגיע להישגים מדהימים, ביניהם פירגון מצד אלטון ג׳ון והתארחויות בתוכניות נחשבות כגון "The Kelly Clarkson Show" ו- "Today Show", משחרר הבוקר מרגי בהפתעה מוחלטת ומבלי הכנה מוקדמת, EP חדש שכולו בעברית.',
      'איתי לוי נצפה צמוד לבחורה חדשה במסיבה. היא מצדה טוענת: "אנחנו חברים בלבד". פרסום ראשון-הזמר איתי לוי צמוד למישהי חדשה. בסוף השבוע האחרון נערכה מסיבת ברית במתחם אירועים בנס ציונה, ולא מעט זמרים ים תיכוניים הגיעו לחגוג במסיבת הבריכה. באותו אירוע מדובר, בו פצחו אייל גולן ודניאל גרינברג במריבה סוערת שנגמרה בעזיבתה המפתיעה של גרינברג את המקום. אלא שזה לא היה האייטם היחיד המסקרן באירוע.',
    ],
    old: [
      'הפרידה של אייל גולן ודניאל גרינברג הפתיעה את כולנו, גם את הזוג המפורסם שעד רגע הפרידה תכננו ממש בימים אלה לעבור לקורת גג משותפת במושב כפר הנגיד. בית אליו עבר הזמר כפי שדיווחנו לכם לראשונה כבר בשבוע שעבר בגפו ,אחרי ולמרות הפרידה מדניאל, שם אירח בסוף השבוע את כל ילדיו.',
      'בעקבות סרטון האלימות: איציק זוהר פוטר . סרטון האלימות של איציק זוהר ממשיך לייצר הד ברחבי המדינה. אחרי החשיפה של הסרטון המזעזע בו זוהר תוקף את בת זוגו לשעבר, מיטל אדרי, חברת ״מימון ישיר״, שלקחה את זוהר כפרזנטור ממש לאחרונה, החליטה לבטל איתו את החוזה. על פי דיווח של מאקו, החברה שבחרה בשחקן הכדורגל לשעבר כפרזנטור במסגרת פעילויות הסושיאל שלה, התנערה מזוהר לאחר פרסום סרטון התקיפה. ',
      'סלין דיון בראיון מאז התפרצות המחלה: "שברתי את הצלעות". הזמרת סלין דיון נחשפת לראשונה מאז שחלתה בתסמונת האדם הנוקשה. בקרוב תעלה סדרת הדוקו I Am: Celine Dion  החדשה שלה, שם הכוכבת מתעדת את ההתמודדות הקשה עם המחלה שלה. לקראת עליית הסדרה, דיון העניקה ריאיון טלוויזיוני ראשון שעתיד להעלות באורכו המלא בשלישי הקרוב ונחשף מתוכו קטע קצר. בקטע הקצר הזמרת משתפת את ההשפעות הקשות של מחלתה שנוגעים בכל האספקטים של החיים שלה. הכוכבת משתפת כי זה מרגיש "כאילו מישהו חונק אותך. כאילו מישהו לוחץ לך על הגרון. אני לא מסוגלת לשיר גבוה או נמוך יותר". ',
    ],
  },
};



  return (
    <View>

     <Text style={styles.subtitle}> תוכן מותאם אישית </Text>
      <Text style={styles.instructionsText}> אנא בחר את תחום העניין המעניין אותך: </Text>
      <View style={styles.checkboxContainer}>
        <Text style={styles.label}>אופנה</Text>
        <View style={styles.checkboxItem}>
          <Checkbox
            value={checkedItem === 'fashion'}
            onValueChange={() => setCheckedItem('fashion')}
            color={checkedItem === 'fashion' ? '#4630EB' : undefined}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.label}>ספורט</Text>
        <View style={styles.checkboxItem}>
          <Checkbox
            value={checkedItem === 'sports'}
            onValueChange={() => setCheckedItem('sports')}
            color={checkedItem === 'sports' ? '#4630EB' : undefined}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.label}>מוזיקה</Text>
        <View style={styles.checkboxItem}>
          <Checkbox
            value={checkedItem === 'music'}
            onValueChange={() => setCheckedItem('music')}
            color={checkedItem === 'music' ? '#4630EB' : undefined}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.label}>סלבס</Text>
        <View style={styles.checkboxItem}>
          <Checkbox
            value={checkedItem === 'celebrities'}
            onValueChange={() => setCheckedItem('celebrities')}
            color={checkedItem === 'celebrities' ? '#4630EB' : undefined}
            style={styles.checkbox}
          />
        </View>
      </View>

      {checkedItem && (
        <View style={styles.additionalContentContainer}>
          {[1, 2, 3].map((item, index) => (
            <View key={index} style={[styles.contentItemContainer, { alignItems: 'center' }]}>
              {checkedItem === 'fashion' && <Image source={require('../app/fashion.png')} style={styles.VendorImage} />}
              {checkedItem === 'sports' && <Image source={require('../app/sport.png')} style={styles.VendorImage} />}
              {checkedItem === 'music' && <Image source={require('../app/music.png')} style={styles.VendorImage} />}
              {checkedItem === 'celebrities' && <Image source={require('../app/celebrities.png')} style={styles.VendorImage} />}
              <Text style={styles.additionalContent}>
                {checkedItem && contentByCategory[checkedItem][userAge >= 20 && userAge <= 40 ? 'young' : 'old'][index] || ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    
    </View>
  );
}
// Screen style
const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontFamily: 'Assistant_700Bold',
    fontSize: Platform.OS === 'android' ? 32 : 36,
    marginTop: 60, 
    marginBottom:20,
    textAlign: 'center',
    marginRight:Platform.OS === 'android' ? 10 : 0,
    
},
subtitle: {
  color: 'rgb(251, 220, 106)',
  fontFamily: 'Assistant_700Bold',
  fontSize: 20,
  marginTop: 20,
  textAlign: 'center',
},
instructionsText: {
  color: 'white',
  fontFamily: 'Assistant_400Regular',
  fontSize: 18,
  textAlign: 'center',
  marginBottom:10
},
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
  },
 
  button: {
    backgroundColor: 'rgb(251, 220, 106)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom:10
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
  },

  label: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10, 
    marginRight: 10, 
    fontFamily: 'Assistant_400Regular',
  },
  checkbox: {
    width: 24,
    height: 24,
    color: 'white',
  },

  VendorImage: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 10,
    top: 30,
    paddingBottom:20
  
  },
  additionalContentContainer: {
    position: 'relative', 
    marginBottom: 10, 
    alignItems: 'flex-end', 
    fontFamily: 'Assistant_400Regular',
  },
  additionalContent: {
    fontSize: 18,
    color: 'white',
    paddingRight:40,
    top: 30,
    paddingBottom:20,
    fontFamily: 'Assistant_400Regular',
    textAlign:'right'
  },
  scrollView: {
    flex: 1,
},
});


