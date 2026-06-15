// Storage module - Local persistence
const Storage = (function() {
  const TIMER_KEY = 'pomodoro_timer_state';
  const TASKS_KEY = 'pomodoro_tasks';
  const SETTINGS_KEY = 'pomodoro_settings';

  function saveTimerState(state) {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({
        ...state,
        lastSaved: Date.now()
      }));
      return true;
    } catch (e) {
      console.error('Failed to save timer state:', e);
      return false;
    }
  }

  function loadTimerState() {
    try {
      const saved = localStorage.getItem(TIMER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load timer state:', e);
      return null;
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify({
        tasks: tasks,
        version: '1.0',
        updatedAt: Date.now()
      }));
      return true;
    } catch (e) {
      console.error('Failed to save tasks:', e);
      return false;
    }
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.tasks || [];
      }
      return [];
    } catch (e) {
      console.error('Failed to load tasks:', e);
      return [];
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to load settings:', e);
      return null;
    }
  }

  function clearAllData() {
    localStorage.removeItem(TIMER_KEY);
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }

  return {
    saveTimerState,
    loadTimerState,
    saveTasks,
    loadTasks,
    saveSettings,
    loadSettings,
    clearAllData
  };
})();
