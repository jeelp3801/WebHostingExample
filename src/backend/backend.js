const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Set up OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Scopes for Google Calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Generate the URL for Google OAuth consent screen
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Offline access to get refresh token
  scope: SCOPES,
});

// Route to start the OAuth flow
app.get('/auth', (req, res) => {
  res.redirect(authUrl);
});

// OAuth2 callback route
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.send('No authorization code received.');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens (can be saved to a database or session for long-term use)
    console.log('Tokens received:', tokens);

    // Send a response to the client first
    res.send('Authorization successful! You can now access your Google Calendar.');

    // Now, make the events available through an endpoint
    listCalendarEvents(res);
  } catch (error) {
    console.log('Error during OAuth2 token exchange:', error);
    res.send('Error during authorization: ' + error.message);
  }
});

// Endpoint to fetch calendar events for frontend
app.get('/events', async (req, res) => {
  try {
    const events = await listCalendarEvents();
    res.json(events); // Send events as JSON response to frontend
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving events' });
  }
});

// Function to list events from Google Calendar
async function listCalendarEvents() {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',  // 'primary' refers to the primary calendar of the authenticated user
      timeMin: (new Date()).toISOString(),  // Get events starting from the current time
      maxResults: 10,  // Limit the results to 10 events
      singleEvents: true,  // List single events (instead of recurring events)
      orderBy: 'startTime',  // Sort events by start time
    });

    const events = response.data.items;
    if (events.length) {
      return events;
    } else {
      return { message: 'No upcoming events found.' };
    }
  } catch (err) {
    console.log('Error retrieving events:', err);
    throw new Error('Error retrieving events');
  }
}

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing-page/home.html')); // Adjust the path to where your index.html is located
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);

  // Automatically open the browser using child_process for macOS
  exec(`open http://localhost:${port}/auth`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
});

