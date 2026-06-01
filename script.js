
const FOCUS_TIME = 25 * 60;  
const BREAK_TIME =  5 * 60;  


let mode      = 'focus';
let timeLeft  = FOCUS_TIME;
let totalTime = FOCUS_TIME;
let running   = false;
let interval  = null;


let sessions = parseInt(localStorage.getItem('sessions') || '0');
let streak   = parseInt(localStorage.getItem('streak')   || '0');
let breaks   = parseInt(localStorage.getItem('breaks')   || '0');


let audio        = null;
let musicPlaying = false;


function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

function updateStats() {
  document.getElementById('sessions').textContent = sessions;
  document.getElementById('streak').textContent   = streak;
  document.getElementById('breaks').textContent   = breaks;
}


function saveStats() {
  localStorage.setItem('sessions', sessions);
  localStorage.setItem('streak',   streak);
  localStorage.setItem('breaks',   breaks);
}


function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}


function playBeep() {
  try {
    const ctx = new AudioContext();
    [0, 0.2, 0.4].forEach(function(delay) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02);
      gain.gain.linearRampToValueAtTime(0,   ctx.currentTime + delay + 0.22);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime  + delay + 0.25);
    });
  } catch(e) {}
}


function tick() {
  if (timeLeft <= 0) {
    clearInterval(interval);
    running = false;
    document.getElementById('startBtn').textContent = 'Start';
    playBeep();

    if (mode === 'focus') {
      sessions++;
      streak++;
      saveStats();
      updateStats();
      showToast('🎉 Session done! Take a break.');
      setTimeout(function() { switchMode('break'); }, 1500);
    } else {
      breaks++;
      saveStats();
      updateStats();
      showToast('💪 Break over! Time to focus.');
      setTimeout(function() { switchMode('focus'); }, 1500);
    }
    return;
  }

  timeLeft--;
  document.getElementById('timer').textContent = fmt(timeLeft);
}


function startPause() {
  if (running) {
    clearInterval(interval);
    running = false;
    document.getElementById('startBtn').textContent = 'Resume';
  } else {
    interval = setInterval(tick, 1000);
    running  = true;
    document.getElementById('startBtn').textContent = 'Pause';
  }
}


function resetTimer() {
  clearInterval(interval);
  running  = false;
  timeLeft = totalTime;
  document.getElementById('timer').textContent    = fmt(timeLeft);
  document.getElementById('startBtn').textContent = 'Start';
}


function switchMode(m) {
  if (running) { clearInterval(interval); running = false; }

  mode      = m;
  totalTime = (m === 'focus') ? FOCUS_TIME : BREAK_TIME;
  timeLeft  = totalTime;

  document.getElementById('timer').textContent    = fmt(timeLeft);
  document.getElementById('startBtn').textContent = 'Start';

 
  document.getElementById('focusBtn').classList.toggle('active', m === 'focus');
  document.getElementById('breakBtn').classList.toggle('active', m === 'break');
}


function loadTrack(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (audio) {
    audio.pause();
    URL.revokeObjectURL(audio.src);
  }

  audio = new Audio(URL.createObjectURL(file));
  audio.loop = true;

  document.getElementById('trackName').textContent = file.name.replace(/\.[^.]+$/, '');
  document.getElementById('playBtn').disabled = false;
  musicPlaying = false;
  document.getElementById('playBtn').textContent = '▶';
}

function toggleMusic() {
  if (!audio) return;
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    document.getElementById('playBtn').textContent = '▶';
  } else {
    audio.play();
    musicPlaying = true;
    document.getElementById('playBtn').textContent = '⏸';
  }
}


updateStats();
