// // Import necessary modules for each calendar API
// const { google } = require('googleapis');
// const { Client } = require('@microsoft/microsoft-graph-client');

// // Google Calendar Setup
// const googleCalendar = google.calendar('v3');

// // Outlook Calendar Setup (Microsoft Graph API client setup)
// const getOutlookClient = (auth) => {
//     return Client.init({
//         authProvider: (done) => done(null, auth) // Provide the auth token
//     });
// };

// /**
//  * Sync a Notion task with Google Calendar.
//  * @param {Object} taskData - Task data to be synced.
//  * @param {Object} auth - Auth object containing Google OAuth tokens.
//  * @returns {Promise<Object>} - Synced Google Calendar event.
//  */
// export const syncGoogleCalendar = async (taskData, auth) => {
//     try {
//         const event = {
//             summary: taskData.title,
//             description: taskData.description,
//             start: { dateTime: taskData.startDateTime, timeZone: 'UTC' },
//             end: { dateTime: taskData.endDateTime, timeZone: 'UTC' },
//         };

//         const response = await googleCalendar.events.insert({
//             auth: auth,
//             calendarId: 'primary',
//             resource: event,
//         });

//         if (!response || !response.data) {
//             throw new Error('Google Calendar API response is invalid');
//         }

//         return response.data;
//     } catch (error) {
//         console.error("Error syncing with Google Calendar:", error);
//         return { error: "Failed to sync with Google Calendar" };
//     }
// };

// /**
//  * Sync a Notion task with Outlook Calendar.
//  * @param {Object} taskData - Task data to be synced.
//  * @param {Object} auth - Auth token for Microsoft Graph API.
//  * @returns {Promise<Object>} - Synced Outlook Calendar event.
//  */
// export const syncOutlookCalendar = async (taskData, auth) => {
//     try {
//         const client = getOutlookClient(auth);

//         const event = {
//             subject: taskData.title,
//             body: { contentType: "HTML", content: taskData.description },
//             start: { dateTime: taskData.startDateTime, timeZone: 'UTC' },
//             end: { dateTime: taskData.endDateTime, timeZone: 'UTC' },
//         };

//         const response = await client
//             .api('/me/events')
//             .post(event);

//         return response;
//     } catch (error) {
//         console.error("Error syncing with Outlook Calendar:", error);
//         return { error: "Failed to sync with Outlook Calendar" };
//     }
// };

// /**
//  * Main function to sync a Notion task with the selected calendar.
//  * @param {Object} taskData - Task data to sync.
//  * @param {String} calendarType - Type of calendar ("Google" or "Outlook").
//  * @param {Object} auth - Authentication object for the calendar API.
//  */
// export const syncWithCalendar = async (taskData, calendarType, auth) => {
//     if (calendarType === 'Google') {
//         return await syncGoogleCalendar(taskData, auth);
//     } else if (calendarType === 'Outlook') {
//         return await syncOutlookCalendar(taskData, auth);
//     } else {
//         return { error: "Unsupported calendar type" };
//     }
// };




// // //updated file below 

// document.addEventListener('DOMContentLoaded', function() {
//     const fetchEventsButton = document.getElementById('fetchEvents');
  
//     if (fetchEventsButton) {
//       fetchEventsButton.addEventListener('click', function() {
//         console.log('Button clicked');
//         fetchCalendarEvents();
//       });
//     } else {
//       console.error('Button not found!');
//     }
//   });
  
//   async function fetchCalendarEvents() {
//     try {
//       // Make the API call to fetch events from your backend
//       const response = await fetch('http://localhost:3000/events');
      
//       if (response.ok) {
//         const events = await response.json();
//         console.log('Fetched events:', events);
        
//         // Call function to display events
//         displayEvents(events);
//       } else {
//         console.error('Error fetching events:', response.status);
//       }
//     } catch (err) {
//       console.error('Error fetching calendar events:', err);
//     }
//   }
  
//   function displayEvents(events) {
//     console.log('Display events function called');
//     console.log('Events to display:', events);  // Check if events are correct
  
//     const eventsContainer = document.getElementById('task-display');
//     eventsContainer.innerHTML = ''; // Clear old content if necessary
//     const header = document.createElement('h2');
//     header.textContent = 'Upcoming Events:';
//     eventsContainer.appendChild(header);
    
//     // If there are events, list them
//     if (Array.isArray(events) && events.length > 0) {
//       const eventsList = document.createElement('ul');
//       events.forEach(event => {
//         const eventItem = document.createElement('li');
//         eventItem.textContent = `${event.summary} - ${new Date(event.start.dateTime || event.start.date).toLocaleString()}`;
//         eventsList.appendChild(eventItem);
//       });
//       eventsContainer.appendChild(eventsList);
//     } else {
//       eventsContainer.innerHTML += '<p>No upcoming events found.</p>';
//     }
  
//     // Append the events container to the body
//     console.log('Appending events container to body');
//     document.body.appendChild(eventsContainer);
//   }
  
  

//---------***updated file with login feature that redirects back to task page-------------

document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById('loginButton');
  const fetchEventsButton = document.getElementById('fetchEvents');
  const loginStatus = document.getElementById('loginStatus');
  const eventsContainer = document.getElementById('task-display');
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'calendar.css';
  document.head.appendChild(stylesheet);

  // Login with Google functionality
  loginButton.addEventListener('click', function () {
    window.location.href = 'http://localhost:3000/auth/google'; // Redirect to OAuth flow
  });

  // Check login status on page load
  checkLoginStatus();

  async function checkLoginStatus() {
    try {
      const response = await fetch('http://localhost:3000/auth/status');
      if (response.ok) {
        const data = await response.json();
        if (data.loggedIn) {
          loginStatus.style.display = 'block'; // Show login success message
          fetchEventsButton.disabled = false; // Enable fetch events button
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }

  // Fetch events functionality
  fetchEventsButton.addEventListener('click', async function () {
    try {
      const response = await fetch('http://localhost:3000/events');
      if (response.ok) {
        const events = await response.json();
        displayEvents(events);
      } else {
        console.error('Error fetching events:', response.status);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  });

  function displayEvents(events) {
    const eventsContainer = document.getElementById('task-display');
    eventsContainer.innerHTML = ''; // Clear previous content
  
    const header = document.createElement('h2');
    header.textContent = 'Upcoming Events:';
    eventsContainer.appendChild(header);
  
    if (Array.isArray(events) && events.length > 0) {
      const eventsList = document.createElement('ul');
      events.forEach((event) => {
        const eventItem = document.createElement('li');
        eventItem.textContent = `${event.summary} - ${new Date(
          event.start.dateTime || event.start.date
        ).toLocaleString()}`;
        eventsList.appendChild(eventItem);
      });
      eventsContainer.appendChild(eventsList);
    } else {
      eventsContainer.innerHTML = '<p>No upcoming events found.</p>';
    }
  }
});

