// Timer module
const Timer = (function() {
  let timerInterval = null;
  let currentSeconds = 25 * 60;
  let isRunning = false;
  let currentMode = 'session';
  
  let sessionTime = 25;
  let shortBreakTime = 5;
  let longBreakTime = 15;
  let customTime = 30;
  
  let onTickCallback = null;
  let onCompleteCallback = null;

  const elements = {
    display: null,
    playPauseText: null,
    modeBtns: null
  };

  function updateDisplay() {
    if (!elements.display) return;
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    elements.display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function playAlarm(selectedSound) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;
      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.3, now);

      const osc = audioCtx.createOscillator();
      osc.connect(gainNode);

      switch(selectedSound) {
        case 'Egg Timer Vibes':
          osc.frequency.value = 880;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1.2);
          osc.stop(now + 1.0);
          break;
        case 'Flow':
          osc.frequency.value = 523.25;
          osc.type = 'triangle';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.9);
          osc.stop(now + 0.8);
          const osc2 = audioCtx.createOscillator();
          osc2.frequency.value = 659.25;
          osc2.type = 'triangle';
          osc2.connect(gainNode);
          osc2.start(now + 0.2);
          osc2.stop(now + 1.0);
          break;
        case 'iPhone Note':
          osc.frequency.value = 880;
          osc.type = 'square';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
          osc.stop(now + 1.2);
          break;
        case 'Clear Tone':
          osc.frequency.value = 1046.5;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
          osc.stop(now + 0.5);
          const osc3 = audioCtx.createOscillator();
          osc3.frequency.value = 783.99;
          osc3.type = 'sine';
          osc3.connect(gainNode);
          osc3.start(now + 0.5);
          osc3.stop(now + 1.0);
          break;
        default:
          osc.frequency.value = 800;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.8);
          osc.stop(now + 0.7);
      }
      audioCtx.resume();
    } catch(e) {
      console.log('Audio not supported', e);
    }
  }

  function finishTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
    if (elements.playPauseText) elements.playPauseText.innerText = 'Start';
    
    const alarmSound = localStorage.getItem('selected_alarm') || 'Message Tones';
    playAlarm(alarmSound);
    
    if (onCompleteCallback) onCompleteCallback();
    saveState();
  }

  function tick() {
    if (currentSeconds <= 0) {
      if (isRunning) finishTimer();
      return;
    }
    currentSeconds--;
    updateDisplay();
    if (onTickCallback) onTickCallback(currentSeconds);
    if (currentSeconds === 0) finishTimer();
    saveState();
  }

  function start() {
    if (timerInterval) clearInterval(timerInterval);
    isRunning = true;
    if (elements.playPauseText) elements.playPauseText.innerText = 'Pause';
    timerInterval = setInterval(() => {
      if (isRunning) tick();
    }, 1000);
    saveState();
  }

  function pause() {
    isRunning = false;
    if (elements.playPauseText) elements.playPauseText.innerText = 'Start';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    saveState();
  }

  function reset() {
    pause();
    setMode(currentMode);
    saveState();
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
    if (elements.playPauseText) elements.playPauseText.innerText = 'Start';
    
    // Update active button style
    if (elements.modeBtns) {
      elements.modeBtns.forEach(btn => {
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
    
    if (currentMode === 'session') setMode('session');
    else if (currentMode === 'shortBreak') setMode('shortBreak');
    else if (currentMode === 'longBreak') setMode('longBreak');
    else if (currentMode === 'custom') setMode('custom');
  }

  function getCurrentMode() {
    return currentMode;
  }

  function getIsRunning() {
    return isRunning;
  }

  function saveState() {
    Storage.saveTimerState({
      currentSeconds: currentSeconds,
      isRunning: isRunning,
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
      isRunning = false;
      currentMode = saved.currentMode || 'session';
      sessionTime = saved.sessionTime || 25;
      shortBreakTime = saved.shortBreakTime || 5;
      longBreakTime = saved.longBreakTime || 15;
      customTime = saved.customTime || 30;
      
      setMode(currentMode);
      updateDisplay();
    }
  }

  function init(elementIds) {
    elements.display = document.getElementById(elementIds.display);
    elements.playPauseText = document.getElementById(elementIds.playPauseText);
    elements.modeBtns = document.querySelectorAll('.mode-btn');
    
    loadState();
  }

  function setCallbacks(callbacks) {
    if (callbacks.onTick) onTickCallback = callbacks.onTick;
    if (callbacks.onComplete) onCompleteCallback = callbacks.onComplete;
  }

  return {
    init,
    start,
    pause,
    reset,
    setMode,
    updateDurations,
    getCurrentMode,
    getIsRunning,
    setCallbacks
  };
})();      osc.connect(gainNode);

      switch(selectedSound) {
        case 'Egg Timer Vibes':
          osc.frequency.value = 880;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1.2);
          osc.stop(now + 1.0);
          break;
        case 'Flow':
          osc.frequency.value = 523.25;
          osc.type = 'triangle';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.9);
          osc.stop(now + 0.8);
          const osc2 = audioCtx.createOscillator();
          osc2.frequency.value = 659.25;
          osc2.type = 'triangle';
          osc2.connect(gainNode);
          osc2.start(now + 0.2);
          osc2.stop(now + 1.0);
          break;
        case 'iPhone Note':
          osc.frequency.value = 880;
          osc.type = 'square';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
          osc.stop(now + 1.2);
          break;
        case 'Clear Tone':
          osc.frequency.value = 1046.5;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
          osc.stop(now + 0.5);
          const osc3 = audioCtx.createOscillator();
          osc3.frequency.value = 783.99;
          osc3.type = 'sine';
          osc3.connect(gainNode);
          osc3.start(now + 0.5);
          osc3.stop(now + 1.0);
          break;
        case 'LG Note':
          osc.frequency.value = 440;
          osc.type = 'sawtooth';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2);
          osc.stop(now + 1.8);
          break;
        case 'Telegram Note':
          osc.frequency.value = 880;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
          osc.stop(now + 0.6);
          const oscT = audioCtx.createOscillator();
          oscT.frequency.value = 1244.5;
          oscT.type = 'sine';
          oscT.connect(gainNode);
          oscT.start(now + 0.3);
          oscT.stop(now + 0.8);
          break;
        case 'Spongebob Note':
          osc.frequency.value = 523.25;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          osc.stop(now + 0.4);
          const oscS = audioCtx.createOscillator();
          oscS.frequency.value = 698.46;
          oscS.type = 'sine';
          oscS.connect(gainNode);
          oscS.start(now + 0.5);
          oscS.stop(now + 1.0);
          break;
        default:
          osc.frequency.value = 800;
          osc.type = 'sine';
          osc.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.8);
          osc.stop(now + 0.7);
      }
      audioCtx.resume();
    } catch(e) {
      console.log('Audio not supported or blocked', e);
    }
  }

  function finishTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning = false;
    if (elements.playPauseText) elements.playPauseText.innerText = 'Start';
    const selectedAlarm = elements.alarmSelect ? elements.alarmSelect.value : 'Message Tones';
    playAlarm(selectedAlarm);
    if (onCompleteCallback) onCompleteCallback();
    currentSeconds = currentWorkDurationMinutes * 60;
    updateDisplay();
    if (onStatusChangeCallback) onStatusChangeCallback('ready');
    saveState();
  }

  function tick() {
    if (currentSeconds <= 0) {
      if (isRunning) finishTimer();
      return;
    }
    currentSeconds--;
    updateDisplay();
    if (onTickCallback) onTickCallback(currentSeconds);
    if (currentSeconds === 0) finishTimer();
    saveState();
  }

  function start() {
    if (timerInterval) clearInterval(timerInterval);
    isRunning = true;
    if (elements.playPauseText) elements.playPauseText.innerText = 'Pause';
    if (onStatusChangeCallback) onStatusChangeCallback('focusing');
    timerInterval = setInterval(() => {
      if (isRunning) tick();
    }, 1000);
    saveState();
  }

  function pause() {
    isRunning = false;
    if (elements.playPauseText) elements.playPauseText.innerText = 'Start';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (onStatusChangeCallback) onStatusChangeCallback('paused');
    saveState();
  }

  function reset() {
    pause();
    currentSeconds = currentWorkDurationMinutes * 60;
    updateDisplay();
    if (elements.playPauseText) elements.playPauseText.innerText = 'Start';
    if (onStatusChangeCallback) onStatusChangeCallback('reset');
    saveState();
  }

  function setWorkDuration(minutes) {
    currentWorkDurationMinutes = minutes;
    if (!isRunning) {
      currentSeconds = currentWorkDurationMinutes * 60;
      updateDisplay();
    }
    saveState();
  }

  function getWorkDuration() {
    return currentWorkDurationMinutes;
  }

  function getCurrentSeconds() {
    return currentSeconds;
  }

  function getIsRunning() {
    return isRunning;
  }

  function saveState() {
    Storage.saveTimerState({
      currentSeconds: currentSeconds,
      isRunning: isRunning,
      workDuration: currentWorkDurationMinutes,
      selectedAlarm: elements.alarmSelect ? elements.alarmSelect.value : 'Message Tones'
    });
  }

  function loadState() {
    const saved = Storage.loadTimerState();
    if (saved) {
      currentWorkDurationMinutes = saved.workDuration || 25;
      currentSeconds = saved.currentSeconds || (currentWorkDurationMinutes * 60);
      if (currentSeconds <= 0) currentSeconds = currentWorkDurationMinutes * 60;
      if (elements.workMinutesInput) elements.workMinutesInput.value = currentWorkDurationMinutes;
      if (elements.alarmSelect && saved.selectedAlarm) elements.alarmSelect.value = saved.selectedAlarm;
      updateDisplay();
      if (saved.isRunning) {
        start();
      }
    }
  }

  function init(elementIds) {
    elements.display = document.getElementById(elementIds.display);
    elements.playPauseText = document.getElementById(elementIds.playPauseText);
    elements.statusSpan = document.getElementById(elementIds.statusSpan);
    elements.workMinutesInput = document.getElementById(elementIds.workMinutes);
    elements.alarmSelect = document.getElementById(elementIds.alarmSelect);
    
    if (elements.workMinutesInput) {
      elements.workMinutesInput.addEventListener('change', () => {
        const val = parseInt(elements.workMinutesInput.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 99) {
          setWorkDuration(val);
        }
      });
    }
    
    loadState();
  }

  function setCallbacks(callbacks) {
    if (callbacks.onTick) onTickCallback = callbacks.onTick;
    if (callbacks.onComplete) onCompleteCallback = callbacks.onComplete;
    if (callbacks.onStatusChange) onStatusChangeCallback = callbacks.onStatusChange;
  }

  return {
    init,
    start,
    pause,
    reset,
    setWorkDuration,
    getWorkDuration,
    getCurrentSeconds,
    getIsRunning,
    setCallbacks
  };
})();
