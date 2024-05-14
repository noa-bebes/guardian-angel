import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, TextInput, FlatList, Platform  } from 'react-native';
import socketIOClient from 'socket.io-client';
import axios from 'axios';


const API_URL = 'https://www.oref.org.il/WarningMessages/History/AlertsHistory.json';
const SOCKET_URL = 'YOUR_SOCKET_URL_HERE'; // Replace with your socket server URL

function NotificationsScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {4
    fetchData(); // Fetch initial data
    const socket = socketIOClient(SOCKET_URL);
    socket.on('newData', (newData) => {
      // Update data when new data received from the socket
      setData(newData);
    });

    return () => {
      socket.disconnect(); // Clean up socket connection on unmount
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

  return (
    <View style={styles.screenContainer}>
      <Image source={require('./app/logo2.png')} style={styles.logo2} />
      <Text style={styles.screenText}>התרעות ועדכונים</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.date}>{item.alertDate}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.alertData}>{item.data}</Text>
          </View>
        )}
      />
    </View>
  );
}

export default NotificationsScreen;

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
      width: 370,
      height: 40,
      position: 'absolute',
      top: 50,
      alignSelf: 'center',
    },
    logo2: {
      width: 80,
      height: 40,
      position: 'absolute',
      top: 30,
      left: 20, // Adjust left position as needed
    },
   screenText: {
      color: 'pink',
      fontSize: 30,
      fontWeight: 'bold',
      position: 'absolute',
      top: 30,
      right: 35, // Adjust right position as needed
      marginBottom: 10,
    },
    registerButton: {
      marginBottom: 80,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    registerButtonText: {
      color: 'purple',
      fontSize: 16,
      fontWeight: 'bold',
      
    },
    screenContainer: {
      flex: 1,
      backgroundColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10
    },
    input: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 5,
      marginBottom: 10,
      paddingHorizontal: 10,
      color: 'white',
    },
    placeholder: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginEnd: 10,
    },
    button: {
      backgroundColor: 'orange',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    instructionsContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 10,
      borderRadius: 5,
      marginTop: -90, // Change marginTop to adjust spacing
    },
    instructionsText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'right',
    },
    instructionsContainer2: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 10,
      borderRadius: 5,
    },
    instructionsText2: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'right',
    },
    menuButton: {
      position: 'absolute',
      top: 100, // Adjust top position to be under the logo
      alignSelf: 'center',
      backgroundColor: 'black',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      right: 20, // Adjust right position as needed
      flexDirection: 'row',
      alignItems: 'center',
      width: 350,
      justifyContent: 'flex-end', // Align items to the right
    },
    menuButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'right',
      marginLeft: 10, // Add space between text and image by adding margin to the left
      marginRight: 10,
    },
    menuVendorImage: {
      width: 20,
      height: 20
    },
    dropdownMenu: {
      position: 'absolute',
      top: 150, // Adjust top position to be under the logo
      right: 20, // Adjust right position as needed
      backgroundColor: 'black',
      borderRadius: 10,
      elevation: 5, // For Android shadow
      zIndex: 2, // For iOS shadow
    },
    
    menuItem: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      right: -10, // Adjust right position as needed
      flexDirection: 'row',
      alignItems: 'center',
      width: 350,
      justifyContent: 'flex-end', // Align items to the right
    },
    menuItemText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'right',
      paddingRight: 10
  
    },
    
    Screen2Text: {
        color: 'pink',
        fontSize: 26,
        fontWeight: 'bold',
        position: 'absolute',
        top: 30,
        right: 5, // Adjust right position as needed
    },
  
    okayButton: {
      marginTop: 10,
      backgroundColor: 'purple',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 7,
    },
    
    okayButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: 'red'
    },
    item: {
      padding: 20,
      borderBottomWidth: 1,
      marginTop: 50,
      borderBottomColor: '#ccc',
    },
    date: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white'
    },
    alertData: {
      fontSize: 16,
      color: 'white'
    },
    map: {
      width: '100%',
      height: '100%',
    },
  });
   
  
  
  