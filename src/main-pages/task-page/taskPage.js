let currentSlide = 0;
let currentDayIndex = 0;
const days = [
    "sunday-popup",
    "monday-popup",
    "tuesday-popup",
    "wednesday-popup",
    "thursday-popup",
    "friday-popup",
    "saturday-popup"
]

document.addEventListener("DOMContentLoaded", () => {
    fetchTasksForDisplay();
    updateDisplay();
    fetchTasksForDayDisplay();
})

// for all tasks/timer
function slideNext() {
    const slider = document.getElementById('main-section').querySelector('.slider');

    // toggle between the slides
    currentSlide = (currentSlide + 1) % 2;
    slider.style.transform = `translateX(-${currentSlide * 50}%)`;
}

function hideAlldays() {
    days.forEach(day => {
        document.getElementById(day).style.display = "none";
    })
}

function showDay(dayIndex) {
    // show div for current day
    document.getElementById(days[dayIndex]).style.display = "block";
}

function nextDay() {
    // move to next day, loop around at the end of the week
    currentDayIndex = (currentDayIndex + 1) % days.length;
    updateDisplay();
}

function previousDay() {
    // move to previous day, oop around start of the week
    currentDayIndex = (currentDayIndex - 1 + days.length) % days.length;
    updateDisplay();
}

function updateDisplay() {
    hideAlldays();
    showDay(currentDayIndex);
}

window.onload = function() {
    const currentHour = new Date().getHours();
    const messageElement = document.getElementById('message');
    const dateElement = document.getElementById('date');

    // set time-based message
    if(currentHour >= 5 && currentHour < 12) {
        messageElement.textContent = "Good morning!";
    } else if (currentHour >= 12 && currentHour < 17) {
        messageElement.textContent = "Good afternoon!";
    } else if (currentHour >= 17 && currentHour < 21) {
        messageElement.textContent = "Good evening!";
    } else {
        messageElement.textContent = "Good night!";
    }

    // set current date
    const currentDate = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString(undefined, options);
    dateElement.textContent = `Today is ${formattedDate}!`;
}

// fetch tasks from notion database for task list
async function fetchTasksForDisplay(stepId) {
    try {
        const response = await fetch("http://localhost:3000/tasks");
        if(response.ok) {
            const tasks = await response.json();
            console.log("Fetched tasks:", tasks); 
            displayTasks(tasks);
        } else {
            console.error("Failed to load tasks.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

function displayTasks(tasks) {
    const tasksContainer = document.getElementById('all-tasks');
    tasksContainer.innerHTML = "";

    const ul = document.createElement("ul");

    tasks.forEach(task => {
        const taskName = task.properties["Task Name"]?.title[0]?.text?.content || "Unnamed Task";
        const endDate = task.properties["End Date"]?.date?.start || "No End Date";
        const taskElement = document.createElement("li");
        const taskHeading = document.createElement("h3");
        
        taskHeading.textContent = taskName;
        taskElement.appendChild(taskHeading);

        const taskDueDate = document.createElement("p");
        taskDueDate.textContent = `Due on: ${endDate}`;
        taskElement.appendChild(taskDueDate);

        ul.appendChild(taskElement);
    });

    tasksContainer.append(ul);
}

// display task steps by day for the current week
async function fetchTasksForDayDisplay() {
    try {
        const response = await axios.get('http://localhost:3000/api/steps/');
        const tasks = response.data;

        console.log('Fetched task steps: ', tasks);

        // Ensure tasks is an array
        if (Array.isArray(tasks)) {
            displayTasksByDay(tasks);
        } else {
            console.error('Fetched data is not an array:', tasks);
        }

    } catch (error) {
        console.error('Error fetching step details:', error);
    }
}

function formatDateToLocal(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString); // Parse as local time
  return date.toISOString().split('T')[0]; // Output in YYYY-MM-DD
}

function getCurrentWeekDates() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDates.push(formatDateToLocal(day.toISOString())); 
    }

    return weekDates;
}


function displayTasksByDay(tasks) {
    try {
        const currentWeekDates = getCurrentWeekDates();  
        console.log('Current Week Dates:', currentWeekDates);

        const tasksByDay = {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
        };

        tasks.forEach(task => {
            const localDateString = formatDateToLocal(task.date);
            const dayOfWeek = new Date(localDateString).toLocaleString('en-us', { timeZone: 'UTC', weekday: 'long' }).toLowerCase();

            console.log(`Task Date: ${task.date}, Local Date: ${localDateString}, Day of Week: ${dayOfWeek}`);
            
            if (currentWeekDates.includes(localDateString)) {
                if (tasksByDay[dayOfWeek]) {
                    tasksByDay[dayOfWeek].push(task);
                }
            }
        });
        

        console.log('Tasks by day:', tasksByDay);
        displayDayTasksInPopup('sunday', tasksByDay['sunday'], currentWeekDates[0]);
        displayDayTasksInPopup('monday', tasksByDay['monday'], currentWeekDates[1]);
        displayDayTasksInPopup('tuesday', tasksByDay['tuesday'], currentWeekDates[2]);
        displayDayTasksInPopup('wednesday', tasksByDay['wednesday'], currentWeekDates[3]);
        displayDayTasksInPopup('thursday', tasksByDay['thursday'], currentWeekDates[4]);
        displayDayTasksInPopup('friday', tasksByDay['friday'], currentWeekDates[5]);
        displayDayTasksInPopup('saturday', tasksByDay['saturday'], currentWeekDates[6]);
    } catch (error) {
        console.error('Error displaying tasks by day:', error);
    }
}

// display tasks in popup for a specific day
function displayDayTasksInPopup(day, tasks, date) {
    const popupContainer = document.querySelector(`#${day}-popup`);
    popupContainer.innerHTML = '';

     // Display the date for the day
     const dateElement = document.createElement('h3');
     dateElement.classList.add('task-day-date');
     dateElement.textContent = `${date}`; 
     popupContainer.appendChild(dateElement);

    if(tasks.length > 0) {
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('task-item');
            taskElement.textContent = task.name;
            console.log('Task date from Notion:', task.date);
            popupContainer.appendChild(taskElement);
            
        });
    } else {
        const noTasksMessage = document.createElement('div');
        noTasksMessage.classList.add('no-tasks');
        noTasksMessage.textContent = 'No tasks for this day';
        popupContainer.appendChild(noTasksMessage);
    }



}

