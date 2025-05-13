document.addEventListener('DOMContentLoaded', () => {

    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    
    const addTaskModal = document.getElementById('addTaskModal');
    const closeAddModalBtn = addTaskModal.querySelector('.close-btn');
    const cancelAddModalBtn = addTaskModal.querySelector('.cancel-btn');
    const saveNewTaskBtn = document.getElementById('saveNewTaskBtn');
    const newTaskInput = document.getElementById('newTaskInput');
    const newTaskStatus = document.getElementById('newTaskStatus');

    
    const editTaskModal = document.getElementById('editTaskModal');
    const closeEditModalBtn = editTaskModal.querySelector('.close-btn');
    const cancelEditModalBtn = editTaskModal.querySelector('.cancel-btn');
    const saveEditTaskBtn = document.getElementById('saveEditTaskBtn');
    const editTaskInput = document.getElementById('editTaskInput');
    const editTaskStatus = document.getElementById('editTaskStatus');
    const editTaskIdInput = document.getElementById('editTaskId'); // Hidden input


    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };


    const renderTasks = () => {
        taskList.innerHTML = ''; 
        if (tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align:center; color: #777;">No tasks yet!</p>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id);
            li.classList.add(`status-${task.status}`); 

            // Map status value to display text
            let statusText = 'Unknown';
            if (task.status === 'not-done') statusText = 'Not Done';
            else if (task.status === 'in-processing') statusText = 'In Processing';
            else if (task.status === 'completed') statusText = 'Completed';

            li.innerHTML = `
                <div class="task-info">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <span class="task-status">${statusText}</span>
                </div>
                <div class="task-actions">
                    <button class="btn edit-btn">Edit</button>
                    <button class="btn delete-btn">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        saveTasks(); // Save state after rendering
    };

    // Function to safely escape HTML content
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    // Function to open a modal
    const openModal = (modal) => {
        modal.style.display = 'flex';
    };

    // Function to close a modal
    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    // Function to handle adding a new task
    const addTask = () => {
        const text = newTaskInput.value.trim();
        const status = newTaskStatus.value;

        if (text === '') {
            alert('Please enter a task description.');
            return;
        }

        const newTask = {
            id: Date.now().toString(), // Simple unique ID using timestamp
            text: text,
            status: status // 'not-done', 'in-processing', 'completed'
        };

        tasks.push(newTask);
        newTaskInput.value = ''; // Clear input
        newTaskStatus.value = 'not-done'; // Reset status dropdown
        closeModal(addTaskModal);
        renderTasks();
    };

    // Function to handle deleting a task
    const deleteTask = (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
        }
    };

    // Function to populate and open the edit modal
    const openEditModal = (id) => {
        const taskToEdit = tasks.find(task => task.id === id);
        if (!taskToEdit) return;

        editTaskIdInput.value = taskToEdit.id;
        editTaskInput.value = taskToEdit.text;

        // Define allowed status options based on current status
        const statusOptions = [
            { value: 'not-done', text: 'Not Done' },
            { value: 'in-processing', text: 'In Processing' },
            { value: 'completed', text: 'Completed' }
        ];

        // Filter options based on current status
        let allowedOptions;
        if (taskToEdit.status === 'not-done') {
            allowedOptions = statusOptions; // Can select any status
        } else if (taskToEdit.status === 'in-processing') {
            allowedOptions = statusOptions.filter(option => 
                option.value === 'in-processing' || option.value === 'completed'
            ); // Cannot revert to 'not-done'
        } else if (taskToEdit.status === 'completed') {
            allowedOptions = statusOptions.filter(option => 
                option.value === 'completed'
            ); // Cannot revert to 'not-done' or 'in-processing'
        }

        // Populate the status dropdown
        editTaskStatus.innerHTML = ''; // Clear existing options
        allowedOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            editTaskStatus.appendChild(opt);
        });

        // Set the current status
        editTaskStatus.value = taskToEdit.status;

        openModal(editTaskModal);
    };

    // Function to save edited task
    const saveEditedTask = () => {
        const id = editTaskIdInput.value;
        const newText = editTaskInput.value.trim();
        const newStatus = editTaskStatus.value;

        if (newText === '') {
            alert('Task description cannot be empty.');
            return;
        }

        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText, status: newStatus };
            }
            return task;
        });

        closeModal(editTaskModal);
        renderTasks();
    };

    // --- Event Listeners ---

    // Open Add Task Modal
    addTaskBtn.addEventListener('click', () => {
        openModal(addTaskModal);
        newTaskInput.focus(); // Focus the input field when modal opens
    });

    // Close Add Task Modal (Close Button)
    closeAddModalBtn.addEventListener('click', () => closeModal(addTaskModal));
    // Close Add Task Modal (Cancel Button)
    cancelAddModalBtn.addEventListener('click', () => closeModal(addTaskModal));

    // Close Edit Task Modal (Close Button)
    closeEditModalBtn.addEventListener('click', () => closeModal(editTaskModal));
    // Close Edit Task Modal (Cancel Button)
    cancelEditModalBtn.addEventListener('click', () => closeModal(editTaskModal));

    // Close modal if clicking outside the content area
    window.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            closeModal(addTaskModal);
        }
        if (event.target === editTaskModal) {
            closeModal(editTaskModal);
        }
    });

    // Save New Task
    saveNewTaskBtn.addEventListener('click', addTask);
    // Allow saving new task with Enter key in the input field
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Save Edited Task
    saveEditTaskBtn.addEventListener('click', saveEditedTask);
    // Allow saving edited task with Enter key in the input field
    editTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEditedTask();
        }
    });

    // Handle clicks within the task list (for Edit/Delete buttons - Event Delegation)
    taskList.addEventListener('click', (event) => {
        const target = event.target;
        const li = target.closest('li'); // Find the parent list item
        if (!li) return; // Exit if the click wasn't inside a list item

        const taskId = li.getAttribute('data-id');

        if (target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        } else if (target.classList.contains('edit-btn')) {
            openEditModal(taskId);
        }
    });

    // --- Initial Render ---
    renderTasks();
});