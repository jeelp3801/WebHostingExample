const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const app = express();

const PORT = 8888;
const CLIENT_ID = '80774347a92f4e1499c128ffc6ce3dd0';
const CLIENT_SECRET = '9575130a6a194c79b7670cd071c99c38';
const REDIRECT_URI = 'http://localhost:8888/callback';
// Serve static files from the "frontend" directory
const path = require('path'); // Add this line
app.use(express.static(path.join(__dirname, '../')));
// Configure CORS Options
const corsOptions = {
    origin: 'http://localhost:3000', // Update this if frontend is served from a different origin
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
};

app.use(cors(corsOptions)); // Apply CORS middleware

app.get('/login', (req, res) => {
    const scopes = 'user-read-playback-state user-modify-playback-state streaming playlist-read-private playlist-read-collaborative';
    const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scopes,
        redirect_uri: REDIRECT_URI,
    })}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        console.error('Authorization code not received');
        return res.status(400).send('Error: Authorization code not received.');
    }

    try {
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        // Store tokens securely (e.g., in a database or session)
        // For simplicity, we send them back to the frontend
        res.redirect(
            `http://localhost:8888/main-pages/music-page/spotify-feature1/spotify-feature1.html?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
        );
    } catch (error) {
        console.error('Error fetching tokens:', error.response?.data || error.message);
        res.status(400).send('Error fetching tokens. Check the logs for more details.');
    }
});



app.get('/now-playing', async (req, res) => {
    const accessToken = req.query.access_token;

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.status === 204 || !response.data) {
            res.status(200).send({ item: null });
        } else {
            res.status(200).send(response.data);
        }
    } catch (error) {
        console.error('Error fetching now playing data:', error.response?.data || error.message);
        res.status(500).send('Error fetching now playing data.');
    }
});

app.get('/playlists', async (req, res) => {
    const accessToken = req.query.access_token;

    if (!accessToken) {
        return res.status(400).send('Access token is required');
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching playlists:', error.response?.data || error.message);
        res.status(500).send('Failed to fetch playlists');
    }
});

//Added two more endpoints
// Start Music
app.post('/start-music', async (req, res) => {
  const accessToken = req.query.access_token; // Or retrieve from req.body/access_token
  if (!accessToken) {
    return res.status(400).send('Access token is required.');
  }

  try {
    await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.send('Music started.');
  } catch (error) {
    console.error('Error starting music:', error.response?.data || error.message);
    res.status(500).send('Failed to start music.');
  }
});

// Stop Music
app.post('/stop-music', async (req, res) => {
  const accessToken = req.query.access_token; // Or retrieve from req.body/access_token
  if (!accessToken) {
    return res.status(400).send('Access token is required.');
  }

  try {
    await axios.put(
      'https://api.spotify.com/v1/me/player/pause',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.send('Music stopped.');
  } catch (error) {
    console.error('Error stopping music:', error.response?.data || error.message);
    res.status(500).send('Failed to stop music.');
  }
});


app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
