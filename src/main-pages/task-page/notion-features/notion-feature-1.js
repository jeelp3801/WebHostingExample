let tasks = [];
// ===============================================
function togglePopup(popupId) {
    const popup = document.getElementById(popupId);

    if (popup.style.display === 'block') {
        popup.style.display = 'none';
    } else {
        document.querySelectorAll('.pop-up-window').forEach(popup => popup.style.display = 'none');
        
        popup.style.display = 'block';
    }
}

function showInitialPopup() {
    togglePopup('popup1'); // Show or hide the initial popup (task entry)
}

function showStepPopup1() {
    togglePopup('popup2'); // Show or hide the second popup (date and step entry)
}

function showRearrangePopup() {
    togglePopup('popup3'); // Show or hide the third popup (rearrange tasks)
}

// ===============================================
// Popup 1 - Functions
// ===============================================

function addTask() {
    if(tasks.length >= 10) {
       alert("you can only add up to 10 tasks");
       return;
    } 

    const taskInput = document.createElement('textarea');

    // Attributes: Limit the amount of characters for the task name
    taskInput.placeholder = `Enter task ${tasks.length + 1}`;
    taskInput.maxLength = 60;
    
    document.getElementById('task-container').appendChild(taskInput);

    tasks.push({
        id: tasks.length + 1,
        name: '',
        startDate: '',
        endDate: '',
        steps: []
    });
}

function showStepPopup() {
    const taskInputs = Array.from(document.querySelectorAll('#task-container textarea'))
    taskInputs.forEach((textarea, index) => {
        tasks[index].name = textarea.value;
    })
    if(tasks.some(task => !task.name)) {
        alert("Please enter at least one task.");
        return;
    }

    document.getElementById('popup1').style.display = 'none';
    document.getElementById('popup2').style.display = 'block';
    displayTasksForStepEntry();
}

function displayTasksForStepEntry() {
    const stepList = document.getElementById('step-list');
    stepList.innerHTML = ''; // Clear the step list

    tasks.forEach((task, index) => {
        console.log(`Task ${index}:`, task);

        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-section';
        taskDiv.innerHTML = `
            <h3>${task.name}</h3>
            <label style="font-weight: 100;">Start Date:</label>
            <input type="text" placeholder="Select Date..." id="start-date-${index}">
            <br>
            <label style="font-weight: 100;">End Date:</label>
            <input type="text" placeholder="Select Date..." id="end-date-${index}">
            <br>
            <label style="font-weight: 100;">Steps:</label>
            <div id="steps-container-${index}"></div>
            <button type="button" onclick="addStep(${index})">+</button>
        `;
        stepList.appendChild(taskDiv);

        // Flatpickr initialization
        flatpickr(`#start-date-${index}`, {
            altInput: true, // Hides original input and creates a new one
            altFormat: "F j, Y",
            dateFormat: "Y-m-d", // Human friendly formatting
            minDate: "today",     // Start the date from current date
        });

        flatpickr(`#end-date-${index}`, {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
        });
    });
}

function captureInitialTaskData() {
    tasks.forEach((task, index) => {
        const startDateInput = document.getElementById(`start-date-${index}`);
        const endDateInput = document.getElementById(`end-date-${index}`);
        
        if (!startDateInput.value || !endDateInput.value) {
            alert("Please enter valid start and end dates for all tasks.");
            hasError = true;
            return;
        }

        task.startDate = startDateInput.value;
        task.endDate = endDateInput.value;

        const steps = Array.from(document.querySelectorAll(`#steps-container-${index} input`))
            .map((input, stepIndex) => ({
                description: `Step ${stepIndex + 1}: ${input.value}`,
                date: ''
            }));

        task.steps = steps;
    });
    if (!hasError) {
        showRearrangePopup(); // Proceed to next popup if no errors
    }
    console.log("Initial task data captureed:", tasks);
}

function addStep(taskIndex) {
    const stepsContainer = document.getElementById(`steps-container-${taskIndex}`);
    const stepInput = document.createElement('input');
    stepInput.type = 'text';
    stepInput.placeholder = "Description...";
    stepsContainer.appendChild(stepInput);
}

// ===============================================
// Popup 2 - Functions
// ===============================================

