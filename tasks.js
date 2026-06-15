const TaskManager = (function() {
  let tasks = [];
  let containerElement = null;
  let taskInputElement = null;

  function saveToStorage() {
    Storage.saveTasks(tasks);
  }

  function loadFromStorage() {
    tasks = Storage.loadTasks();
    render();
  }

  function render() {
    if (!containerElement) return;
    
    containerElement.innerHTML = '';
    
    const incompleteTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);
    const sortedTasks = [...incompleteTasks, ...completedTasks];
    
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
      
      const taskText = document.createElement('input');
      taskText.type = 'text';
      taskText.className = 'task-text';
      taskText.value = task.text;
      taskText.addEventListener('blur', (e) => {
        task.text = e.target.value.trim() || 'Untitled';
        saveToStorage();
        render();
      });
      taskText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') taskText.blur();
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-task';
      deleteBtn.innerHTML = '×';
      deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveToStorage();
        render();
      });
      
      li.appendChild(checkBox);
      li.appendChild(taskText);
      li.appendChild(deleteBtn);
      containerElement.appendChild(li);
    });
  }

  function addTask() {
    const text = taskInputElement.value.trim();
    if (text === '') return;
    
    tasks.push({
      id: Date.now(),
      text: text,
      completed: false
    });
    saveToStorage();
    taskInputElement.value = '';
    render();
  }

  function init(containerId, addButtonId, inputId) {
    containerElement = document.getElementById(containerId);
    taskInputElement = document.getElementById(inputId);
    const addButton = document.getElementById(addButtonId);
    
    if (addButton) {
      addButton.addEventListener('click', addTask);
    }
    
    if (taskInputElement) {
      taskInputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
      });
    }
    
    loadFromStorage();
  }

  return {
    init
  };
})();
