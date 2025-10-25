// ===============================
// missions.js — 每日任務與獎勵機制（挑戰版）
// ===============================

(function () {
  const MISSIONS_KEY = "allen_missions";
  const LAST_DATE_KEY = "allen_mission_date";
  const COINS_KEY = "allen_coins";

  const CHALLENGE_POOL = [
    { id: "daily", desc: "完成 1 次每日挑戰", check: () => getStat("dailyRuns") >= 1 },
    { id: "twenty", desc: "答對 20 題", check: () => getStat("correct") >= 20 },
    { id: "fiftyCoins", desc: "賺取 50 單字幣", check: () => getCoinsGained() >= 50 },
    { id: "streak10", desc: "達成 10 題連勝", check: () => getStat("maxStreak") >= 10 },
    { id: "record10", desc: "錄音 10 次提示", check: () => getStat("recordings") >= 10 }
  ];

  // === 任務初始化 ===
  function ensureMissions() {
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem(LAST_DATE_KEY);
    if (last !== today) {
      const missions = shuffle(CHALLENGE_POOL).slice(0, 5);
      missions.forEach(m => m.done = false);
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
      localStorage.setItem(LAST_DATE_KEY, today);
      setStat("coinsGained", 0);
    }
  }

  // === 更新任務進度 ===
  function updateMissions() {
    ensureMissions();
    const missions = JSON.parse(localStorage.getItem(MISSIONS_KEY) || "[]");
    let allDone = true;
    missions.forEach(m => {
      if (!m.done && m.check()) {
        m.done = true;
        addCoins(20);
        Meow.say("complete");
        coinsRain();
        dispatchEvent(new CustomEvent("allen:buy")); // 觸發煙火
      }
      if (!m.done) allDone = false;
    });
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));

    if (allDone) {
      addCoins(50);
      fireworks();
      Meow.say("complete");
    }
  }

  // === 顯示任務面板 ===
  window.showMissions = function () {
    ensureMissions();
    const missions = JSON.parse(localStorage.getItem(MISSIONS_KEY) || "[]");
    const html = missions.map(m =>
      `<li>${m.done ? "✅" : "⬜"} ${m.desc}</li>`).join("");
    app.innerHTML = `
      <div class="card">
        <h2>📋 今日任務</h2>
        <ul style="font-size:20px;line-height:1.6">${html}</ul>
        <button class="btn" onclick="initApp()">回主頁</button>
      </div>`;
  };

  // === 工具 ===
  function addCoins(x) {
    const c = parseInt(localStorage.getItem(COINS_KEY) || 0) + x;
    localStorage.setItem(COINS_KEY, c);
  }

  function getStat(key) {
    const s = JSON.parse(localStorage.getItem("allen_stats") || "{}");
    return s[key] || 0;
  }
  function setStat(key, val) {
    const s = JSON.parse(localStorage.getItem("allen_stats") || "{}");
    s[key] = val; localStorage.setItem("allen_stats", JSON.stringify(s));
  }
  function getCoinsGained() {
    const s = JSON.parse(localStorage.getItem("allen_stats") || "{}");
    return s.coinsGained || 0;
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // === 初始化任務板 ===
  ensureMissions();
  updateMissions();

  // 在答題、完成時自動更新
  window.addEventListener("allen:correct", updateMissions);
  window.addEventListener("allen:complete", updateMissions);
})();