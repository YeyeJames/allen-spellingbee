// ============================
// Allen Spelling Bee — Core v6A
// ============================

const $ = s => document.querySelector(s);
const app = $("#app");
let STATE = { view: "menu", list: [], index: 0, correct: 0, total: 0, streak: 0 };
let recorder, countdownTimer, timeLeft = 10;

// === 初始化 ===
window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Allen Spelling Bee Loaded");
  initApp();
});

// === 主畫面 ===
function initApp() {
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
      <h2>🏅 我的統計</h2>
      <div id="statsArea"></div>
    </div>
    <div class="card">
      <h2>🎁 小商店</h2>
      <button class="btn" onclick="openStore()">進入小商店</button>
    </div>
  `;
  renderWeekButtons();
  renderStats();
}

function renderWeekButtons() {
  const container = $("#weekButtons");
  container.innerHTML = Object.keys(BANKS)
    .map(wk => `<button class="btn" onclick="startWeek('${wk}')">Week ${wk}</button>`)
    .join(" ");
}

// === 啟動每週練習 ===
function startWeek(week) {
  STATE = { mode: "week", week, list: shuffle([...BANKS[week]]), index: 0, correct: 0, total: 0, streak: 0 };
  showQuestion();
}

// === 每日挑戰 ===
function startDaily() {
  STATE = { mode: "daily", week: null, list: shuffle(loadAllWords()).slice(0, 20), index: 0, correct: 0, total: 0, streak: 0 };
  showQuestion();
}

// === 顯示題目 ===
function showQuestion() {
  if (STATE.index >= STATE.list.length) return showResult();
  const w = STATE.list[STATE.index];
  const header = STATE.mode === "daily" ? "🔥 每日挑戰" : `Week ${STATE.week}`;
  app.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>${header}</h2>
        <button class="btn small" onclick="confirmBack()">返回</button>
      </div>
      <div class="coin-rule">
        💰 連勝加成：1–4 題 +1 幣｜5–9 題 +2 幣｜10 題以上 +3 幣
      </div>
      <p>第 ${STATE.index + 1} / ${STATE.list.length} 題</p>
      <input id="ans" class="input" placeholder="輸入英文單字" autocomplete="off"
        onkeydown="if(event.key==='Enter'){checkAns();}">
      <div style="margin-top:10px;">
        <button class="btn" onclick="speak('${w.word}')">🔊 播放發音</button>
        <button class="btn" onclick="checkAns()">確認</button>
      </div>
      <div id="feedback" class="small" style="margin-top:12px;min-height:80px;"></div>
      <div id="hintArea" style="margin-top:8px;">
        <button class="btn" onclick="playHint('${w.word}')">💡 提示</button>
        <button class="btn" id="recordBtn" onclick="recordHint('${w.word}')">🎙️ 錄音提示</button>
        <div id="recordingStatus"></div>
      </div>
    </div>`;
  speak(w.word);
  $("#ans").focus();
}

// === 答題判斷 ===
function checkAns() {
  const ansBox = $("#ans");
  if (!ansBox) return;
  const input = ansBox.value.trim().toLowerCase();
  if (!input) return;

  const w = STATE.list[STATE.index];
  if (!w || !w.word) {
    $("#feedback").innerHTML = "⚠️ 題庫載入錯誤";
    return;
  }

  const ok = input === w.word.toLowerCase();
  STATE.total++;

  let fb = "";
  if (ok) {
    STATE.correct++;
    STATE.streak++;
    const bonus = rewardCoins();
    fb = `<span style="color:#5bd68a">✔ 正確！</span> ${w.meaning}<br>💰 +${bonus} 幣（連續 ${STATE.streak} 題）`;
  } else {
    STATE.streak = 0;
    fb = `<span style="color:#ff6b6b">✘ 錯誤</span> 正確答案：${w.word} (${w.meaning})<br>💔 連勝歸零`;
  }

  $("#feedback").innerHTML = `${fb}<br><br><button class="btn" onclick="nextQuestion()">下一題 ➜</button>`;
}

function nextQuestion() {
  STATE.index++;
  showQuestion();
}

// === 回主畫面 ===
function confirmBack() {
  if (confirm("確定要返回主畫面嗎？進度將不保存。")) initApp();
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

// === 單字幣加成 ===
function rewardCoins() {
  const c = parseInt(localStorage.getItem("allen_coins") || "0", 10);
  let bonus = 1;
  if (STATE.streak >= 10) bonus = 3;
  else if (STATE.streak >= 5) bonus = 2;
  const newCoins = c + bonus;
  localStorage.setItem("allen_coins", newCoins);
  return bonus;
}

// === 結果頁 ===
function showResult() {
  const rate = Math.round((STATE.correct / STATE.total) * 100);
  const modeText = STATE.mode === "daily" ? "每日挑戰" : `Week ${STATE.week}`;
  app.innerHTML = `
    <div class="card">
      <h2>✅ ${modeText} 完成</h2>
      <p>答對 ${STATE.correct}/${STATE.total} 題 (${rate}%)</p>
      <button class="btn" onclick="initApp()">回主畫面</button>
    </div>`;
}

// === 提示錄音 ===
function playHint(word) {
  const saved = localStorage.getItem("hint_" + word);
  if (!saved) { alert("⚠️ 尚無提示錄音"); return; }
  const audio = new Audio(saved);
  audio.play();
}

function recordHint(word) {
  const btn = $("#recordBtn");
  const status = $("#recordingStatus");
  if (btn.dataset.recording === "true") {
    stopRecording(word, btn, status);
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("無法使用錄音功能");
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/mp3" });
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("hint_" + word, reader.result);
        btn.classList.add("pulse");
        status.textContent = "✅ 錄音已儲存！";
        const a = new Audio(reader.result);
        a.play();
        setTimeout(() => { btn.classList.remove("pulse"); status.textContent = ""; }, 2000);
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
  }).catch(() => alert("錄音權限被拒絕"));
}

function stopRecording(word, btn, status) {
  clearInterval(countdownTimer);
  if (recorder && recorder.state === "recording") recorder.stop();
  btn.textContent = "🎙️ 錄音提示";
  btn.dataset.recording = "false";
  status.textContent = "";
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

function renderStats() {
  const s = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0,"avg":0}');
  $("#statsArea").innerHTML = `
    <p>累積練習次數：${s.runs || 0}</p>
    <p>平均正確率：${s.avg ? s.avg.toFixed(1) : 0}%</p>
    <button class="btn" onclick="clearStats()">清除紀錄</button>`;
}

function clearStats() {
  localStorage.removeItem("allen_stats");
  renderStats();
}