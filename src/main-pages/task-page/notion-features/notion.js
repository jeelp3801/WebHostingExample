// Base URL for Notion API
const BASE_URL = 'https://api.notion.com/v1';
const API_KEY = process.env.NOTION_API_KEY;

// common headers for Notion API requests
const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28" // check version date
};

/**
 * Fetch tasks from Notion database.
 * @param {string} databasId - The id of the Notion database to fetch tasks from.
 * @returns {Promise<Array>} - An array of task objects from Notion
 */
const fetchTasks = async (databaseId) => {
    try {
        const response = await fetch(`${BASE_URL}/databases/${databaseId}/query`, {
            method: 'POST',
            headers: headers
        });
        const data = await response.json();
        return data.results; // Notion API returns results in a 'results' array
     } catch (error) {
        console.error("Error fetching tasks: ", error);
        return { error: "Failed to fetch tasks" }; 
     }
};

/**
 * Create a new task in the Notion database
 * @param {string} databaseId - The ID of the Notion database
 * @param {Object} taskData - Object containing task details to be added
 * @returns {Promise<Object} - Created task object
 */
const createTask = async (databaseId, taskData) => {
    try {
        const response = await fetch(`${BASE_URL}/pages`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                parent: { database_id: databaseId},
                properties: taskData // Notion properties must match database schema
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating task: " , error);
        return { error: "Failed to create task" };
    }
};

/**
 *  Update an exisitng task in the Notion database
 * @param {string} pageId - The ID of the page (task) to update.
 * @param {Object} updateData - Object with updated task details
 * @returns {Promise<Object>} - Updated task object.
 */
const updateTask = async (pageId, updatedData) => {
    try {
        const reponse = await fetch(`${BASE_URL}/pages/${pageId}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({
                properties: updatedData //update specific properties based on task schema
            })
        });
        const data = await reponse.json();
        return data;
    } catch (error) {
        console.error("Error updating task:", error);
        return { error: "Failed to update task" };
    }
};

/**
 * Delete a task from the Notion database
 * Note: Notion API doesn't directly support deletion, we set a property to
 * "archive" or "completed".
 * @param {string} pageId - the ID of the page (task) to "delete".
 * @returns {Promise<Object>} - Result of deletion (archived task)
 */
const deleteTask = async (pageId) => {
    try{
        const reponse = await fetch(`${BASE_URL}/pages/${pageId}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({
                archived: true // archiving task instead of deleting
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting (archiving) task: ", error);
        return { error: "Failed to delete (archive) task" };
    }
};


module.exports = { fetchTasks, createTask, updateTask, deleteTask };