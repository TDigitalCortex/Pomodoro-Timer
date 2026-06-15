const Storage = {
  saveTimerState(state) {
    localStorage.setItem('pomodoro_timer', JSON.stringify(state));
  },
  loadTimerState() {
    const saved = localStorage.getItem('pomodoro_timer');
    return saved ? JSON.parse(saved) : null;
  },
  saveTasks(tasks) {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  },
  loadTasks() {
    const saved = localStorage.getItem('pomodoro_tasks');
    return saved ? JSON.parse(saved) : [];
  },
  saveSettings(settings) {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
  },
  loadSettings() {
    const saved = localStorage.getItem('pomodoro_settings');
    return saved ? JSON.parse(saved) : null;
  }
};
