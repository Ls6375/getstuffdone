document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.querySelector('form');
  const taskNameInput = document.getElementById('taskName');
  const taskDescriptionInput = document.getElementById('taskDescription');
  const dueDateInput = document.getElementById('dueDate');
  const priorityInput = document.getElementById('priority');
  const assignedToInput = document.getElementById('assignedTo');
  const searchInput = document.getElementById('search');
  const tasksContainer = document.querySelector('.tasks');
  const submitButton = taskForm.querySelector('button[type="submit"]');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearFilterButton = document.querySelector('.clear-filter-btn');


  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let isEditMode = false;
  let editTaskId = null;

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditMode) {
        updateTask(editTaskId);
        submitButton.textContent = 'Add Task';
        isEditMode = false;
        editTaskId = null;
      } else {
        addTask();
      }
      taskForm.reset();
    }
  });

	
	function getActiveFilter() {
		return document.querySelector('.filter-btn.active').dataset.filter;
	}

  searchInput.addEventListener('input', ()=> {
		filterTasks(getActiveFilter());
	});

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {

			// Remove active class from all filter buttons
			filterButtons.forEach(btn => btn.classList.remove('active'));

			// Add active class to the clicked button
			button.classList.add('active');
						
      const filter = button.dataset.filter;
      filterTasks(filter);
    });
  });

  clearFilterButton.addEventListener('click', () => {
    searchInput.value = '';
		document.getElementById('all').click();
    renderTasks();
  });

  function validateForm() {
    if (taskNameInput.value.trim() === '') {
      alert('Task Name is required');
      taskNameInput.focus();
      return false;
    }
    if (taskDescriptionInput.value.trim() === '') {
      alert('Task Description is required');
      taskDescriptionInput.focus();
      return false;
    }
    if (dueDateInput.value === '') {
      alert('Due Date is required');
      dueDateInput.focus();
      return false;
    }
    if (priorityInput.value === '') {
      alert('Priority is required');
      priorityInput.focus();
      return false;
    }
    if (assignedToInput.value.trim() === '') {
      alert('Assigned To is required');
      assignedToInput.focus();
      return false;
    }
    return true;
  }

  function addTask() {
    const task = {
      id: Date.now(),
      name: taskNameInput.value,
      description: taskDescriptionInput.value,
      dueDate: dueDateInput.value,
      priority: priorityInput.value,
      assignedTo: assignedToInput.value,
      status: 'pending'
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
  }

  function updateTask(id) {
    const task = tasks.find(task => task.id === id);
    task.name = taskNameInput.value;
    task.description = taskDescriptionInput.value;
    task.dueDate = dueDateInput.value;
    task.priority = priorityInput.value;
    task.assignedTo = assignedToInput.value;
    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  }

  function editTask(id) {
    const task = tasks.find(task => task.id === id);
    taskNameInput.value = task.name;
    taskDescriptionInput.value = task.description;
    dueDateInput.value = task.dueDate;
    priorityInput.value = task.priority;
    assignedToInput.value = task.assignedTo;
    isEditMode = true;
    editTaskId = id;
    submitButton.textContent = 'Edit Task';
  }

  function toggleTaskStatus(id) {
    const task = tasks.find(task => task.id === id);
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    saveTasks();
    filterTasks(getActiveFilter());
  }

  function filterTasks(filter = 'all') {
		const searchText = searchInput.value.toLowerCase();

		let filteredTasks = tasks.filter(task => {
				return task.name.toLowerCase().includes(searchText);
		});
		
    if (filter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filter);
    }

    renderTasks(filteredTasks);
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function renderTasks(taskList = tasks) {
    tasksContainer.innerHTML = '';
    if (taskList.length === 0) {
      tasksContainer.innerHTML = '<p>No tasks found</p>';
      return;
    }
    taskList.forEach(task => {
      const taskCard = document.createElement('div');
      taskCard.className = `card shadow-soft `;
      taskCard.innerHTML = `
        <div class="card-body p-4 m-1 ${task.status === 'completed' ? 'border border-2 border-success rounded ' : ''}">
          <h3 class="h5 card-title mb-3">${task.name}</h3>
          <span class="badge badge"><i class="fas fa-calendar"></i> ${new Date(task.dueDate).toDateString()}</span>
          <span class="badge badge"><i class="fas fa-user"></i> ${task.assignedTo}</span>
          <span class="badge badge"><i class="fas fa-clock"></i> ${task.status}</span>
          <span class="badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'dark'}"><i class="fas fa-exclamation-circle"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
          <p class="card-text mt-3">${task.description}</p>
          <div class="d-flex align-items-center mt-3">
            <button class="btn btn-primary btn-sm mr-3 edit-task"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn btn-primary text-danger btn-sm mr-3 delete-task"><i class="fas fa-trash"></i> Delete</button>
            <button class="btn btn-primary ${task.status === 'completed' ? 'text-info' : 'text-success'} btn-sm mark-done-task">
              <i class="fas fa-${task.status === 'completed' ? 'undo' : 'check'}"></i> ${task.status === 'completed' ? 'Mark as Pending' : 'Mark as Done'}
            </button>
          </div>
        </div>
      `;
      taskCard.querySelector('.delete-task').addEventListener('click', () => deleteTask(task.id));
      taskCard.querySelector('.edit-task').addEventListener('click', () => editTask(task.id));
      taskCard.querySelector('.mark-done-task').addEventListener('click', () => toggleTaskStatus(task.id));
      tasksContainer.appendChild(taskCard);
    });
  }

  renderTasks();
});
