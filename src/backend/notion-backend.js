// Import dependencies
const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Middleware to parse JSON

app.use(cors({
    origin: 'http://127.0.0.1:5501', // Allow the specific origin of your frontend
    methods: ['GET', 'POST', 'PATCH'], // Allow only the necessary HTTP methods
    credentials: true, // Allow cookies if needed
  }));

// Set up OAuth2 client for Google Calendar
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

// Google OAuth Routes
app.get('/auth', (req, res) => {
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.send('No authorization code received.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Tokens received:', tokens);
    res.send('Authorization successful! You can now access your Google Calendar.');
    listCalendarEvents(res); // List calendar events
  } catch (error) {
    console.log('Error during OAuth2 token exchange:', error);
    res.send('Error during authorization: ' + error.message);
  }
});

// Endpoint to fetch Google Calendar events
app.get('/events', async (req, res) => {
  try {
    const events = await listCalendarEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving events' });
  }
});

// Function to list Google Calendar events
async function listCalendarEvents() {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
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

// Notion API Headers
const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  'Content-type': 'application/json',
};

// Notion Routes
const databaseId = process.env.NOTION_DATABASE_ID;

// add tasks
app.post("/add-task", async (req, res) => {
    const { taskData } = req.body; // receive data from frontend
    console.log("recieved task data:", taskData);

    const stepIds = [];
    try {
      for(const step of taskData.steps) {
        // create a step in the Steps database
        const stepResponse = await axios.post(
          "https://api.notion.com/v1/pages",
          {
            parent: { database_id: process.env.NOTION_STEP_DATABASE_ID},
            properties: {
              "Step Name" : { title: [{ text: { content: step.name } }] },
              "Due Date": { date: { start: step.date} },
            },
          },
          { headers: {
            ...notionHeaders,
            'Notion-Version': '2022-06-28',
            }
          }
        );

        // save step id to relate to task later
        stepIds.push({ id: stepResponse.data.id });
      }

      const response = await axios.post(
        "https://api.notion.com/v1/pages",
        {
          parent: { database_id: process.env.NOTION_DATABASE_ID },
          properties: {
            "Task Name": { title: [{ text: { content: taskData.name } }] },
            "Start Date": { date: { start: taskData.startDate } },
            "End Date": { date: { start: taskData.endDate } },
            "Task Steps": { 
              relation: stepIds,
            },
          },
        },
        {
          headers: {
            ...notionHeaders,
            'Notion-Version': '2022-06-28',
          }
        }
      );
  
      // Send a response back to the frontend
      res.json(response.data);
    } catch (error) {
      console.error("Error creating task:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Failed to create task", details: error.response ? error.response.data : error.message });
    }
  });

  // endpoint to edit tasks
  app.patch('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { name, startDate, endDate, steps } = req.body;

    const stepIds = []; // Store step IDs for relation updates

    try {
        // Update or create steps
        for (const step of steps) {
            if (step.id) {
                // Update existing step
                await axios.patch(
                    `https://api.notion.com/v1/pages/${step.id}`,
                    {
                        properties: {
                            "Step Name": { title: [{ text: { content: step.name } }] },
                            "Due Date": { date: { start: step.date } },
                        },
                    },
                    {
                        headers: {
                            ...notionHeaders,
                            'Notion-Version': '2022-06-28',
                        },
                    }
                );
                stepIds.push({ id: step.id });
            } else {
                // Create new step
                const stepResponse = await axios.post(
                    "https://api.notion.com/v1/pages",
                    {
                        parent: { database_id: process.env.NOTION_STEP_DATABASE_ID },
                        properties: {
                            "Step Name": { title: [{ text: { content: step.name } }] },
                            "Due Date": { date: { start: step.date } },
                        },
                    },
                    {
                        headers: {
                            ...notionHeaders,
                            'Notion-Version': '2022-06-28',
                        },
                    }
                );
                stepIds.push({ id: stepResponse.data.id });
            }
        }

        // Update the task with new properties and step relations
        const taskUpdateData = {
            properties: {
                "Task Name": { title: [{ text: { content: name } }] },
                "Start Date": { date: { start: startDate } },
                "End Date": { date: { start: endDate } },
                "Task Steps": { relation: stepIds }, // Update relation with step IDs
            },
        };

        const response = await axios.patch(
            `https://api.notion.com/v1/pages/${taskId}`,
            taskUpdateData,
            {
                headers: {
                    ...notionHeaders,
                    'Notion-Version': '2022-06-28',
                },
            }
        );

        res.status(200).json({ message: 'Task updated successfully', data: response.data });
    } catch (error) {
        console.error('Error updating task: ', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Endpoint to delete (archive) a task and its related steps
app.patch('/api/tasks/:taskId/archive', async (req, res) => {
  const { taskId } = req.params;

  try {
      // Fetch the task to get its related steps
      const taskResponse = await axios.get(
          `https://api.notion.com/v1/pages/${taskId}`,
          {
              headers: {
                  ...notionHeaders,
                  'Notion-Version': '2022-06-28',
              },
          }
      );

      const relatedSteps = taskResponse.data.properties["Task Steps"]?.relation || [];

      // Archive each related step
      for (const step of relatedSteps) {
          await axios.patch(
              `https://api.notion.com/v1/pages/${step.id}`,
              { archived: true },
              {
                  headers: {
                      ...notionHeaders,
                      'Notion-Version': '2022-06-28',
                  },
              }
          );
      }

      // Archive the task itself
      const taskArchiveResponse = await axios.patch(
          `https://api.notion.com/v1/pages/${taskId}`,
          { archived: true },
          {
              headers: {
                  ...notionHeaders,
                  'Notion-Version': '2022-06-28',
              },
          }
      );

      res.status(200).json({ message: 'Task and related steps archived successfully', data: taskArchiveResponse.data });
  } catch (error) {
      console.error('Error archiving task or steps:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to archive task and related steps' });
  }
});
// endpoint to get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {}, // empty body for query tasks
      { headers : {
        ...notionHeaders,
        'Notion-Version': '2022-06-28',
        },
      }
    );

    // send response back to front end
    res.json(response.data.results);
  } catch (error) {
    console.error("Error retrieving tasks: ", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Endpoint to get step details
app.get('/api/steps/:stepId', async (req, res) => {
  const { stepId } = req.params;

  try {
    const response = await axios.get(
      `https://api.notion.com/v1/pages/${stepId}`,
      {
        headers: {
          ...notionHeaders,
          'Notion-Version': '2022-06-28',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching step details:', error);
    res.status(500).json({ error: 'Failed to fetch step details' });
  }
});

// endpoint to get all tasks from step database
app.get("/api/steps", async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${process.env.NOTION_STEP_DATABASE_ID}/query`,
      {},  
      {
        headers: {
          ...notionHeaders,
          'Notion-Version': '2022-06-28',  
        },
      }
    );

    // If no results are found, return an empty array
    const tasks = response.data.results.map(task => ({
      name: task.properties["Step Name"].title[0]?.text.content || "Unnamed Task", 
      date: task.properties["Due Date"]?.date?.start || null,  
    }));

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching steps:", error);
    res.status(500).json({ error: "Failed to fetch steps" });
  }
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Adjust the path to your index.html
});

// Start the server and open the Google OAuth consent screen
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  exec(`open http://localhost:${port}/auth`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
});
