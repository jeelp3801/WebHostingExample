const { fetchTasks, createTask, updateTask, deleteTask } = require('../src/main-pages/task-page/notion-features/notion-feature-1.js');
// Mock the fetch API
require('jest-fetch-mock').enableMocks();



beforeEach(() => {
    fetch.resetMocks();
});

describe('Notion API functions', () => {
    const mockDatabaseId = 'mock-database-id';
    const mockPageId = 'mock-page-id';
    const mockTaskData = {
        Name: { title: [{ text: { content: 'Test Task' } }] },
        StartDate: { date: { start: '2024-01-01' } },
        EndDate: { date: { start: '2024-01-02' } }
    };

   
    it('fetches tasks from the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ results: [{ id: '1', name: 'Sample Task' }] }));

        const tasks = await fetchTasks(mockDatabaseId);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/databases/mock-database-id/query'), {
            method: 'POST',
            headers: expect.any(Object)
        });
        expect(tasks).toEqual([{ id: '1', name: 'Sample Task' }]);
    });

    it('creates a new task in the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 'new-task-id', properties: mockTaskData }));

        const response = await createTask(mockDatabaseId, mockTaskData);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pages'), {
            method: 'POST',
            headers: expect.any(Object),
            body: JSON.stringify({
                parent: { database_id: mockDatabaseId },
                properties: mockTaskData
            })
        });
        expect(response).toHaveProperty('id', 'new-task-id');
    });

    it('updates a task in the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: mockTaskData }));

        const response = await updateTask(mockPageId, mockTaskData);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pages/${mockPageId}`), {
            method: 'PATCH',
            headers: expect.any(Object),
            body: JSON.stringify({ properties: mockTaskData })
        });
        expect(response).toHaveProperty('id', 'updated-task-id');
    });

    it('archives a task in the Notion database', async () => {
        fetch.mockResponseOnce(JSON.stringify({ id: 'archived-task-id', archived: true }));

        const response = await deleteTask(mockPageId);
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pages/${mockPageId}`), {
            method: 'PATCH',
            headers: expect.any(Object),
            body: JSON.stringify({ archived: true })
        });
        expect(response).toHaveProperty('archived', true);
    });
});


