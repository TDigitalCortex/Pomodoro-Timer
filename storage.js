const Storage = (function() {
  const TIMER_KEY = 'pomodoro_timer_state';
  const TASKS_KEY = 'pomodoro_tasks';
  const SETTINGS_KEY = 'pomodoro_settings';

  function saveTimerState(state) {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadTimerState() {
    try {
      const saved = localStorage.getItem(TIMER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  return {
    saveTimerState,
    loadTimerState,
    saveTasks,
    loadTasks,
    saveSettings,
    loadSettings
  };
})();
