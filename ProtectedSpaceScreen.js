import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, TextInput, FlatList, Platform  } from 'react-native';


function ProtectedSpaceScreen() {
    return (
      <View style={styles.screenContainer}>
      <Image source={require('./app/logo2.png')} style={styles.logo2} />
      <Text style={styles.Screen2Text}>ניווט חי לממ"ד הקרוב </Text> 
      <TouchableOpacity style={styles.button} onPress={() => console.log('הכל בסדר')}>
        <Text style={styles.Textbutton}>הכל בסדר</Text>
      </TouchableOpacity>
      </View>
    );
  }

  export default ProtectedSpaceScreen;

  const styles = StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: 'black',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo2: {
      width: 80,
      height: 40,
      position: 'absolute',
      top: 30,
      left: 20, // Adjust left position as needed
    },
    Screen2Text: {
        color: 'pink',
        fontSize: 26,
        fontWeight: 'bold',
        position: 'absolute',
        top: 30,
        right: 5, // Adjust right position as needed
    },
    button: {
      marginTop: 20,
      padding: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    
    },
    Textbutton: {
      fontFamily: 'Helvetica-Bold', 
      color: 'rgba(252,24,241, 0.4)',
      fontSize: 20,
      fontWeight: 'bold',
    }
  });
   
  
  
  