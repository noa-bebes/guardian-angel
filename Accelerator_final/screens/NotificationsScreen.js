import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Platform } from 'react-native';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { handleNotification, fetchLastAlert } from '../NotificationHandler'; 
import { useFonts, Assistant_400Regular, Assistant_700Bold } from '@expo-google-fonts/assistant';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = 'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json';
const SOCKET_URL = 'wss://echo.websocket.org';

function NotificationsScreen() {

  const [fontsLoaded] = useFonts({
    Assistant_400Regular,
    Assistant_700Bold,
  });

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
    const socket = socketIOClient(SOCKET_URL);
    socket.on('newData', async (newData) => {
      setData(newData);
      const lastAlert = await fetchLastAlert();
      handleNotification(lastAlert);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderIcon = (title) => {
    if (title === "ירי רקטות וטילים") {
      return <FontAwesome5 name="rocket" size={18} color='black' />;
    } else if (title === "חדירת כלי טיס עוין") {
      return <FontAwesome5 name="fighter-jet" size={18} color='black' />;
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return { formattedDate, formattedTime };
  };

  return (
    <View style={styles.container}>
      <View style={styles.topScreen}>
        <Image source={require('../app/logo2.png')} style={styles.logo2} />
        <Text style={styles.title1}>התרעות ועדכונים</Text>
      </View>
      <View style={styles.notifications}>
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
          renderItem={({ item }) => (
            <View style={styles.notificationBlock}>
              <View style={styles.icon}>
                {renderIcon(item.title)}
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{`תאריך: ${formatDate(item.alertDate).formattedDate}`}</Text>
                <Text style={styles.date}>{`שעה: ${formatDate(item.alertDate).formattedTime}`}</Text>
                <Text style={styles.alertData}>{`מיקום: ${item.data}`}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topScreen: {
    flex: 0.2,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo2: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 30,
    left: 20,
    width: 60,
    height: 30,
  },
  title1: {
    color: 'white',
    fontFamily: 'Assistant_700Bold',
    fontSize: Platform.OS === 'android' ? 32 : 36,
    marginTop: 20,
    textAlign: 'center',
  },
  notifications: {
    flex: 0.8,
    backgroundColor: 'black', // Darker shade of black
  },
  notificationBlock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'white', 
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    marginVertical: 10,
    borderRadius: 7,
  },
  icon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    color: 'white',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Assistant_700Bold',
    color: 'rgb(251, 220, 106)',
    
  },
  date: {
    fontSize: 16,
    fontFamily: 'Assistant_400Regular',
    color: 'white',
  },
  alertData: {
    fontSize: 16,
    fontFamily: 'Assistant_400Regular',
    color: 'white',
  },
});
