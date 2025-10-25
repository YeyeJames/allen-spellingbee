// ==========================
// Allen Spelling Bee v5.8.1 — Store & Theme Module
// ==========================

// === 狀態與初始化 ===
const STORE_KEY = "allen_store_settings";
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
  catch { return {}; }
}
function saveStore(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

// === 顏色主題 ===
function applyTheme(theme) {
  document.body.classList.remove("blue", "nebula");
  if (theme) document.body.classList.add(theme);
  const s = loadStore();
  s.theme = theme;
  saveStore(s);

  if (theme === "nebula") {
    startNebula();
    playNebulaBgm();
  } else {
    stopNebula();
    stopNebulaBgm();
  }
}

// === 星雲動畫 ===
let nebulaCtx, nebulaAnim;
function startNebula() {
  const cvs = document.getElementById("nebula-bg");
  nebulaCtx = cvs.getContext("2d");
  let w = cvs.width = window.innerWidth;
  let h = cvs.height = window.innerHeight;
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: 0.6 + Math.random() * 1.2,
  }));
  cancelAnimationFrame(nebulaAnim);
  function loop() {
    nebulaCtx.fillStyle = "rgba(10,15,25,0.15)";
    nebulaCtx.fillRect(0, 0, w, h);
    for (const s of stars) {
      nebulaCtx.beginPath();
      nebulaCtx.fillStyle = `hsl(${(s.x + s.y) % 360},90%,70%)`;
      nebulaCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      nebulaCtx.fill();
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
    }
    nebulaAnim = requestAnimationFrame(loop);
  }
  loop();
}
function stopNebula() {
  if (nebulaCtx) nebulaCtx.clearRect(0, 0, innerWidth, innerHeight);
  cancelAnimationFrame(nebulaAnim);
}

// === 星雲環境音 ===
let nebulaAudio;
function playNebulaBgm() {
  const s = loadStore();
  if (s.bgmMuted) return;
  if (!nebulaAudio) {
    nebulaAudio = new Audio("assets/bgm_nebula.mp3");
    nebulaAudio.loop = true;
    nebulaAudio.volume = 0.15;
  }
  nebulaAudio.play().catch(()=>{});
}
function stopNebulaBgm() { if (nebulaAudio) nebulaAudio.pause(); }

// === 商店畫面 ===
function openStore() {
  const coins = parseInt(localStorage.getItem("allen_coins") || "0", 10);
  const store = loadStore();
  app.innerHTML = `
    <div class="card">
      <h2>🎁 小商店</h2>
      <p>目前持有 <span class="coin">${coins}</span> 幣</p>
      <div id="storeItems"></div>
      <button class="btn" onclick="applyTheme('')">🔄 恢復預設主題</button>
      <button class="btn" onclick="initApp()">回主頁</button>
    </div>`;
  renderStoreItems(store, coins);
}

function renderStoreItems(store, coins) {
  const items = [
    { id: "blue", name: "藍色主題", price: 30, action: () => applyTheme("blue") },
    { id: "nebula", name: "🌌 星雲主題", price: 50, action: () => applyTheme("nebula") },
    { id: "fx", name: "星光爆 Plus 特效", price: 40, action: () => alert("✨ 特效升級已啟用！") },
    { id: "piano", name: "鋼琴音效包", price: 25, action: () => alert("🎹 音效已啟用！") },
    { id: "unicorn", name: "🦄 探險者 Allen 徽章", price: 100, action: () => alert("🏅 已解鎖 探險者 Allen！") },
  ];
  const html = items.map(it => {
    const owned = store[it.id];
    const enough = coins >= it.price;
    return `<div class="card small" style="margin:8px 0;padding:10px 14px">
      <b>${it.name}</b>　—　${it.price} 幣
      <button class="btn" style="float:right" onclick="buyItem('${it.id}')"
        ${owned ? "disabled" : ""}>
        ${owned ? "✅ 已擁有" : (enough ? "兌換" : "💸 不足")}
      </button>
    </div>`;
  }).join("");
  $("#storeItems").innerHTML = html;
}

function buyItem(id) {
  const coins = parseInt(localStorage.getItem("allen_coins") || "0", 10);
  const items = {
    blue: { price: 30, fn: () => applyTheme("blue") },
    nebula: { price: 50, fn: () => applyTheme("nebula") },
    fx: { price: 40, fn: () => alert("✨ 特效升級已啟用！") },
    piano: { price: 25, fn: () => alert("🎹 音效已啟用！") },
    unicorn: { price: 100, fn: () => alert("🏅 已解鎖 探險者 Allen！") },
  };
  const it = items[id];
  if (!it) return;
  if (coins < it.price) { alert("💸 單字幣不足！"); return; }

  localStorage.setItem("allen_coins", coins - it.price);
  const store = loadStore();
  store[id] = true;
  saveStore(store);
  alert("✅ 已兌換：" + id);
  it.fn();
  openStore();
}

// === 初始化主題 ===
window.addEventListener("load", () => {
  const s = loadStore();
  if (s.theme) applyTheme(s.theme);
});
