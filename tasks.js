// Tasks module with priority and completed items moved to bottom
const TaskManager = (function() {
  let tasks = [];
  let containerElement = null;
  let onTasksChangedCallback = null;

  function saveToStorage() {
    Storage.saveTasks(tasks);
    if (onTasksChangedCallback) onTasksChangedCallback(tasks);
  }

  function loadFromStorage() {
    const stored = Storage.loadTasks();
    if (stored && stored.length) {
      tasks = stored;
    } else {
      tasks = [];
    }
    render();
  }

  function render() {
    if (!containerElement) return;
    
    containerElement.innerHTML = '';
    
    // Sort tasks: incomplete first, then completed
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
    
    if (sortedTasks.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-tasks';
      emptyLi.innerText = 'No tasks yet — add something to focus on';
      containerElement.appendChild(emptyLi);
      return;
    }
    
    sortedTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'task-completed' : ''}`;
      li.dataset.id = task.id;
      
      const checkBox = document.createElement('input');
      checkBox.type = 'checkbox';
      checkBox.className = 'task-check';
      checkBox.checked = task.completed;
      checkBox.addEventListener('change', (e) => {
        task.completed = e.target.checked;
        saveToStorage();
        render();
      });
      
      const taskInput = document.createElement('input');
      taskInput.type = 'text';
      taskInput.className = 'task-text';
      taskInput.value = task.text;
      taskInput.addEventListener('blur', (e) => {
        const newText = e.target.value.trim();
        if (newText) task.text = newText;
        saveToStorage();
        render();
      });
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') taskInput.blur();
      });
      
      const prioritySpan = document.createElement('span');
      prioritySpan.className = `priority-badge priority-${task.priority || 'medium'}`;
      prioritySpan.innerText = (task.priority || 'medium').toUpperCase();
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-task';
      deleteBtn.innerHTML = '×';
      deleteBtn.title = 'Delete task';
      deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveToStorage();
        render();
      });
      
      li.appendChild(checkBox);
      li.appendChild(taskInput);
      li.appendChild(prioritySpan);
      li.appendChild(deleteBtn);
      containerElement.appendChild(li);
    });
  }

  function addTask(taskText) {
    if (!taskText || taskText.trim() === '') return;
    
    const newId = Date.now();
    tasks.push({
      id: newId,
      text: taskText.trim(),
      completed: false,
      priority: 'medium',
      createdAt: Date.now()
    });
    saveToStorage();
    render();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
  }

  function getAllTasks() {
    return [...tasks];
  }

  function init(containerId, addButtonId, inputId) {
    containerElement = document.getElementById(containerId);
    const addButton = document.getElementById(addButtonId);
    const taskInput = document.getElementById(inputId);
    
    if (addButton && taskInput) {
      addButton.addEventListener('click', () => {
        addTask(taskInput.value);
        taskInput.value = '';
        taskInput.focus();
      });
      
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          addTask(taskInput.value);
          taskInput.value = '';
        }
      });
    }
    
    loadFromStorage();
  }

  function setOnTasksChanged(callback) {
    onTasksChangedCallback = callback;
  }

  return {
    init,
    addTask,
    deleteTask,
    getAllTasks,
    setOnTasksChanged
  };
})();
