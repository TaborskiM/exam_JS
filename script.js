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
        saveTasks(); 
    };

    
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    
    const openModal = (modal) => {
        modal.style.display = 'flex';
    };

    
    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    
    const addTask = () => {
        const text = newTaskInput.value.trim();
        const status = newTaskStatus.value;

        if (text === '') {
            alert('Please enter a task description.');
            return;
        }

        const newTask = {
            id: Date.now().toString(), 
            text: text,
            status: status 
        };

        tasks.push(newTask);
        newTaskInput.value = ''; 
        newTaskStatus.value = 'not-done'; 
        closeModal(addTaskModal);
        renderTasks();
    };

    
    const deleteTask = (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
        }
    };

    
    const openEditModal = (id) => {
        const taskToEdit = tasks.find(task => task.id === id);
        if (!taskToEdit) return;

        editTaskIdInput.value = taskToEdit.id;
        editTaskInput.value = taskToEdit.text;

        
        const statusOptions = [
            { value: 'not-done', text: 'Not Done' },
            { value: 'in-processing', text: 'In Processing' },
            { value: 'completed', text: 'Completed' }
        ];

        
        let allowedOptions;
        if (taskToEdit.status === 'not-done') {
            allowedOptions = statusOptions; 
        } else if (taskToEdit.status === 'in-processing') {
            allowedOptions = statusOptions.filter(option => 
                option.value === 'in-processing' || option.value === 'completed'
            ); 
        } else if (taskToEdit.status === 'completed') {
            allowedOptions = statusOptions.filter(option => 
                option.value === 'completed'
            ); 
        }

        
        editTaskStatus.innerHTML = '';
        allowedOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            editTaskStatus.appendChild(opt);
        });

        
        editTaskStatus.value = taskToEdit.status;

        openModal(editTaskModal);
    };

    
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

    addTaskBtn.addEventListener('click', () => {
        openModal(addTaskModal);
        newTaskInput.focus(); 
    });

    closeAddModalBtn.addEventListener('click', () => closeModal(addTaskModal));
    cancelAddModalBtn.addEventListener('click', () => closeModal(addTaskModal));

    closeEditModalBtn.addEventListener('click', () => closeModal(editTaskModal));

    cancelEditModalBtn.addEventListener('click', () => closeModal(editTaskModal));


    window.addEventListener('click', (event) => {
        if (event.target === addTaskModal) {
            closeModal(addTaskModal);
        }
        if (event.target === editTaskModal) {
            closeModal(editTaskModal);
        }
    });

    saveNewTaskBtn.addEventListener('click', addTask);

    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });


    saveEditTaskBtn.addEventListener('click', saveEditedTask);

    editTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEditedTask();
        }
    });

    taskList.addEventListener('click', (event) => {
        const target = event.target;
        const li = target.closest('li'); 
        if (!li) return; 

        const taskId = li.getAttribute('data-id');

        if (target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        } else if (target.classList.contains('edit-btn')) {
            openEditModal(taskId);
        }
    });

    renderTasks();
});