// ----------------------------------------------------------- file: server.js ----------------------------------------------------- //
/*
Summary:
This file initialize the concetion to the db using firebase services.
DB name: guardian-angel.db.
Tabels: "User", "Contacts".
*/
// --------------------------------------------------------------------------------------------------------------------------------- //


// Import libraries
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbBZJTeTo3VA-g7ahpmfVQBl-OAzLvauo",
  authDomain: "guardian-angel-580a0.firebaseapp.com",
  databaseURL: "https://guardian-angel-580a0-default-rtdb.firebaseio.com",
  projectId: "guardian-angel-580a0",
  storageBucket: "guardian-angel-580a0.appspot.com",
  messagingSenderId: "106646297238",
  appId: "1:106646297238:web:2422d99ead3fa18abbc0b7",
  measurementId: "G-DE6FRQ6941"
};

const app = initializeApp(firebaseConfig);

// export the initialized Firebase app
export { app }; 