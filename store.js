// ============================
// 🎁 Allen Spelling Bee — 小商店模組
// ============================

function openStore() {
  const coins = getCoins();
  app.innerHTML = `
    <h1 class="big">🎁 小商店</h1>
    <p>目前擁有：💰 ${coins} 幣</p>
    <div class="card">
      <h2>🟢 綠色星雲主題</h2>
      <p>價格：10 幣</p>
      <button class="btn" onclick="buyTheme('green',10)">購買</button>
    </div>
    <div class="card">
      <h2>💜 紫色星雲主題</h2>
      <p>價格：10 幣</p>
      <button class="btn" onclick="buyTheme('purple',10)">購買</button>
    </div>
    <div class="card">
      <h2>✨ 重設主題</h2>
      <button class="btn" onclick="resetTheme()">恢復預設</button>
    </div>
    <button class="btn" onclick="showMenu()">返回主畫面</button>
  `;
}

function buyTheme(color, price) {
  let coins = getCoins();
  if (coins < price) return alert("💰 幣不足！");
  coins -= price;
  localStorage.setItem("allen_coins", coins);
  localStorage.setItem("allen_theme", color);
  applyTheme(color);
  alert("✅ 主題購買成功！");
  showMenu();
}

function resetTheme() {
  localStorage.removeItem("allen_theme");
  document.body.style.background = "";
  alert("✅ 已恢復預設主題！");
  showMenu();
}

function applyTheme(color) {
  const colors = {
    green: "radial-gradient(circle at 20% 30%, #102a22, #0a0a0a)",
    purple: "radial-gradient(circle at 20% 30%, #1c1033, #0a0a0a)"
  };
  document.body.style.background = colors[color] || "";
}

// 啟動時自動套用主題
applyTheme(localStorage.getItem("allen_theme"));