function assignDates() {
    const tasksWithDates = tasks.map((task, index) => {
        const startDateInput = document.getElementById(`start-date-${index}`).value;
        const endDateInput = document.getElementById(`end-date-${index}`).value;

        // Parse the input dates
        const startDate = flatpickr.parseDate(startDateInput, "Y-m-d");
        const endDate = flatpickr.parseDate(endDateInput, "Y-m-d");

        // Format the dates
        const formattedStartDate = flatpickr.formatDate(startDate, "F j, Y");
        const formattedEndDate = flatpickr.formatDate(endDate, "F j, Y");

        if (isNaN(startDate) || isNaN(endDate)) {
            alert("Please enter valid start and end dates for each task.");
            return null;
        }

        if (endDate <= startDate) {
            alert("The end date must be after the start date.");
            return null;
        }

        const steps = Array.from(document.querySelectorAll(`#steps-container-${index} input`))
                            .map(input => ({ description: input.value }));

        if (steps.length === 0) {
            alert(`Please enter at least one step for task: ${task.name}`);
            return null;
        }

       const timePerStep = (endDate - startDate) / steps.length;
        steps.forEach((step, stepIndex) => {
            // Calculate the step date using UTC to avoid local timezone shifts
            const stepDate = new Date(startDate.getTime() + timePerStep * stepIndex);
            step.date = new Date(stepDate.getTime()).toISOString().split('T')[0];
            console.log('date assigned: ' + stepDate);
        });
        

        return { name: task.name, startDate: formattedStartDate, endDate: formattedEndDate, steps };
    });

    // Filter out any invalid tasks before proceeding
    const validTasks = tasksWithDates.filter(task => task !== null);
    if (validTasks.length !== tasksWithDates.length) {
        alert("Some tasks are invalid. Please correct them before proceeding.");
        return;  // Stops proceeding if any tasks were invalid
    }

    tasks = validTasks;

    console.log("Tasks with assigned dates:", tasks);
    showRearrangePopup();  // Only called if all tasks are valid
}

function showRearrangePopup() {
    document.getElementById('popup2').style.display = 'none';
    document.getElementById('popup3').style.display = 'block';
    displayTasksForRearrangement();
}

function displayTasksForRearrangement() {
    const rearrangeList = document.getElementById('task-rearrange-list');
    rearrangeList.innerHTML = '';

    tasks.forEach((task, index) => {
        // Format the task startDate and endDate
        const formattedStartDate = flatpickr.formatDate(new Date(task.startDate), "F j, Y");
        const formattedEndDate = flatpickr.formatDate(new Date(task.endDate), "F j, Y");

        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.setAttribute('draggable', true);
        taskDiv.innerHTML = `
            <h3>${task.name}</h3>
            <p>Begin on ${formattedStartDate}</p>
            <p>Finish on ${formattedEndDate}</p>
            <div class="steps-container" id="step-rearrange-${index}">
                <hr>
                <p>Task Milestones</p>
                <hr>
            </div>
        `;
        
        rearrangeList.appendChild(taskDiv);

        const stepsContainer = taskDiv.querySelector(`#step-rearrange-${index}`);
        task.steps.forEach((step, stepIndex) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-item';
            const stepDateUTC = new Date(Date.UTC(
                new Date(step.date).getUTCFullYear(),
                new Date(step.date).getUTCMonth(),
                new Date(step.date).getUTCDate()
            ));
            const formattedStepDate = flatpickr.formatDate(stepDateUTC, "F j, Y");
            stepDiv.textContent = `${stepIndex + 1}. ${step.description} due on `;

            const dateInput = document.createElement('input');
            dateInput.type = 'text';
            dateInput.value = formattedStepDate;

            // Initialize flatpickr for date input
            flatpickr(dateInput, {
                dateFormat: "Y-m-d",
                minDate: new Date(task.startDate).toISOString().split('T')[0], 
                maxDate: new Date(task.endDate).toISOString().split('T')[0], 
                onChange: (selectedDates, dateStr) => {
                    task.steps[stepIndex].date = dateStr;
                    stepDiv.textContent = `${stepIndex + 1}. ${step.description} due on ${dateStr}`;
                    console.log(`Updated date for ${step.description}: ${dateStr}`);
                }
            });

            stepDiv.appendChild(dateInput);
            stepsContainer.appendChild(stepDiv);
        });
    });

    new Sortable(rearrangeList, {
        group: "tasks",
        animation: 150,
        onEnd: (evt) => {
            const reorderedTasks = Array.from(rearrangeList.children).map(taskDiv => {
                const taskName = taskDiv.querySelector('h3').textContent;
                return tasks.find(task => task.name === taskName);
            });
            tasks = reorderedTasks;
        }
    });
}


function confirmRearrangement() {
    const rearrangedTasks = Array.from(document.querySelectorAll('#task-rearrange-list .task-item'))
        .map(taskItem => taskItem.querySelector('h3').textContent);

    taskNames = rearrangedTasks;

    document.getElementById('popup3').style.display = 'none';
    document.getElementById('popup4').style.display='block';
}

// add task to Notion
const createTask = async (taskData) => {
    try {
        const response = await fetch("http://localhost:3000/add-task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Fix header typo
            },
            body: JSON.stringify({
                taskData,
            }),
        });

        const data = await response.json(); // Wait for the response

        if (response.ok) {
            console.log("Task created: ", data); // Log task creation success
        } else {
            console.error("Failed to create task ahhh: ", data.error || data.message); // Log error from response
        }
    } catch (error) {
        console.error("Error creating task: ", error); // Handle any errors in the request
    }
};

document.getElementById('submitTask').addEventListener("click", function () {
    // gather all task data from task array
    tasks.forEach(task => {
        const formattedStartDate = flatpickr.formatDate(new Date(task.startDate), "Y-m-d");
        const formattedEndDate = flatpickr.formatDate(new Date(task.endDate), "Y-m-d");
        const taskData = {
            name: task.name,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            steps: task.steps.map(step => ({
                name: step.description,
                date: flatpickr.formatDate(new Date(step.date), "Y-m-d")
            }))
        };
        createTask(taskData);
    });
    window.location.href = "../taskPage.html";
});
