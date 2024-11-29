require ("dotenv").config(); // load environment variables from .env

const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

const cors = require('cors');
app.use(cors()); // Allow all domains (or configure it for specific domains)

// middleware to parse JSON
app.use(express.json());

// set up Notion API headers with integration token
const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  'Content-type': 'application/json',
};
const databaseId = process.env.NOTION_DATABASE_ID;

// Endpoint to create a task in Notion
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
      // Step 1: Fetch the task to get its related steps
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

      // Step 2: Archive each related step
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

      // Step 3: Archive the task itself
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


// start the server
app.listen(PORT, () => {
  console.log(`Server is runing on http://localhost: ${PORT}`);
})