// edit and delete popup windows
function openEditPopup() {
   document.getElementById('popupOverlayEdit').style.display = 'block';
   document.getElementById('edit-popup').style.display = 'block';
   loadTasksForEdit();
}

function closeEditPopup() {
    document.getElementById('popupOverlayEdit').style.display = 'none';
    document.getElementById('edit-popup').style.display = 'none';
}

function openDeletePopup() {
    document.getElementById('popupOverlayDelete').style.display = 'block';
    document.getElementById('delete-popup').style.display = 'block';
    loadTasksForDelete();
 }
 
 function closeDeletePopup() {
    document.getElementById('popupOverlayDelete').style.display = 'none';
    document.getElementById('delete-popup').style.display = 'none';
 }

// display tasks in delete popup to delete
async function loadTasksForDelete() {
    try {
        const response = await fetch("http://localhost:3000/tasks");
        if (response.ok) {
            const tasks = await response.json();
            displayTasksForDeletePopup(tasks);
        } else {
            console.error("Failed to load tasks for deletion.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// display tasks in edit popup to edit
async function loadTasksForEdit() {
    try {
        const response = await fetch("http://localhost:3000/tasks");
        if(response.ok) {
            const tasks = await response.json();
            console.log("Fetched tasks:", tasks); 
            displayTasksInPopup(tasks);
        } else {
            console.error("Failed to load tasks.");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// get details for each step for tasks to edit
async function fetchStepDetails(stepId) {
    try {
        const response = await axios.get('http://localhost:3000/api/steps/' + stepId);
        return response.data;
    } catch (error) {
        console.error('Error fetching step details:', error);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];  // 'YYYY-MM-DD'
}

// display tasks in popup for editing
let editedFields = {};
async function displayTasksInPopup(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    // Loop through each task
    for (const task of tasks) {
        // Accessing properties from Notion
        const name = task.properties["Task Name"] ? task.properties["Task Name"].title[0].text.content : '';
        const startDate = task.properties["Start Date"] && task.properties["Start Date"].date ? formatDate(task.properties["Start Date"].date.start) : '';
        const endDate = task.properties["End Date"] && task.properties["End Date"].date ? formatDate(task.properties["End Date"].date.start) : '';
        const stepIds = task.properties["Task Steps"] ? task.properties["Task Steps"].relation : [];

        // Fetch step details if they exist
        const steps = await Promise.all(
            stepIds.map(async stepId => {
                const stepDetails = await fetchStepDetails(stepId.id); // Fetch each step's details by ID
                return {
                    name: stepDetails.properties["Step Name"] ? stepDetails.properties["Step Name"].title[0].text.content : '',
                    date: stepDetails.properties["Due Date"] ? stepDetails.properties["Due Date"].date.start : '',
                };
            })
        );
        
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';

        taskDiv.innerHTML = `
            <input type="text" value="${name}" id="name-${task.id}" data-task-id="${task.id}" data-field="name" placeholder="Task Name">
            <input type="date" value="${startDate}" id="startDate-${task.id}" data-task-id="${task.id}" data-field="startDate">
            <input type="date" value="${endDate}" id="endDate-${task.id}" data-task-id="${task.id}" data-field="endDate">
            <div id="steps-${task.id}">
                ${steps.map((step, index) => `
                    <input type="text" value="${step.name}" id="stepName-${task.id}-${index}" data-task-id="${task.id}" data-step-id="${index}" data-field="stepName" placeholder="Step Name">
                    <input type="date" value="${formatDate(step.date)}" id="stepDate-${task.id}-${index}" data-task-id="${task.id}" data-step-id="${index}" data-field="stepDate">
                `).join('')}
            </div>
            <button onclick="saveTask('${task.id}')" id="saveButton-${task.id}" style="display: none;">Save</button>
        `;

        // Append task to the task list
        taskList.appendChild(taskDiv);

        // Attach change event listeners to track edits
        taskDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', function () {
                const taskId = input.dataset.taskId;
                const field = input.dataset.field;
                const stepId = input.dataset.stepId;
                const value = input.value;

                // Initialize the task object in editedFields if it doesn't exist
                if (!editedFields[taskId]) {
                    editedFields[taskId] = { steps: [] };
                }

                // Check if the edited field is a step or a task field
                if (stepId !== undefined) {
                    // Initialize the steps array if it doesn't exist
                    if (!editedFields[taskId].steps[stepId]) {
                        editedFields[taskId].steps[stepId] = {};
                    }
                    editedFields[taskId].steps[stepId][field] = value;
                } else {
                    editedFields[taskId][field] = value;
                }

                // Show the "Save" button for this task
                document.getElementById(`saveButton-${taskId}`).style.display = 'inline-block';
            });
        });
    }
}

// delete task - notion api does not support deleting directly, must archive task
async function deleteTask(taskId) {
    const confirmation = confirm('Are you sure you want to archive this task?');
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/archive`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                archived: true,
            }),
        });
    
        if (response.ok) {
            alert('Task archived successfully');
            fetchTasksForDisplay(); // Refresh the task list
        } else {
            alert('Failed to archive task');
        }
    } catch (error) {
        console.error("Error archiving task:", error);
    }
}

async function saveTask(taskId) {
    console.log("Task ID:", taskId); 
    if (!taskId) {
        console.error("Task ID is undefined");
        alert("Task ID is missing. Please try again.");
        return;
    }
    const name = document.getElementById(`name-${taskId}`).value;
    const startDate = document.getElementById(`startDate-${taskId}`).value;
    const endDate = document.getElementById(`endDate-${taskId}`).value;

    // Collect steps
    const stepsDiv = document.getElementById(`steps-${taskId}`);
    const stepInputs = stepsDiv.querySelectorAll('input');
    const steps = [];
    for (let i = 0; i < stepInputs.length; i += 2) {
        const stepName = stepInputs[i].value;
        const stepDate = stepInputs[i + 1].value;
        if (stepName && stepDate) {
            steps.push({ name: stepName, date: stepDate });
        }
    }

    const updatedTask = {
        name,
        startDate,
        endDate,
        steps,
    };

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        if (response.ok) {
            alert('Task updated successfully');
            fetchTasksForDisplay(); // Refresh the task list
        } else {
            const errorData = await response.json();
            alert(`Failed to update task: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error("Error updating task:", error);
        alert("An error occurred while updating the task.");
    }
}


// display tasks for delete popup
function displayTasksForDeletePopup(tasks) {
    const taskListContainer = document.getElementById('deleteTaskList');
    taskListContainer.innerHTML = "";

    tasks.forEach(task => {
        const taskName = task.properties["Task Name"]?.title[0]?.text?.content || "Unnamed Task";
        
        // create list item for each task
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');

        // task name text
        const taskText = document.createElement('span');
        taskText.textContent = taskName;

        // delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = () => deleteTask(task.id);

        
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteButton);
        taskListContainer.appendChild(taskItem);
    });
}

function toggleImage() {
    const imgElement = document.getElementById('toggleImage');
    const image1 = '/src/images/pomodoro-icon.png';
    const image2 = '/src/images/task-icon.png';

    imgElement.src = imgElement.src.includes(image1) ? image2 : image1;
}

document.getElementById('toggleImage').onclick = toggleImage;

// start spotify poomodoro timer here



let workMinutes = 25;
let seconds = 0;
let isPaused = true;
let interval;
let sessionNumber = 0;
// Default Timer Modes (User customizable).
let sessionTime = 25; 
let shortBreakTime = 5; 
let longBreakTime = 15; 
let currentMode = "session"; 
let accessToken = '';
let hasAskedForSpotify = false; 
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const toggleButton = document.getElementById("toggle-button");
const resetButton = document.getElementById("reset");
//const taskInput = document.getElementById("task");
//const taskList = document.getElementById("task-list");
//const playMusicButton = document.getElementById("play-music");
//const pauseMusicButton = document.getElementById("pause-music");
const sessionBtn = document.getElementById("session-btn");
const shortBreakBtn = document.getElementById("short-break-btn");
const longBreakBtn = document.getElementById("long-break-btn");


function updateDisplay(minutes, seconds) {
  minutesDisplay.textContent = String(minutes).padStart(2, "0");
  secondsDisplay.textContent = String(seconds).padStart(2, "0");
}


// Fetch access token from the URL or session
function getAccessTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('access_token');
}

