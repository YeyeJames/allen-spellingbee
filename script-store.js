// ===============================
// Allen Spelling Bee v5.9 - Store Module
// ===============================

window.addEventListener("DOMContentLoaded", () => {
  // 如果有商店按鈕，就插入主畫面底部
  const observer = new MutationObserver(() => {
    if (!document.querySelector("#storeBtn") && document.querySelector("#app")) {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `<button id="storeBtn" class="btn" style="width:100%">🎁 開啟小商店</button>`;
      document.querySelector("#app").appendChild(div);
      $("#storeBtn").onclick = openStore;
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});

// === 商店邏輯 ===
const STORE_ITEMS = [
  { id: "theme_blue", name: "藍色主題", price: 20, action: () => setTheme("blue") },
  { id: "theme_rainbow", name: "🌈 彩虹主題", price: 60, action: () => setTheme("rainbow") },
  { id: "theme_nebula", name: "🌌 星雲主題", price: 50, action: () => setTheme("nebula") },
  { id: "coins_rain", name: "💰 金幣雨特效", price: 35, action: coinsRain },
  { id: "fireworks", name: "🎆 煙火特效", price: 50, action: fireworks },
  { id: "meow_voice", name: "🔈 喵老師語音開關", price: 0, toggle: true }
];

// === 打開商店 ===
function openStore() {
  const coins = parseInt(localStorage.getItem("allen_coins") || 0);
  const settings = JSON.parse(localStorage.getItem("allen_store_settings") || "{}");

  let html = `<div class="card"><h2>🎁 小商店</h2><p>目前擁有 💰 ${coins} 單字幣</p>`;
  STORE_ITEMS.forEach(it => {
    const owned = settings[it.id];
    html += `
      <div class="card" style="padding:14px;margin:10px 0;background:#1b2230">
        <b>${it.name}</b> — ${it.price > 0 ? it.price + " 幣" : "免費"}
        ${it.toggle ? `<br><label><input type="checkbox" id="chk_${it.id}" ${settings.meowVoice!==false?"checked":""}> 啟用</label>` : ""}
        <div style="margin-top:6px">
          ${owned && !it.toggle
            ? `<span style="color:#5bd68a">✅ 已擁有</span>`
            : `<button class="btn" onclick="buyItem('${it.id}')">購買 / 使用</button>`}
        </div>
      </div>`;
  });
  html += `<button class="btn" onclick="initApp()">返回主頁</button></div>`;
  app.innerHTML = html;

  // 綁定語音開關
  $("#chk_meow_voice")?.addEventListener("change", e => {
    const st = JSON.parse(localStorage.getItem("allen_store_settings") || "{}");
    st.meowVoice = e.target.checked;
    localStorage.setItem("allen_store_settings", JSON.stringify(st));
    dispatchEvent(new CustomEvent("allen:buy"));
  });
}

// === 購買項目 ===
function buyItem(id) {
  const coins = parseInt(localStorage.getItem("allen_coins") || 0);
  const settings = JSON.parse(localStorage.getItem("allen_store_settings") || "{}");
  const item = STORE_ITEMS.find(i => i.id === id);
  if (!item) return;
  if (settings[id]) {
    item.action?.();
    return;
  }
  if (coins < item.price) {
    alert("💸 單字幣不足！");
    return;
  }

  // 扣幣 + 保存
  localStorage.setItem("allen_coins", coins - item.price);
  settings[id] = true;
  localStorage.setItem("allen_store_settings", JSON.stringify(settings));

  item.action?.();
  dispatchEvent(new CustomEvent("allen:buy")); // 喵老師說話
  openStore();
}

// === 主題設定 ===
function setTheme(name) {
  document.body.className = name;
  localStorage.setItem("allen_theme", name);
  if (name === "rainbow") {
    document.body.style.background = "linear-gradient(120deg,#ff8a00,#e52e71,#6a5af9,#19d3da)";
    document.body.style.backgroundSize = "600% 600%";
    document.body.style.animation = "rainbowFlow 10s ease infinite";
  } else {
    document.body.style.background = "";
  }
}
window.addEventListener("load", () => {
  const t = localStorage.getItem("allen_theme");
  if (t) setTheme(t);
});

// === 特效：金幣雨 ===
function coinsRain() {
  for (let i = 0; i < 15; i++) {
    const c = document.createElement("div");
    c.textContent = "💰";
    c.className = "coin-fall";
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = i * 0.1 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2500);
  }
}

// === 特效：煙火 ===
function fireworks() {
  for (let i = 0; i < 6; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    f.style.left = Math.random() * 90 + "vw";
    f.style.top = Math.random() * 60 + "vh";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1500);
  }
}

// === 動畫樣式 ===
const css = document.createElement("style");
css.textContent = `
@keyframes rainbowFlow {
  0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}
}
.coin-fall {
  position:fixed;font-size:28px;top:-30px;animation:coinFall 2.4s linear forwards;
}
@keyframes coinFall {
  to{transform:translateY(110vh) rotate(360deg);opacity:0}
}
.firework{
  position:fixed;width:8px;height:8px;border-radius:50%;
  background:radial-gradient(circle,#fff,#ff0,#f0f);
  animation:fireworkAnim 1.3s ease-out forwards;
}
@keyframes fireworkAnim {
  0%{transform:scale(0);opacity:1}
  70%{transform:scale(3);opacity:1}
  100%{transform:scale(5);opacity:0}
}`;
document.head.appendChild(css);