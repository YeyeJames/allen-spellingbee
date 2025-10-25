// ===============================
// Allen Spelling Bee v5.9 - Kids Enhanced Edition
// ===============================

// 快捷選取
const $ = s => document.querySelector(s);
const app = $("#app");

// === 全域狀態 ===
let STATE = {
  list: [],
  index: 0,
  correct: 0,
  total: 0,
  streak: 0,
  coins: parseInt(localStorage.getItem("allen_coins") || 0)
};

// === 初始化 ===
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    $("#intro-screen")?.remove();
    $("#app").style.display = "block";
    initApp();
  }, 3500); // intro 動畫後
});

// === 主畫面 ===
function initApp() {
  app.innerHTML = `
    <div class="card">
      <h1>🌟 Allen Spelling Bee</h1>
      <p>今天要練習什麼呢？</p>
      <div class="row">
        <button class="btn" onclick="startDaily()">🔥 每日挑戰</button>
        <button class="btn" onclick="startPractice()">📘 一般練習</button>
        <button class="btn" onclick="startWrong()">❌ 錯題練習</button>
      </div>
    </div>
    <div class="card">
      <h2>🏅 我的統計</h2>
      <div id="statsArea"></div>
      <p class="small">💰 單字幣：<span id="coinCount">${STATE.coins}</span></p>
    </div>
  `;
  renderStats();
  dispatchEvent(new CustomEvent("allen:start")); // 喵老師：問候
}

// === 題庫處理 ===
function loadAllWords() {
  const all = [];
  for (const k in BANKS) (BANKS[k] || []).forEach(it => all.push(it));
  return all;
}

// === 開始一般練習 ===
function startPractice() {
  dispatchEvent(new CustomEvent("allen:start"));
  STATE.list = shuffle(loadAllWords()).slice(0, 25);
  resetProgress();
  showQuestion();
}

// === 開始每日挑戰 ===
function startDaily() {
  dispatchEvent(new CustomEvent("allen:start"));
  STATE.list = shuffle(loadAllWords()).slice(0, 20);
  resetProgress();
  showQuestion();
}

// === 錯題練習（簡化版） ===
function startWrong() {
  const wrongList = JSON.parse(localStorage.getItem("allen_wrong") || "[]");
  if (!wrongList.length) {
    alert("目前沒有錯題喔！");
    return;
  }
  dispatchEvent(new CustomEvent("allen:start"));
  STATE.list = shuffle(wrongList);
  resetProgress();
  showQuestion();
}

// === 顯示題目 ===
function showQuestion() {
  if (STATE.index >= STATE.list.length) return showResult();

  const w = STATE.list[STATE.index];
  app.innerHTML = `
    <div class="card">
      <h2>第 ${STATE.index + 1} / ${STATE.list.length} 題</h2>
      <p>請聽發音並輸入正確拼字：</p>
      <input id="ans" class="input" placeholder="輸入英文單字" autocomplete="off"
        onkeydown="if(event.key==='Enter'){checkAns();}">
      <div class="row" style="margin-top:12px">
        <button class="btn" onclick="speak('${w.word}')">🔊 播放發音</button>
        <button class="btn" onclick="checkAns()">確認</button>
      </div>
    </div>
    <div id="fb" class="small"></div>
  `;
  speak(w.word);
  $("#ans").focus();
}

// === 檢查答案 ===
function checkAns() {
  const input = $("#ans").value.trim().toLowerCase();
  const w = STATE.list[STATE.index];
  if (!input) return;

  const ok = input === w.word.toLowerCase();
  STATE.total++;

  if (ok) {
    STATE.correct++;
    STATE.streak++;
    STATE.coins += coinReward();
    localStorage.setItem("allen_coins", STATE.coins);
    $("#fb").innerHTML = `<span style="color:#5bd68a">✔ 正確！</span> 中文：${w.meaning}`;
    $("#coinCount").innerText = STATE.coins;
    markStats(true);
    dispatchEvent(new CustomEvent("allen:correct"));
  } else {
    STATE.streak = 0;
    $("#fb").innerHTML = `<span style="color:#ff6b6b">✘ 錯誤</span> 中文：${w.meaning}<br>正確拼法：${w.word}`;
    markWrong(w);
    markStats(false);
    dispatchEvent(new CustomEvent("allen:wrong"));
  }

  STATE.index++;
  setTimeout(showQuestion, 1000);
}

// === 顯示結果 ===
function showResult() {
  const rate = Math.round((STATE.correct / STATE.total) * 100);
  app.innerHTML = `
    <div class="card">
      <h2>✅ 挑戰完成！</h2>
      <p>答對 ${STATE.correct} / ${STATE.total} 題（${rate}%）</p>
      <p>💰 獲得單字幣：<b>${STATE.coins}</b></p>
      <button class="btn" onclick="initApp()">回主頁</button>
    </div>
  `;
  dispatchEvent(new CustomEvent("allen:complete"));
}

// === 工具 ===
function resetProgress() {
  STATE.index = 0;
  STATE.correct = 0;
  STATE.total = 0;
  STATE.streak = 0;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// === 發音 ===
function speak(t) {
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  u.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// === 錯題儲存 ===
function markWrong(w) {
  const wrong = JSON.parse(localStorage.getItem("allen_wrong") || "[]");
  if (!wrong.find(x => x.word === w.word)) wrong.push(w);
  localStorage.setItem("allen_wrong", JSON.stringify(wrong));
}

// === 統計 ===
function markStats(ok) {
  const s = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0,"correct":0,"wrong":0}');
  s.runs++;
  if (ok) s.correct++; else s.wrong++;
  localStorage.setItem("allen_stats", JSON.stringify(s));
  renderStats();
}

function renderStats() {
  const s = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0,"correct":0,"wrong":0}');
  const total = s.correct + s.wrong;
  const rate = total ? Math.round((s.correct / total) * 100) : 0;
  $("#statsArea").innerHTML = `
    <p>練習次數：${s.runs}</p>
    <p>累積答對率：${rate}%</p>
    <button class="btn" onclick="clearStats()">清除統計</button>
  `;
}

function clearStats() {
  localStorage.removeItem("allen_stats");
  localStorage.removeItem("allen_wrong");
  renderStats();
}

// === 金幣加成規則 ===
function coinReward() {
  if (STATE.streak >= 10) return 3;
  if (STATE.streak >= 5) return 2;
  return 1;
}