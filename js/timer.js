const Timer = {
  timerInterval: null,
  currentSeconds: 25 * 60,
  isRunning: false,
  currentMode: 'session',
  sessionTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  customTime: 30,
  displayElement: null,
  playPauseTextElement: null,

  updateDisplay() {
    if (!this.displayElement) return;
    const mins = Math.floor(this.currentSeconds / 60);
    const secs = this.currentSeconds % 60;
    this.displayElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  playAlarm() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.3, now);
      const osc = audioCtx.createOscillator();
      osc.connect(gain);
      osc.frequency.value = 880;
      osc.type = 'sine';
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1);
      osc.stop(now + 0.8);
      audioCtx.resume();
    } catch(e) {}
  },

  finishTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
    if (this.playPauseTextElement) this.playPauseTextElement.innerText = 'Start';
    this.playAlarm();
    this.saveState();
  },

  tick() {
    if (this.currentSeconds <= 0) {
      if (this.isRunning) this.finishTimer();
      return;
    }
    this.currentSeconds--;
    this.updateDisplay();
    if (this.currentSeconds === 0) this.finishTimer();
    this.saveState();
  },

  start() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isRunning = true;
    if (this.playPauseTextElement) this.playPauseTextElement.innerText = 'Pause';
    this.timerInterval = setInterval(() => {
      if (this.isRunning) this.tick();
    }, 1000);
    this.saveState();
  },

  pause() {
    this.isRunning = false;
    if (this.playPauseTextElement) this.playPauseTextElement.innerText = 'Start';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.saveState();
  },

  reset() {
    this.pause();
    this.setMode(this.currentMode);
  },

  setMode(mode) {
    this.currentMode = mode;
    let duration = this.sessionTime;
    switch(mode) {
      case 'session': duration = this.sessionTime; break;
      case 'shortBreak': duration = this.shortBreakTime; break;
      case 'longBreak': duration = this.longBreakTime; break;
      case 'custom': duration = this.customTime; break;
    }
    this.currentSeconds = duration * 60;
    this.updateDisplay();
    if (this.playPauseTextElement) this.playPauseTextElement.innerText = 'Start';
    this.isRunning = false;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
      if (btn.dataset.mode === mode) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    
    this.saveState();
  },

  updateDurations(session, short, long, custom) {
    this.sessionTime = session;
    this.shortBreakTime = short;
    this.longBreakTime = long;
    this.customTime = custom;
    this.setMode(this.currentMode);
  },

  saveState() {
    Storage.saveTimerState({
      currentSeconds: this.currentSeconds,
      currentMode: this.currentMode,
      sessionTime: this.sessionTime,
      shortBreakTime: this.shortBreakTime,
      longBreakTime: this.longBreakTime,
      customTime: this.customTime
    });
  },

  loadState() {
    const saved = Storage.loadTimerState();
    if (saved) {
      this.currentSeconds = saved.currentSeconds || 25 * 60;
      this.currentMode = saved.currentMode || 'session';
      this.sessionTime = saved.sessionTime || 25;
      this.shortBreakTime = saved.shortBreakTime || 5;
      this.longBreakTime = saved.longBreakTime || 15;
      this.customTime = saved.customTime || 30;
      this.updateDisplay();
    }
  },

  init(displayId, playPauseTextId) {
    this.displayElement = document.getElementById(displayId);
    this.playPauseTextElement = document.getElementById(playPauseTextId);
    this.loadState();
    this.setMode(this.currentMode);
  }
};
