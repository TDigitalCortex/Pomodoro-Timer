// Tasks module
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
    
    if (tasks.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-tasks';
      emptyLi.innerText = 'No tasks yet — add something to focus on';
      containerElement.appendChild(emptyLi);
      return;
    }
    
    tasks.forEach(task => {
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
      li.appendChild(deleteBtn);
      containerElement.appendChild(li);
    });
  }

  function addTask(taskText = 'New task') {
    const newId = Date.now();
    tasks.unshift({
      id: newId,
      text: taskText,
      completed: false,
      createdAt: Date.now()
    });
    saveToStorage();
    render();
    
    setTimeout(() => {
      const newTaskElement = containerElement.querySelector(`.task-item[data-id='${newId}'] .task-text`);
      if (newTaskElement) newTaskElement.focus();
    }, 20);
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
  }

  function getAllTasks() {
    return [...tasks];
  }

  function init(containerId, addButtonId) {
    containerElement = document.getElementById(containerId);
    const addButton = document.getElementById(addButtonId);
    
    if (addButton) {
      addButton.addEventListener('click', () => addTask());
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  TaskManager.init('taskListContainer', 'addTaskBtn');
  
  Timer.init({
    display: 'timerDisplay',
    playPauseText: 'playPauseText',
    statusSpan: 'timerStatus',
    workMinutes: 'workMinutes',
    alarmSelect: 'alarmSoundSelect'
  });
  
  Timer.setCallbacks({
    onStatusChange: (status) => {
      const statusSpan = document.getElementById('timerStatus');
      if (statusSpan) {
        switch(status) {
          case 'focusing':
            statusSpan.innerText = 'Focusing...';
            break;
          case 'paused':
            statusSpan.innerText = 'Paused';
            break;
          case 'reset':
            statusSpan.innerText = 'Reset - fresh pomodoro';
            setTimeout(() => {
              if (document.getElementById('timerStatus').innerText === 'Reset - fresh pomodoro')
                document.getElementById('timerStatus').innerText = 'Ready';
            }, 1800);
            break;
          case 'ready':
            statusSpan.innerText = 'Ready for focus';
            break;
          default:
            statusSpan.innerText = 'Focus session';
        }
      }
    }
  });
  
  const playPauseBtn = document.getElementById('playPauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (Timer.getIsRunning()) Timer.pause();
      else Timer.start();
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => Timer.reset());
  }
  
  if (settingsToggleBtn && settingsPanel) {
    settingsToggleBtn.addEventListener('click', () => {
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
  }
});