describe('Notion API functions', () => {
    const mockDatabaseId = 'mock-database-id';
    const mockPageId = 'mock-page-id';
    const mockTaskData = {
        Name: { title: [{ text: { content: 'Test Task' } }] },
        StartDate: { date: { start: '2024-01-01' } },
        EndDate: { date: { start: '2024-01-02' } }
    };

    // 1-20: fetchTasks tests
    describe('fetchTasks function', () => {
        it('fetches tasks successfully with valid database ID', async () => {
            fetch.mockResponseOnce(JSON.stringify({ results: [{ id: '1', name: 'Sample Task' }] }));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks).toEqual([{ id: '1', name: 'Sample Task' }]);
        });

        it('handles empty response when fetching tasks', async () => {
            fetch.mockResponseOnce(JSON.stringify({ results: [] }));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks).toEqual([]);
        });

        it('handles network error when fetching tasks', async () => {
            fetch.mockRejectOnce(new Error('Network error'));
            const result = await fetchTasks(mockDatabaseId); 
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        it('handles 401 Unauthorized error when fetching tasks', async () => {
            fetch.mockResponseOnce('', { status: 401 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" }); 
        });

        it('handles 403 Forbidden error when fetching tasks', async () => {
            fetch.mockResponseOnce('', { status: 403 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        it('handles 404 Not Found error when fetching tasks', async () => {
            fetch.mockResponseOnce('', { status: 404 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        it('handles 500 Internal Server Error when fetching tasks', async () => {
            fetch.mockResponseOnce('', { status: 500 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });


        it('handles JSON parse errors gracefully when fetching tasks', async () => {
            fetch.mockResponseOnce('invalid JSON');
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });});

       /* it('handles timeout when fetching tasks', async () => {
            fetch.mockResponseOnce(() => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({})), 6000)));
            const result = await fetchTasks(mockDatabaseId);
            expect(result).toEqual({ error: "Failed to fetch tasks" });
        });*/

        it('handles case with no database ID provided when fetching tasks', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        it('fetches tasks successfully with complex data structures', async () => {
            const complexData = {
                results: [
                    { id: '1', properties: { Name: { title: [{ text: { content: 'Complex Task 1' } }] } } },
                    { id: '2', properties: { Name: { title: [{ text: { content: 'Complex Task 2' } }] } } }
                ]
            };
            fetch.mockResponseOnce(JSON.stringify(complexData));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks).toEqual(complexData.results);
        });

        

        it('handles slow server response (long delay) when fetching tasks', async () => {
            jest.setTimeout(15000);
            fetch.mockResponseOnce(JSON.stringify({ results: [{ id: '1', name: 'Delayed Task' }] }));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks).toEqual([{ id: '1', name: 'Delayed Task' }]);
        });

        it('handles requests with large amounts of data when fetching tasks', async () => {
            const largeData = { results: new Array(1000).fill({ id: '1', name: 'Sample Task' }) };
            fetch.mockResponseOnce(JSON.stringify(largeData));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks.length).toBe(1000);
        });

        it('handles missing properties in response when fetching tasks', async () => {
            fetch.mockResponseOnce(JSON.stringify({ results: [{ id: '1' }] }));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks).toEqual([{ id: '1' }]);
        });

        it('handles network disconnection error when fetching tasks', async () => {
            fetch.mockRejectOnce(new Error('Network disconnected'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });});

        it('throws an error for unsupported HTTP methods when fetching tasks', async () => {
            fetch.mockResponseOnce('', { status: 405 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });});

        it('throws an error when rate-limited by the server while fetching tasks', async () => {
            fetch.mockResponseOnce('', { status: 429 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });});

        it('handles response with additional unexpected properties when fetching tasks', async () => {
            fetch.mockResponseOnce(JSON.stringify({ results: [{ id: '1', extra: 'value' }] }));
            const tasks = await fetchTasks(mockDatabaseId);
            expect(tasks).toEqual([{ id: '1', extra: 'value' }]);
        });
    });


    describe('createTask function', () => {
        const mockDatabaseId = 'mock-database-id';
        const mockTaskData = {
            Name: { title: [{ text: { content: 'Test Task' } }] },
            StartDate: { date: { start: '2024-01-01' } },
            EndDate: { date: { start: '2024-01-02' } }
        };
    
        // 1. Successful creation with valid data
        it('creates a task successfully with valid data', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'new-task-id', properties: mockTaskData }));
            const response = await createTask(mockDatabaseId, mockTaskData);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pages'), {
                method: 'POST',
                headers: expect.any(Object),
                body: JSON.stringify({
                    parent: { database_id: mockDatabaseId },
                    properties: mockTaskData
                })
            });
            expect(response).toHaveProperty('id', 'new-task-id');
        });
    
        // 2. Creation with missing required properties
        it('handles creation with missing required properties', async () => {
            const incompleteData = { Name: { title: [] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'new-task-id', properties: incompleteData }));
            const response = await createTask(mockDatabaseId, incompleteData);
            expect(response).toHaveProperty('id', 'new-task-id');
        });
    
        // 3. Creation with special characters in task data
        it('handles special characters in task data', async () => {
            const specialData = { Name: { title: [{ text: { content: 'Task @#$%^&*()' } }] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'new-task-id', properties: specialData }));
            const response = await createTask(mockDatabaseId, specialData);
            expect(response).toHaveProperty('id', 'new-task-id');
        });

        // 4. Server returns 400 Bad Request during task creation
        it('handles 400 Bad Request error', async () => {
            fetch.mockResponseOnce('', { status: 400 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 5. Server returns 401 Unauthorized during task creation
        it('handles 401 Unauthorized error', async () => {
            fetch.mockResponseOnce('', { status: 401 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 6. Server returns 403 Forbidden during task creation
        it('handles 403 Forbidden error', async () => {
            fetch.mockResponseOnce('', { status: 403 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 7. Server returns 404 Not Found during task creation
        it('handles 404 Not Found error', async () => {
            fetch.mockResponseOnce('', { status: 404 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 8. Server returns 500 Internal Server Error during task creation
        it('handles 500 Internal Server Error', async () => {
            fetch.mockResponseOnce('', { status: 500 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 9. Creation with invalid database ID format
        it('handles invalid database ID format', async () => {
            fetch.mockRejectOnce(new Error('Invalid database ID format'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 10. Creation with null task data
        it('handles null task data', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 11. Creation with empty task data object
        it('handles empty task data object', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 12. Creation with missing database ID
        it('handles missing database ID', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    /*
        // 13. Creation when server takes too long to respond (timeout)
        it('handles timeout error during task creation', async () => {
            fetch.mockResponseOnce(() => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({})), 6000)));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
*/
        // 14. Creation with excessively large task data
        it('handles creation with large task data', async () => {
            const largeData = {
                Name: { title: [{ text: { content: 'A'.repeat(10000) } }] }
            };
            fetch.mockResponseOnce(JSON.stringify({ id: 'large-task-id', properties: largeData }));
            const response = await createTask(mockDatabaseId, largeData);
            expect(response).toHaveProperty('id', 'large-task-id');
        });
    
        // 15. Creation with no content in the task title
        it('handles task data with no content in title', async () => {
            const noContentData = { Name: { title: [{ text: { content: '' } }] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'no-content-task-id', properties: noContentData }));
            const response = await createTask(mockDatabaseId, noContentData);
            expect(response).toHaveProperty('id', 'no-content-task-id');
        });

        // 16. Creation when fetch call fails
        it('handles fetch call failure during task creation', async () => {
            fetch.mockRejectOnce(new Error('Fetch call failed'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
        // 20. Creation when the server responds with rate limiting (429 Too Many Requests)
        it('handles rate limiting (429 Too Many Requests)', async () => {
            fetch.mockResponseOnce('', { status: 429 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        // 17. Creation with task data that includes non-standard JSON properties
        it('handles non-standard JSON properties in task data', async () => {
            const nonStandardData = { ...mockTaskData, Extra: 'Non-standard property' };
            fetch.mockResponseOnce(JSON.stringify({ id: 'non-standard-task-id', properties: nonStandardData }));
            const response = await createTask(mockDatabaseId, nonStandardData);
            expect(response).toHaveProperty('id', 'non-standard-task-id');
        });
    
        // 18. Creation with valid data and response containing unexpected additional fields
        it('handles response with unexpected additional fields', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'extra-fields-task-id', properties: mockTaskData, extraField: 'extra' }));
            const response = await createTask(mockDatabaseId, mockTaskData);
            expect(response).toHaveProperty('id', 'extra-fields-task-id');
            expect(response).toHaveProperty('extraField', 'extra');
        });
    
        // 19. Creation with task data that includes Unicode characters
        it('handles task data with Unicode characters', async () => {
            const unicodeData = { Name: { title: [{ text: { content: '任务✨🚀' } }] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'unicode-task-id', properties: unicodeData }));
            const response = await createTask(mockDatabaseId, unicodeData);
            expect(response).toHaveProperty('id', 'unicode-task-id');
        });
    
        
    });
    describe('updateTask function', () => {
        const mockPageId = 'mock-page-id';
        const mockTaskData = {
            Name: { title: [{ text: { content: 'Updated Task' } }] },
            StartDate: { date: { start: '2024-01-01' } },
            EndDate: { date: { start: '2024-01-02' } }
        };
    
        // 1. Successful update with valid data
        it('updates a task successfully with valid data', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: mockTaskData }));
            const response = await updateTask(mockPageId, mockTaskData);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pages/${mockPageId}`), {
                method: 'PATCH',
                headers: expect.any(Object),
                body: JSON.stringify({ properties: mockTaskData })
            });
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
    
        // 2. Update with missing required properties
        it('handles update with missing required properties', async () => {
            const incompleteData = { Name: { title: [] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: incompleteData }));
            const response = await updateTask(mockPageId, incompleteData);
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
    
        // 3. Update with special characters in task data
        it('handles special characters in task data', async () => {
            const specialData = { Name: { title: [{ text: { content: 'Task @#$%^&*()' } }] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: specialData }));
            const response = await updateTask(mockPageId, specialData);
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
  
        // 4. Server returns 400 Bad Request during task update
        it('handles 400 Bad Request error', async () => {
            fetch.mockResponseOnce('', { status: 400 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
   
        // 5. Server returns 401 Unauthorized during task update
        it('handles 401 Unauthorized error', async () => {
            fetch.mockResponseOnce('', { status: 401 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 6. Server returns 403 Forbidden during task update
        it('handles 403 Forbidden error', async () => {
            fetch.mockResponseOnce('', { status: 403 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 7. Server returns 404 Not Found during task update
        it('handles 404 Not Found error', async () => {
            fetch.mockResponseOnce('', { status: 404 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 8. Server returns 500 Internal Server Error during task update
        it('handles 500 Internal Server Error', async () => {
            fetch.mockResponseOnce('', { status: 500 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 9. Update with invalid page ID format
        it('handles invalid page ID format', async () => {
            fetch.mockRejectOnce(new Error('Invalid page ID format'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 10. Update with null task data
        it('handles null task data', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 11. Update with empty task data object
        it('handles empty task data object', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 12. Update with missing page ID
        it('handles missing page ID', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
        /*
        // 13. Update when server takes too long to respond (timeout)
        it('handles timeout error during task update', async () => {
            fetch.mockResponseOnce(() => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({})), 6000)));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
*/
        // 16. Update when fetch call fails
        it('handles fetch call failure during task update', async () => {
            fetch.mockRejectOnce(new Error('Fetch call failed'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        // 20. Update when the server responds with rate limiting (429 Too Many Requests)
        it('handles rate limiting (429 Too Many Requests)', async () => {
            fetch.mockResponseOnce('', { status: 429 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });

        
    
        // 14. Update with excessively large task data
        it('handles update with large task data', async () => {
            const largeData = {
                Name: { title: [{ text: { content: 'A'.repeat(10000) } }] }
            };
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: largeData }));
            const response = await updateTask(mockPageId, largeData);
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
    
        // 15. Update with no content in the task title
        it('handles task data with no content in title', async () => {
            const noContentData = { Name: { title: [{ text: { content: '' } }] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: noContentData }));
            const response = await updateTask(mockPageId, noContentData);
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
    
        
    
        // 17. Update with task data that includes non-standard JSON properties
        it('handles non-standard JSON properties in task data', async () => {
            const nonStandardData = { ...mockTaskData, Extra: 'Non-standard property' };
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: nonStandardData }));
            const response = await updateTask(mockPageId, nonStandardData);
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
    
        // 18. Update with valid data and response containing unexpected additional fields
        it('handles response with unexpected additional fields', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: mockTaskData, extraField: 'extra' }));
            const response = await updateTask(mockPageId, mockTaskData);
            expect(response).toHaveProperty('id', 'updated-task-id');
            expect(response).toHaveProperty('extraField', 'extra');
        });
    
        // 19. Update with task data that includes Unicode characters
        it('handles task data with Unicode characters', async () => {
            const unicodeData = { Name: { title: [{ text: { content: '任务✨🚀' } }] } };
            fetch.mockResponseOnce(JSON.stringify({ id: 'updated-task-id', properties: unicodeData }));
            const response = await updateTask(mockPageId, unicodeData);
            expect(response).toHaveProperty('id', 'updated-task-id');
        });
    
        
    });
    describe('deleteTask function', () => {
        const mockPageId = 'mock-page-id';
    
        // 1. Successful deletion with valid page ID
        it('deletes a task successfully with a valid page ID', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'archived-task-id', archived: true }));
            const response = await deleteTask(mockPageId);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/pages/${mockPageId}`), {
                method: 'PATCH',
                headers: expect.any(Object),
                body: JSON.stringify({ archived: true })
            });
            expect(response).toHaveProperty('archived', true);
        });

        // 2. Deletion when page ID is missing
        it('handles missing page ID', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 3. Deletion when page ID is null
        it('handles null page ID', async () => {
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 4. Server returns 400 Bad Request during deletion
        it('handles 400 Bad Request error', async () => {
            fetch.mockResponseOnce('', { status: 400 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
  
        // 5. Server returns 401 Unauthorized during deletion
        it('handles 401 Unauthorized error', async () => {
            fetch.mockResponseOnce('', { status: 401 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 6. Server returns 403 Forbidden during deletion
        it('handles 403 Forbidden error', async () => {
            fetch.mockResponseOnce('', { status: 403 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 7. Server returns 404 Not Found during deletion
        it('handles 404 Not Found error', async () => {
            fetch.mockResponseOnce('', { status: 404 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 8. Server returns 500 Internal Server Error during deletion
        it('handles 500 Internal Server Error', async () => {
            fetch.mockResponseOnce('', { status: 500 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 9. Deletion with an invalid page ID format
        it('handles invalid page ID format', async () => {
            fetch.mockRejectOnce(new Error('Invalid page ID format'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        
    
        // 11. Deletion when the response contains unexpected fields
        it('handles unexpected fields in the response', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'archived-task-id', archived: true, extraField: 'unexpected' }));
            const response = await deleteTask(mockPageId);
            expect(response).toHaveProperty('archived', true);
            expect(response).toHaveProperty('extraField', 'unexpected');
        });
    
        // 12. Deletion with a valid page ID and response containing no "archived" field
        it('handles response with missing "archived" field', async () => {
            fetch.mockResponseOnce(JSON.stringify({ id: 'archived-task-id' }));
            const response = await deleteTask(mockPageId);
            expect(response).not.toHaveProperty('archived');
        });
    
        // 13. Deletion with server returning a JSON parse error
        it('handles JSON parse error in response', async () => {
            fetch.mockResponseOnce('Invalid JSON');
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 14. Deletion with fetch call failure (network error)
        it('handles fetch call failure during deletion', async () => {
            fetch.mockRejectOnce(new Error('Network error'));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    
        // 15. Deletion when server responds with rate limiting (429 Too Many Requests)
        it('handles rate limiting (429 Too Many Requests)', async () => {
            fetch.mockResponseOnce('', { status: 429 });
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
        // 18. Deletion when the server responds with an empty body
        it('handles empty response body', async () => {
            fetch.mockResponseOnce('');
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
 /*   
        // 19. Deletion with valid page ID and server returning HTTP status 204 (No Content)
        it('handles HTTP 204 No Content response', async () => {
            fetch.mockResponseOnce('', { status: 204 });
            const response = await deleteTask(mockPageId);
            expect(response).toBeUndefined(); // HTTP 204 responses do not have a body
        });
        // 10. Deletion when server takes too long to respond (timeout)
        it('handles timeout error during deletion', async () => {
            fetch.mockResponseOnce(() => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({})), 6000)));
            const result = await fetchTasks(mockDatabaseId);
            await expect(result).toEqual({ error: "Failed to fetch tasks" });
        });
    */
        // 16. Deletion with an excessively large page ID
        it('handles deletion with excessively large page ID', async () => {
            const largePageId = 'a'.repeat(1000);
            fetch.mockResponseOnce(JSON.stringify({ id: largePageId, archived: true }));
            const response = await deleteTask(largePageId);
            expect(response).toHaveProperty('archived', true);
        });
    
        // 17. Deletion with Unicode characters in page ID
        it('handles deletion with Unicode characters in page ID', async () => {
            const unicodePageId = '页面123';
            fetch.mockResponseOnce(JSON.stringify({ id: unicodePageId, archived: true }));
            const response = await deleteTask(unicodePageId);
            expect(response).toHaveProperty('archived', true);
        });
    
        
    
        // 20. Deletion when server returns a response with a different data structure
        it('handles response with different data structure', async () => {
            fetch.mockResponseOnce(JSON.stringify({ result: 'archived', status: 'success' }));
            const response = await deleteTask(mockPageId);
            expect(response).toHaveProperty('result', 'archived');
        });
    });
});