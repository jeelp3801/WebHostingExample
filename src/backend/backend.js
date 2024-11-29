// const express = require('express');
// const { google } = require('googleapis');
// const dotenv = require('dotenv');
// const { exec } = require('child_process');
// const path = require('path');



// // Load environment variables from .env file
// dotenv.config();

// const app = express();
// const port = 3000;

// //-------updated one's-----------
// const cors = require('cors');

// // Enable CORS
// app.use(cors());

// //-------------------------------
// // Serve static files from the root directory
// // app.use(express.static(path.join(__dirname)));

// //--------added part
// app.use(express.static(path.join(__dirname, '../main-pages/task-page/notion-features')));

// app.get('/calendar-sync', (req, res) => {
//   res.sendFile(path.join(__dirname, '../main-pages/task-page/notion-features/CalendarSync.html'));
// });
// //---------

// // Set up OAuth2 client
// const oauth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// //addded part




// // Scopes for Google Calendar
// const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// // Generate the URL for Google OAuth consent screen
// const authUrl = oauth2Client.generateAuthUrl({
//   access_type: 'offline', // Offline access to get refresh token
//   scope: SCOPES,
// });

// // Route to start the OAuth flow
// app.get('/auth', (req, res) => {
//   res.redirect(authUrl);
// });

// // OAuth2 callback route
// app.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;

//   if (!code) {
//     return res.send('No authorization code received.');
//   }

//   try {
//     // Exchange authorization code for tokens
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // Store tokens (can be saved to a database or session for long-term use)
//     console.log('Tokens received:', tokens);

//     // Send a response to the client first
//     res.send('Authorization successful! You can now access your Google Calendar.');

//     // Now, make the events available through an endpoint
//     listCalendarEvents(res);
//   } catch (error) {
//     console.log('Error during OAuth2 token exchange:', error);
//     res.send('Error during authorization: ' + error.message);
//   }
// });

// // Endpoint to fetch calendar events for frontend
// app.get('/events', async (req, res) => {
//   try {
//     const events = await listCalendarEvents();
//     res.json(events); // Send events as JSON response to frontend
//   } catch (err) {
//     res.status(500).json({ error: 'Error retrieving events' });
//   }
// });

// // Function to list events from Google Calendar
// async function listCalendarEvents() {
//   const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//   try {
//     const response = await calendar.events.list({
//       calendarId: 'primary',  // 'primary' refers to the primary calendar of the authenticated user
//       timeMin: (new Date()).toISOString(),  // Get events starting from the current time
//       maxResults: 10,  // Limit the results to 10 events
//       singleEvents: true,  // List single events (instead of recurring events)
//       orderBy: 'startTime',  // Sort events by start time
//     });

//     const events = response.data.items;
//     if (events.length) {
//       return events;
//     } else {
//       return { message: 'No upcoming events found.' };
//     }
//   } catch (err) {
//     console.log('Error retrieving events:', err);
//     throw new Error('Error retrieving events');
//   }
// }

// // Serve the index.html file
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../main-pages/task-page/notion-features/CalendarSync.html')); 
//   // Adjust the path to where your index.html is located
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);

//   // Automatically open the browser using child_process for macOS
//   exec(`open http://localhost:${port}/auth`, (err, stdout, stderr) => {
//     if (err) {
//       console.error(`exec error: ${err}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.error(`stderr: ${stderr}`);
//   });
// });


//------------updated code with login feature too 
const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, '../')));

// Serve CalendarSync.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing-page/home.html'));
});


// Set up OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Scopes for Google Calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Route to start the OAuth flow
app.get('/auth/google', (req, res) => {
  const currentPage = req.headers.referer || '/calendarSync.html'; // Fallback to default
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    state: currentPage, // Pass the current page URL
  });
  res.redirect(authUrl);
});


// OAuth2 callback route
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code received.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Tokens received:', tokens);

    // Redirect back to the task page or calendar sync page
    res.redirect('/calendar-sync'); // Adjust path as needed
  } catch (error) {
    console.error('Error during OAuth2 token exchange:', error);
    res.status(500).send('Error during authorization: ' + error.message);
  }
});

app.get('/oauth2callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('No authorization code received.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Tokens received:', tokens);

    // Redirect back to the original page
    res.redirect('/task-page/notion-features/CalendarSync.html'); // Fallback if no state is provided
  } catch (error) {
    console.error('Error during OAuth2 token exchange:', error);
    res.status(500).send('Error during authorization: ' + error.message);
  }
});




// Endpoint to check login status
app.get('/auth/status', (req, res) => {
  if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// Endpoint to fetch calendar events
app.get('/events', async (req, res) => {
  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    res.json(events.length ? events : { message: 'No upcoming events found.' });
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).json({ error: 'Error retrieving events' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
