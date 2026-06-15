const Timer = (function() {
  let timerInterval = null;
  let currentSeconds = 25 * 60;
  let isRunning = false;
  let currentMode = 'session';
  
  let sessionTime = 25;
  let shortBreakTime = 5;
  let longBreakTime = 15;
  let customTime = 30;
  
  let displayElement = null;
  let playPauseTextElement = null;
  let modeButtons = null;

  function updateDisplay() {
    if (!displayElement) return;
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    displayElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function playAlarm() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.3, now);
      const osc = audioCtx.createOscillator();
      osc.connect(gainNode);
      osc.frequency.value = 880;
      osc.type = 'sine';
      osc.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1);
      osc.stop(now + 0.8);
      audioCtx.resume();
    } catch(e) {}
  }

  function finishTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
    if (playPauseTextElement) playPauseTextElement.innerText = 'Start';
    playAlarm();
    saveState();
  }

  function tick() {
    if (currentSeconds <= 0) {
      if (isRunning) finishTimer();
      return;
    }
    currentSeconds--;
    updateDisplay();
    if (currentSeconds === 0) finishTimer();
    saveState();
  }

  function start() {
    if (timerInterval) clearInterval(timerInterval);
    isRunning = true;
    if (playPauseTextElement) playPauseTextElement.innerText = 'Pause';
    timerInterval = setInterval(() => {
      if (isRunning) tick();
    }, 1000);
    saveState();
  }

  function pause() {
    isRunning = false;
    if (playPauseTextElement) playPauseTextElement.innerText = 'Start';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    saveState();
  }

  function reset() {
    pause();
    setMode(currentMode);
  }

  function setMode(mode) {
    currentMode = mode;
    let duration = sessionTime;
    
    switch(mode) {
      case 'session':
        duration = sessionTime;
        break;
      case 'shortBreak':
        duration = shortBreakTime;
        break;
      case 'longBreak':
        duration = longBreakTime;
        break;
      case 'custom':
        duration = customTime;
        break;
    }
    
    currentSeconds = duration * 60;
    updateDisplay();
    if (playPauseTextElement) playPauseTextElement.innerText = 'Start';
    isRunning = false;
    
    if (modeButtons) {
      modeButtons.forEach(btn => {
        if (btn.dataset.mode === mode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
    
    saveState();
  }

  function updateDurations(session, short, long, custom) {
    sessionTime = session;
    shortBreakTime = short;
    longBreakTime = long;
    customTime = custom;
    setMode(currentMode);
  }

  function getIsRunning() {
    return isRunning;
  }

  function saveState() {
    Storage.saveTimerState({
      currentSeconds: currentSeconds,
      currentMode: currentMode,
      sessionTime: sessionTime,
      shortBreakTime: shortBreakTime,
      longBreakTime: longBreakTime,
      customTime: customTime
    });
  }

  function loadState() {
    const saved = Storage.loadTimerState();
    if (saved) {
      currentSeconds = saved.currentSeconds || 25 * 60;
      currentMode = saved.currentMode || 'session';
      sessionTime = saved.sessionTime || 25;
      shortBreakTime = saved.shortBreakTime || 5;
      longBreakTime = saved.longBreakTime || 15;
      customTime = saved.customTime || 30;
      updateDisplay();
    }
  }

  function init(displayId, playPauseTextId) {
    displayElement = document.getElementById(displayId);
    playPauseTextElement = document.getElementById(playPauseTextId);
    modeButtons = document.querySelectorAll('.mode-btn');
    loadState();
    setMode(currentMode);
  }

  return {
    init,
    start,
    pause,
    reset,
    setMode,
    updateDurations,
    getIsRunning
  };
})();