// Set the access token after successful login
accessToken = getAccessTokenFromUrl();

// Timer Functions
function updateTimer() {
  if (!isPaused) {
    
    if (seconds === 0) {
      if (workMinutes === 0)
        {
          if (currentMode === "session") {
            sessionNumber++;
            if (sessionNumber%3==0){changeMode('long-break');}
            else {changeMode('short-break');}
          } else {changeMode('session');}
        }
      else {
        workMinutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }
    updateDisplay(workMinutes, seconds);
  }
}

function handleMissingAccessToken() {
  if (!hasAskedForSpotify) {
    const userChoice = window.confirm("Would you like to connect to Spotify?");
    if (userChoice) {
      window.location.href = "../music-page/spotify-feature1/spotify-feature1.html"; // Replace with the correct relative URL
    } else {
      console.log("Login attempt canceled.");
    }
    hasAskedForSpotify = true; 
  }
}


function startTimer() {
  if (isPaused) {
    isPaused = false;
    interval = setInterval(updateTimer, 1000);
    toggleButton.textContent = "Stop"; 
    if (!accessToken) {
      handleMissingAccessToken();
      return;
    }
    startMusic(accessToken);
  }
}


// Stop music
function stopTimer() {
  isPaused = true;
  clearInterval(interval);
  toggleButton.textContent = "Start";
  if (!accessToken) {
    handleMissingAccessToken();
    return;
  }
  stopMusic(accessToken);
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  sessionTime = 25;
  shortBreakTime = 5;
  longBreakTime = 15;
  if (currentMode === "session") {
    workMinutes = sessionTime;
  } else if (currentMode === "short-break") {
    workMinutes = shortBreakTime;
  } else if (currentMode === "long-break") {
    workMinutes = longBreakTime;
  }
  updateDisplay(workMinutes, seconds);
}

// Editable Clock Behavior
function validateAndSetMinutes() {
  const minutesValue = parseInt(minutesDisplay.textContent);
  if (!isNaN(minutesValue) && minutesValue >= 0 && minutesValue <= 99) {
    workMinutes = minutesValue;
    if (currentMode === "session") sessionTime = workMinutes;
    if (currentMode === "short-break") shortBreakTime = workMinutes;
    if (currentMode === "long-break") longBreakTime = workMinutes;
  } else {
    minutesDisplay.textContent = String(Math.min(Math.max(minutesValue, 0), 99)).padStart(2, "0");
  }
}


function validateAndSetSeconds() {
  const secondsValue = parseInt(secondsDisplay.textContent);
  if (!isNaN(secondsValue) && secondsValue >= 0 && secondsValue < 60) {
    seconds = secondsValue;
  } else {
    secondsDisplay.textContent = String(Math.min(Math.max(secondsValue, 0), 59)).padStart(2, "0");
  }
}

// Change Mode
function changeMode(mode) {
  currentMode = mode;
  stopTimer();
  seconds = 0;
  if (mode === "session") {
    workMinutes = sessionTime;
  } else if (mode === "short-break") {
    workMinutes = shortBreakTime;
  } else if (mode === "long-break") {
    workMinutes = longBreakTime;
  }
  updateDisplay(workMinutes, seconds);
  sessionBtn.classList.toggle("active", mode === "session");
  shortBreakBtn.classList.toggle("active", mode === "short-break");
  longBreakBtn.classList.toggle("active", mode === "long-break");
}

// Event Listener for Editable Timer (Minutes and Seconds)
minutesDisplay.addEventListener("input", () => {
  if (minutesDisplay.textContent.length > 2) {
    minutesDisplay.textContent = minutesDisplay.textContent.slice(0, 2); // Limit to two characters
  }
  if (minutesDisplay.textContent.length === 2) {
    minutesDisplay.blur(); 
  }
});

secondsDisplay.addEventListener("input", () => {
  if (secondsDisplay.textContent.length > 2) {
    secondsDisplay.textContent = secondsDisplay.textContent.slice(0, 2); // Limit to two characters
  }
  if (secondsDisplay.textContent.length === 2) {
    secondsDisplay.blur(); 
  }
});

// For Editable Timer (Minutes and Seconds)
minutesDisplay.addEventListener("blur", () => {
  const minutesValue = parseInt(minutesDisplay.textContent);
  if (!isNaN(minutesValue) && minutesValue >= 1) {
    workMinutes = minutesValue;
    if (currentMode === "session") {
      sessionTime = workMinutes;
    } else if (currentMode === "short-break") {
      shortBreakTime = workMinutes;
    } else if (currentMode === "long-break") {
      longBreakTime = workMinutes;
    }
  } else {
    minutesDisplay.textContent = workMinutes;
  }
});

secondsDisplay.addEventListener("blur", () => {
  const secondsValue = parseInt(secondsDisplay.textContent);
  if (!isNaN(secondsValue) && secondsValue >= 0 && secondsValue < 60) {
    seconds = secondsValue;
  } else {
    secondsDisplay.textContent = Math.min(Math.max(secondsValue, 0), 59);
    seconds = Math.min(Math.max(secondsValue, 0), 59);
  }
});

// Prevent invalid characters on Enter key
minutesDisplay.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent new line or invalid characters
    toggleButton.click(); // Start the timer
  }
});
secondsDisplay.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent new line or invalid characters
    toggleButton.click(); // Start the timer
  }
});

async function startMusic(accessToken) {
  try {
    const response = await fetch(`http://localhost:8888/start-music?access_token=${accessToken}`, {
      method: 'POST',
    });
    if (response.ok) {
      console.log('Music started');
    } else {
      console.error('Failed to start music', await response.text());
    }
  } catch (error) {
    console.error('Error starting music:', error);
  }
}

async function stopMusic(accessToken) {
  try {
    const response = await fetch(`http://localhost:8888/stop-music?access_token=${accessToken}`, {
      method: 'POST',
    });
    if (response.ok) {
      console.log('Music stopped');
    } else {
      console.error('Failed to stop music', await response.text());
    }
  } catch (error) {
    console.error('Error stopping music:', error);
  }
}

sessionBtn.addEventListener("click", () => changeMode("session"));
shortBreakBtn.addEventListener("click", () => changeMode("short-break"));
longBreakBtn.addEventListener("click", () => changeMode("long-break"));
toggleButton.addEventListener("click", () => {
  if (isPaused) {startTimer();} else {stopTimer();}
});
resetButton.addEventListener("click", resetTimer);

// Initialize Display
updateDisplay(workMinutes, seconds);
