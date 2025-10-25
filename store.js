// 🎁 Allen Spelling Bee — 豪華商店模組 v7D

function openStore() {
  const coins = getCoins();
  updateCoinBar();
  app.innerHTML = `
    <h1 class="big">🎁 小商店</h1>
    <p style="text-align:center;">目前擁有：💰 <b>${coins}</b> 幣</p>

    <div class="store-grid">
      <div class="store-item" onclick="buyTheme('green',10)">
        <div class="icon glow-green">🟢</div>
        <div class="title">綠色星雲主題</div>
        <div class="price">💰 10</div>
      </div>
      <div class="store-item" onclick="buyTheme('purple',10)">
        <div class="icon glow-purple">💜</div>
        <div class="title">紫色星雲主題</div>
        <div class="price">💰 10</div>
      </div>
      <div class="store-item" onclick="buyTheme('gold',15)">
        <div class="icon glow-gold">🌟</div>
        <div class="title">金色榮耀主題</div>
        <div class="price">💰 15</div>
      </div>
      <div class="store-item" onclick="buyEffect('fireworks',8)">
        <div class="icon glow-red">🎇</div>
        <div class="title">答對煙火特效</div>
        <div class="price">💰 8</div>
      </div>
      <div class="store-item" onclick="buyEffect('cat',12)">
        <div class="icon glow-blue">🐱</div>
        <div class="title">喵老師造型升級</div>
        <div class="price">💰 12</div>
      </div>
    </div>

    <div class="card" style="text-align:center;margin-top:25px;">
      <button class="btn" onclick="resetTheme()">✨ 恢復預設主題</button>
      <button class="btn" onclick="showMenu()">返回主畫面</button>
    </div>

    <audio id="buySound" src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_0a1ad8b7b7.mp3?filename=success-1-6297.mp3"></audio>
  `;
}

function buyTheme(color, price) {
  let coins = getCoins();
  if (coins < price) return alert("💰 幣不足！");
  coins -= price;
  localStorage.setItem("allen_coins", coins);
  localStorage.setItem("allen_theme", color);
  applyTheme(color);
  playBuyAnimation();
  alert("✅ 主題購買成功！");
  openStore();
}

function buyEffect(type, price) {
  let coins = getCoins();
  if (coins < price) return alert("💰 幣不足！");
  coins -= price;
  localStorage.setItem("allen_coins", coins);
  localStorage.setItem("effect_" + type, true);
  playBuyAnimation();
  alert("✅ 特效購買成功！");
  openStore();
}

function resetTheme() {
  localStorage.removeItem("allen_theme");
  document.body.style.background = "";
  alert("✅ 已恢復預設主題！");
  showMenu();
}

function applyTheme(color) {
  const colors = {
    green: "radial-gradient(circle at 20% 30%, #0f2922, #0a0a0a)",
    purple: "radial-gradient(circle at 20% 30%, #201033, #0a0a0a)",
    gold: "radial-gradient(circle at 20% 30%, #332000, #0a0a0a)"
  };
  document.body.style.background = colors[color] || "";
}

// === 動畫與音效 ===
function playBuyAnimation() {
  const sound = $("#buySound");
  if (sound) { sound.currentTime = 0; sound.play(); }
  const flash = document.createElement("div");
  flash.className = "flash-effect";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
  updateCoinBar();
}

applyTheme(localStorage.getItem("allen_theme"));