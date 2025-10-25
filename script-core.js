// ==========================
// Allen Spelling Bee v5.8.1 — Core Logic
// ==========================

// 快捷選取
const $ = s => document.querySelector(s);
const app = $("#app");

// === 初始化 ===
window.addEventListener("DOMContentLoaded", () => {
  // 開場動畫結束後進入主畫面
  setTimeout(() => {
    $("#intro-screen").style.display = "none";
    $("#app").style.display = "block";
    initApp();
  }, 4000); // intro 3s + fade 1s
});

// === 主程式入口 ===
function initApp() {
  app.innerHTML = `
    <div class="card">
      <h2>🔥 每日挑戰</h2>
      <button class="btn" onclick="startDaily()">開始挑戰（20 題）</button>
    </div>
    <div class="card">
      <h2>📘 練習區</h2>
      <button class="btn" onclick="startPractice()">開始一般練習</button>
    </div>
    <div class="card">
      <h2>🏅 我的統計</h2>
      <div id="statsArea"></div>
    </div>
  `;
  renderStats();
}

// === 題庫與狀態 ===
let STATE = { list: [], index: 0, correct: 0, total: 0 };
function loadAllWords() {
  const all = [];
  for (const k in BANKS) (BANKS[k] || []).forEach(it => all.push(it));
  return all;
}

// === 練習模式 ===
function startPractice() {
  STATE.list = shuffle(loadAllWords()).slice(0, 25);
  STATE.index = 0; STATE.correct = 0; STATE.total = 0;
  showQuestion();
}

function showQuestion() {
  if (STATE.index >= STATE.list.length) return showResult();
  const w = STATE.list[STATE.index];
  app.innerHTML = `
    <div class="card">
      <h2>第 ${STATE.index + 1} / ${STATE.list.length} 題</h2>
      <p>請聽發音並輸入拼字</p>
      <input id="ans" class="input" placeholder="輸入英文單字" autocomplete="off"
        onkeydown="if(event.key==='Enter'){checkAns();}">
      <button class="btn" onclick="speak('${w.word}')">🔊 播放發音</button>
      <button class="btn" onclick="checkAns()">確認</button>
    </div>
    <div id="fb" class="small"></div>
  `;
  speak(w.word);
  $("#ans").focus();
}

function checkAns() {
  const input = $("#ans").value.trim().toLowerCase();
  const w = STATE.list[STATE.index];
  if (!input) return;
  const ok = input === w.word.toLowerCase();
  STATE.total++;
  if (ok) {
    STATE.correct++;
    $("#fb").innerHTML = `<span style="color:#5bd68a">✔ 正確！</span> 中文：${w.meaning}`;
  } else {
    $("#fb").innerHTML = `<span style="color:#ff6b6b">✘ 錯誤</span> 中文：${w.meaning}，正確：${w.word}`;
  }
  STATE.index++;
  setTimeout(showQuestion, 800);
}

function showResult() {
  const rate = Math.round((STATE.correct / STATE.total) * 100);
  app.innerHTML = `
    <div class="card">
      <h2>✅ 練習完成</h2>
      <p>答對 ${STATE.correct} / ${STATE.total} 題 (${rate}%)</p>
      <button class="btn" onclick="initApp()">回主頁</button>
    </div>
  `;
}

// === 每日挑戰（簡化版） ===
function startDaily() {
  STATE.list = shuffle(loadAllWords()).slice(0, 20);
  STATE.index = 0; STATE.correct = 0; STATE.total = 0;
  showQuestion();
}

// === 工具函式 ===
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// === TTS ===
function speak(t) {
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  u.rate = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// === 簡單統計 ===
function renderStats() {
  const s = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0}');
  $("#statsArea").innerHTML = `
    <p>累積練習次數：${s.runs || 0}</p>
    <button class="btn" onclick="clearStats()">清除紀錄</button>
  `;
}
function clearStats() {
  localStorage.removeItem("allen_stats");
  renderStats();
}
