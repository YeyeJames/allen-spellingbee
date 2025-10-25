// ============================
// Allen Spelling Bee — Core v7A
// ============================

const $ = s => document.querySelector(s);
const app = $("#app");
let STATE = {};

// === 啟動 ===
window.addEventListener("DOMContentLoaded", () => {
  startStars();
  showMenu();
});

// === 主選單 ===
function showMenu() {
  app.innerHTML = `
    <h1 class="big">🌀 Allen Spelling Bee</h1>
    <div class="card">
      <h2>📚 分週練習</h2>
      <div id="weekButtons"></div>
    </div>
    <div class="card">
      <h2>🔥 每日挑戰</h2>
      <button class="btn" onclick="startDaily()">開始挑戰（20 題）</button>
    </div>
    <div class="card">
      <h2>🏅 統計資料</h2>
      <div id="stats"></div>
    </div>
  `;
  renderWeekButtons();
  renderStats();
}

function renderWeekButtons() {
  $("#weekButtons").innerHTML = Object.keys(BANKS)
    .map(w => `<button class="btn" onclick="startWeek('${w}')">Week ${w}</button>`)
    .join(" ");
}

function renderStats() {
  const stats = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0,"avg":0}');
  $("#stats").innerHTML = `
    <p>練習次數：${stats.runs}</p>
    <p>平均正確率：${stats.avg.toFixed ? stats.avg.toFixed(1) : 0}%</p>
    <button class="btn" onclick="resetStats()">清除紀錄</button>`;
}

function resetStats() {
  localStorage.removeItem("allen_stats");
  renderStats();
}

// === 分週練習 ===
function startWeek(week) {
  STATE = {
    mode: "week",
    week,
    list: shuffle([...BANKS[week]]),
    index: 0,
    correct: 0,
    total: BANKS[week].length,
    streak: 0
  };
  showQuestion();
}

// === 每日挑戰 ===
function startDaily() {
  STATE = {
    mode: "daily",
    list: shuffle(loadAllWords()).slice(0, 20),
    index: 0,
    correct: 0,
    total: 20,
    streak: 0
  };
  showQuestion();
}

// === 顯示題目 ===
function showQuestion() {
  if (STATE.index >= STATE.list.length) return showResult();

  const w = STATE.list[STATE.index];
  app.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;">
        <h2>${STATE.mode === "daily" ? "🔥 每日挑戰" : `Week ${STATE.week}`}</h2>
        <button class="btn small" onclick="showMenu()">返回</button>
      </div>
      <p>第 ${STATE.index + 1} / ${STATE.total} 題</p>
      <input id="ans" class="input" placeholder="輸入英文單字" onkeydown="if(event.key==='Enter'){checkAns();}">
      <div style="margin-top:10px;">
        <button class="btn" onclick="speak('${w.word}')">🔊 播放發音</button>
        <button class="btn" onclick="checkAns()">確認</button>
      </div>
      <div id="feedback" class="small" style="margin-top:15px;min-height:80px;"></div>
      <div style="margin-top:10px;">
        <button class="btn" onclick="playHint('${w.word}')">💡 提示</button>
        <button class="btn" onclick="recordHint('${w.word}')">🎙️ 錄音提示</button>
        <div id="recordingStatus"></div>
      </div>
    </div>`;
  speak(w.word);
  $("#ans").focus();
}

// === 檢查答案 ===
function checkAns() {
  const ans = $("#ans").value.trim().toLowerCase();
  if (!ans) return;
  const w = STATE.list[STATE.index];
  const correct = w.word.toLowerCase();
  const ok = ans === correct;

  let fb = "";
  if (ok) {
    STATE.correct++;
    STATE.streak++;
    const bonus = calcBonus();
    fb = `<span style="color:#5bd68a">✔ 正確！</span> ${w.meaning}<br>💰 +${bonus} 幣`;
  } else {
    STATE.streak = 0;
    fb = `<span style="color:#ff6b6b">✘ 錯誤</span> 正確答案：${w.word} (${w.meaning})`;
  }

  $("#feedback").innerHTML = `${fb}<br><br><button class="btn" onclick="nextQuestion()">下一題 ➜</button>`;
}

function nextQuestion() {
  STATE.index++;
  showQuestion();
}

// === 結果 ===
function showResult() {
  const rate = Math.round((STATE.correct / STATE.total) * 100);
  const modeText = STATE.mode === "daily" ? "每日挑戰" : `Week ${STATE.week}`;
  app.innerHTML = `
    <div class="card">
      <h2>✅ ${modeText} 完成</h2>
      <p>答對 ${STATE.correct}/${STATE.total} 題 (${rate}%)</p>
      <button class="btn" onclick="showMenu()">回主畫面</button>
    </div>`;
  saveStats(rate);
}

function saveStats(rate) {
  const s = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0,"avg":0}');
  s.runs++;
  s.avg = (s.avg * (s.runs - 1) + rate) / s.runs;
  localStorage.setItem("allen_stats", JSON.stringify(s));
}

// === 工具 ===
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadAllWords() {
  const all = [];
  for (const k in BANKS) (BANKS[k] || []).forEach(it => all.push(it));
  return all;
}

function calcBonus() {
  if (STATE.streak >= 10) return 3;
  if (STATE.streak >= 5) return 2;
  return 1;
}

// === 發音 ===
function speak(t) {
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  u.rate = 0.9;
  u.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// === 錄音提示 ===
let recorder, countdownTimer, timeLeft = 10;

function playHint(word) {
  const saved = localStorage.getItem("hint_" + word);
  if (!saved) return alert("⚠️ 尚無提示錄音");
  new Audio(saved).play();
}

function recordHint(word) {
  const btn = event.target;
  const status = $("#recordingStatus");
  if (btn.dataset.recording === "true") return stopRecording(word, btn, status);

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/mp3" });
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("hint_" + word, reader.result);
        status.textContent = "✅ 錄音已儲存！";
        setTimeout(() => status.textContent = "", 2000);
      };
      reader.readAsDataURL(blob);
    };
    recorder.start();
    btn.textContent = "⏹️ 停止錄音";
    btn.dataset.recording = "true";
    timeLeft = 10;
    status.textContent = `🎙️ 錄音中… (${timeLeft})`;
    countdownTimer = setInterval(() => {
      timeLeft--;
      status.textContent = `🎙️ 錄音中… (${timeLeft})`;
      if (timeLeft <= 0) stopRecording(word, btn, status);
    }, 1000);
  }).catch(() => alert("無法使用錄音功能"));
}

function stopRecording(word, btn, status) {
  clearInterval(countdownTimer);
  if (recorder && recorder.state === "recording") recorder.stop();
  btn.textContent = "🎙️ 錄音提示";
  btn.dataset.recording = "false";
  status.textContent = "";
}

// === 星空背景 ===
function startStars() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let w, h; const stars = [];
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener("resize", resize); resize();
  for (let i = 0; i < 60; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5, s: Math.random() * 0.5 + 0.2 });
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    stars.forEach(star => {
      ctx.globalAlpha = Math.random() * 0.5 + 0.3;
      ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
      star.y += star.s; if (star.y > h) star.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}