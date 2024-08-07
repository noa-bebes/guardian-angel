// ------------------------------------------------------------- server_hc.js ------------------------------------------------------------//
/*
Summary:
This file concets to the Home Front Command's API in order to receive real alerts on security events such as: 
* Rocket and missile firing (ירי רקטות וטילים)
* Aircraft intrusion  (חדירת כלי טיס עוין)
The alerts shown to the user are within the last 24 hours.
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = 4000;

app.use(cors()); // Enable CORS for all routes

// Define a route to handle the GET request
app.get('/fetch-data', async (req, res) => {
  console.log('Incoming request:', req.url, req.headers);
  try {
    // Make GET request to the URL
    const response = await axios.get('https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json');
    // Send the response data back to the client
    res.json(response.data);
  } catch (error) {
    // Handle errors
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});