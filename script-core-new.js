// ==========================
// Allen Spelling Bee — Core v7.0
// ==========================
const $ = s => document.querySelector(s);
const app = $("#app");
let STATE = {};

// === 初始化 ===
window.addEventListener("DOMContentLoaded", () => {
  startStars();
  initApp();
});

// === 主選單 ===
function initApp() {
  app.innerHTML = `
    <h1 class="big">🌀 Allen Spelling Bee</h1>
    <div id="coinBar">💰 單字幣：<b>${getCoins()}</b></div>
    <div id="menuGrid">
      <div class="menu-item" onclick="showWeeks()">
        <div class="icon">📚</div>
        <div class="title">分週練習</div>
        <div class="desc">選擇要練習的週次單字</div>
      </div>
      <div class="menu-item" onclick="startDaily()">
        <div class="icon">🔥</div>
        <div class="title">每日挑戰</div>
        <div class="desc">限時 20 題拼字挑戰</div>
      </div>
      <div class="menu-item" onclick="showMissions()">
        <div class="icon">📋</div>
        <div class="title">今日任務</div>
        <div class="desc">查看任務進度與獎勵</div>
      </div>
      <div class="menu-item" onclick="openStore()">
        <div class="icon">🎁</div>
        <div class="title">小商店</div>
        <div class="desc">用單字幣購買特效</div>
      </div>
      <div class="menu-item" onclick="showStats()">
        <div class="icon">🏅</div>
        <div class="title">我的統計</div>
        <div class="desc">查看練習次數與正確率</div>
      </div>
    </div>
  `;
}

// === 分週練習 ===
function showWeeks() {
  const buttons = Object.keys(BANKS)
    .map(w => `<button class="btn" onclick="startWeek('${w}')">Week ${w}</button>`)
    .join(" ");
  app.innerHTML = `
    <h1 class="big">📚 分週練習</h1>
    <div class="card">
      <div style="text-align:center;margin-bottom:16px;">請選擇週次：</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">${buttons}</div>
    </div>
    <button class="btn" style="margin-top:20px;" onclick="initApp()">返回主選單</button>
  `;
}

// === 開始練習 ===
function startWeek(week) {
  STATE = { mode: "week", week, list: shuffle([...BANKS[week]]), index: 0, correct: 0, total: 0, streak: 0 };
  showQuestion();
}

// === 每日挑戰 ===
function startDaily() {
  STATE = { mode: "daily", list: shuffle(loadAllWords()).slice(0, 20), index: 0, correct: 0, total: 0, streak: 0 };
  showQuestion();
}

// === 題目 ===
function showQuestion() {
  if (STATE.index >= STATE.list.length) return showResult();
  const w = STATE.list[STATE.index];
  const title = STATE.mode === "daily" ? "🔥 每日挑戰" : `Week ${STATE.week}`;
  app.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>${title}</h2>
        <button class="btn small" onclick="initApp()">返回</button>
      </div>
      <p>第 ${STATE.index + 1} / ${STATE.list.length} 題</p>
      <input id="ans" class="input" placeholder="輸入英文單字" autocomplete="off"
        onkeydown="if(event.key==='Enter'){checkAns();}">
      <div style="margin-top:12px;">
        <button class="btn" onclick="speak('${w.word}')">🔊 播放發音</button>
        <button class="btn" onclick="checkAns()">確認</button>
      </div>
      <div id="feedback" class="small" style="margin-top:16px;min-height:80px;"></div>
    </div>
  `;
  speak(w.word);
  $("#ans").focus();
}

// === 檢查答案 ===
function checkAns() {
  const input = $("#ans").value.trim().toLowerCase();
  const w = STATE.list[STATE.index];
  const ok = input === w.word.toLowerCase();
  STATE.total++;
  let fb = "";
  if (ok) {
    STATE.correct++;
    STATE.streak++;
    addCoins(1);
    fb = `<span style="color:#5bd68a">✔ 正確！</span> ${w.meaning}`;
  } else {
    STATE.streak = 0;
    fb = `<span style="color:#ff6b6b">✘ 錯誤</span> 正確答案：${w.word} (${w.meaning})`;
  }
  $("#feedback").innerHTML = `${fb}<br><br><button class="btn" onclick="nextQuestion()">下一題 ➜</button>`;
}
function nextQuestion() { STATE.index++; showQuestion(); }

// === 結果 ===
function showResult() {
  const rate = Math.round((STATE.correct / STATE.total) * 100);
  const text = STATE.mode === "daily" ? "每日挑戰" : `Week ${STATE.week}`;
  app.innerHTML = `
    <div class="card">
      <h2>✅ ${text} 完成</h2>
      <p>答對 ${STATE.correct}/${STATE.total} 題 (${rate}%)</p>
      <button class="btn" onclick="initApp()">回主選單</button>
    </div>
  `;
}

// === 統計 ===
function showStats() {
  const s = JSON.parse(localStorage.getItem("allen_stats") || '{"runs":0,"avg":0}');
  app.innerHTML = `
    <h1 class="big">🏅 我的統計</h1>
    <div class="card">
      <p>累積練習次數：${s.runs||0}</p>
      <p>平均正確率：${s.avg?s.avg.toFixed(1):0}%</p>
      <button class="btn" onclick="clearStats()">清除紀錄</button>
    </div>
    <button class="btn" onclick="initApp()">返回主選單</button>
  `;
}
function clearStats(){localStorage.removeItem("allen_stats");showStats();}

// === 工具 ===
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function loadAllWords(){const all=[];for(const k in BANKS)(BANKS[k]||[]).forEach(it=>all.push(it));return all;}
function speak(t){const u=new SpeechSynthesisUtterance(t);u.lang="en-US";u.rate=0.9;u.pitch=1;speechSynthesis.cancel();speechSynthesis.speak(u);}
function getCoins(){return parseInt(localStorage.getItem("allen_coins")||0);}
function addCoins(n){const c=getCoins()+n;localStorage.setItem("allen_coins",c);$("#coinBar").innerHTML=`💰 單字幣：<b>${c}</b>`;}

// === 星空 ===
function startStars(){
  const canvas=document.getElementById("stars");
  const ctx=canvas.getContext("2d");
  let w,h;const stars=[];
  function resize(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;}
  window.addEventListener("resize",resize);resize();
  for(let i=0;i<60;i++)stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5,s:Math.random()*0.5+0.2});
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#ffffff";
    stars.forEach(star=>{
      ctx.globalAlpha=Math.random()*0.5+0.3;
      ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();
      star.y+=star.s;if(star.y>h)star.y=0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}