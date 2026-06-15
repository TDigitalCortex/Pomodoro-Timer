const TaskManager = {
  tasks: [],
  containerElement: null,
  taskInputElement: null,

  saveToStorage() {
    Storage.saveTasks(this.tasks);
  },

  loadFromStorage() {
    this.tasks = Storage.loadTasks();
    this.render();
  },

  render() {
    if (!this.containerElement) return;
    this.containerElement.innerHTML = '';
    
    const incomplete = this.tasks.filter(t => !t.completed);
    const completed = this.tasks.filter(t => t.completed);
    const sorted = [...incomplete, ...completed];
    
    if (sorted.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-tasks';
      empty.innerText = 'No tasks yet — add something to focus on';
      this.containerElement.appendChild(empty);
      return;
    }
    
    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'task-completed' : ''}`;
      
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'task-check';
      check.checked = task.completed;
      check.onchange = () => {
        task.completed = check.checked;
        this.saveToStorage();
        this.render();
      };
      
      const text = document.createElement('input');
      text.type = 'text';
      text.className = 'task-text';
      text.value = task.text;
      text.onblur = () => {
        task.text = text.value.trim() || 'Untitled';
        this.saveToStorage();
        this.render();
      };
      text.onkeypress = (e) => { if (e.key === 'Enter') text.blur(); };
      
      const del = document.createElement('button');
      del.className = 'delete-task';
      del.innerHTML = '×';
      del.onclick = () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.saveToStorage();
        this.render();
      };
      
      li.appendChild(check);
      li.appendChild(text);
      li.appendChild(del);
      this.containerElement.appendChild(li);
    });
  },

  addTask() {
    const text = this.taskInputElement.value.trim();
    if (text === '') return;
    this.tasks.push({ id: Date.now(), text: text, completed: false });
    this.saveToStorage();
    this.taskInputElement.value = '';
    this.render();
  },

  init(containerId, addButtonId, inputId) {
    this.containerElement = document.getElementById(containerId);
    this.taskInputElement = document.getElementById(inputId);
    const addBtn = document.getElementById(addButtonId);
    if (addBtn) addBtn.onclick = () => this.addTask();
    if (this.taskInputElement) {
      this.taskInputElement.onkeypress = (e) => { if (e.key === 'Enter') this.addTask(); };
    }
    this.loadFromStorage();
  }
};
