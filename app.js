document.addEventListener('DOMContentLoaded', function() {
  // Initialize timer and tasks
  Timer.init('timerDisplay', 'playPauseText');
  TaskManager.init('taskListContainer', 'addTaskBtn', 'taskInput');
  
  // Button elements
  const playPauseBtn = document.getElementById('playPauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const overlay = document.getElementById('settingsOverlay');
  const closeBtn = document.querySelector('.settings-close-btn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = function() {
      Timer.setMode(this.dataset.mode);
    };
  });
  
  // Timer controls
  if (playPauseBtn) {
    playPauseBtn.onclick = function() {
      if (Timer.isRunning) Timer.pause();
      else Timer.start();
    };
  }
  
  if (resetBtn) resetBtn.onclick = function() { Timer.reset(); };
  
  // Settings modal
  if (settingsBtn) settingsBtn.onclick = function() { overlay.style.display = 'flex'; };
  if (closeBtn) closeBtn.onclick = function() { overlay.style.display = 'none'; };
  if (overlay) overlay.onclick = function(e) { if (e.target === overlay) overlay.style.display = 'none'; };
  
  // Save settings
  if (saveBtn) {
    saveBtn.onclick = function() {
      const settings = {
        sessionTime: parseInt(document.getElementById('sessionTime').value) || 25,
        shortBreakTime: parseInt(document.getElementById('shortBreakTime').value) || 5,
        longBreakTime: parseInt(document.getElementById('longBreakTime').value) || 15,
        customTime: parseInt(document.getElementById('customTime').value) || 30,
        textColor: document.getElementById('textColor').value,
        bgColor: document.getElementById('bgColor').value,
        cardBgColor: document.getElementById('cardBgColor').value,
        alarmSound: document.getElementById('alarmSoundSelect').value
      };
      
      Storage.saveSettings(settings);
      localStorage.setItem('selected_alarm', settings.alarmSound);
      
      // Apply colors
      document.body.style.backgroundColor = settings.bgColor;
      document.querySelector('.timer-card').style.backgroundColor = settings.cardBgColor;
      document.querySelectorAll('.task-text, .tasks-header h3').forEach(el => {
        el.style.color = settings.textColor;
      });
      document.querySelector('.timer-digits').style.backgroundColor = settings.textColor;
      
      Timer.updateDurations(
        settings.sessionTime,
        settings.shortBreakTime,
        settings.longBreakTime,
        settings.customTime
      );
      
      overlay.style.display = 'none';
    };
  }
  
  // Load saved appearance
  const saved = Storage.loadSettings();
  if (saved) {
    document.body.style.backgroundColor = saved.bgColor;
    document.querySelector('.timer-card').style.backgroundColor = saved.cardBgColor;
    document.querySelectorAll('.task-text, .tasks-header h3').forEach(el => {
      el.style.color = saved.textColor;
    });
  }
});
