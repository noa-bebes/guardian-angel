// ----------------------------------------------------------- file: server.js ----------------------------------------------------- //
/*
Summary:
This file schedules a periodic task (printcrossCheckData) based on the current screen name. 

Functions:
1. "useCrossCheckScheduler"- schedules a periodic task (printcrossCheckData) based on the current screen name. 
*/
// --------------------------------------------------------------------------------------------------------------------------------- //

// Import libraries
import { useEffect } from 'react';

// Import function from file "NotificationHandler.js"
import { printcrossCheckData } from './NotificationHandler';

// Function 1: "useCrossCheckScheduler"
const useCrossCheckScheduler = (currentScreenName) => {
  useEffect(() => {
    console.log("Current screen name:", currentScreenName);

    // List of screens in which this function should not be performed
    const screensToExclude = ['Login', 'Register', 'Welcome', 'UserScreen', 'ContactDetailsScreen'];
    
    // Only schedule cross-checking if the current screen is not one of the excluded screens, every 10 sec.
    if (!screensToExclude.includes(currentScreenName)) {
      console.log("Scheduling cross-checking...");
      const intervalId = setInterval(async () => {
        await printcrossCheckData();
      }, 10000);
  
      return () => clearInterval(intervalId);
    } else {
      console.log("Excluded screen:", currentScreenName);
    }
  }, [currentScreenName]); // Dependency on currentScreenName
};

export default useCrossCheckScheduler;