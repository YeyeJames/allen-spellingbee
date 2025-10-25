// Allen Spelling Bee — Core v7D
const $ = s => document.querySelector(s);
const app = $("#app");
let STATE = {};

window.addEventListener("DOMContentLoaded", () => {
  startStars();
  updateCoinBar();
  showMenu();
});

function updateCoinBar() {
  const bar = $("#coinBar");
  if (!bar) return;
  const coins = parseInt(localStorage.getItem("allen_coins") || 0);
  bar.innerHTML = `💰 單字幣：<b>${coins}</b>`;
}

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
      <h2>🎁 小商店</h2>
      <button class="btn" onclick="openStore()">開啟商店</button>
    </div>
  `;
  renderWeekButtons();
  updateCoinBar();
}

function renderWeekButtons() {
  $("#weekButtons").innerHTML = Object.keys(BANKS)
    .map(w => `<button class="btn" onclick="startWeek('${w}')">Week ${w}</button>`)
    .join(" ");
}

// === 題目邏輯 (同 v7C) ===
function startWeek(week) {
  STATE = { mode: "week", week, list: shuffle([...BANKS[week]]), index: 0, correct: 0, total: BANKS[week].length, streak: 0 };
  showQuestion();
}
function startDaily() {
  STATE = { mode: "daily", list: shuffle(loadAllWords()).slice(0, 20), index: 0, correct: 0, total: 20, streak: 0 };
  showQuestion();
}
function showQuestion() {
  if (STATE.index >= STATE.list.length) return showResult();
  const w = STATE.list[STATE.index];
  const progressPercent = Math.round((STATE.index / STATE.total) * 100);
  const accuracy = STATE.index > 0 ? Math.round((STATE.correct / STATE.index) * 100) : 0;
app.innerHTML = `
  <div class="quiz-card">
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>${STATE.mode==="daily"?"🔥 每日挑戰":`Week ${STATE.week}`}</h2>
        <button class="btn small" onclick="showMenu()">返回</button>
      </div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${progressPercent}%"></div></div>
      <p>進度 ${STATE.index + 1}/${STATE.total} ｜ 正確率 ${accuracy}%</p>
      <input id="ans" class="input" placeholder="輸入英文單字" onkeydown="if(event.key==='Enter'){checkAns();}">
      <div class="quiz-buttons">
        <button class="btn" onclick="speak('${w.word}')">🔊 播放發音</button>
        <button class="btn" onclick="checkAns()">確認</button>
      </div>
      <div id="feedback"></div>
    </div>
    <button class="next-btn" onclick="nextQuestion()">下一題 ➜</button>
  </div>`;
  speak(w.word);
  $("#ans").focus();
  updateCoinBar();
}
function checkAns() {
  const ans=$("#ans").value.trim().toLowerCase();if(!ans)return;
  const w=STATE.list[STATE.index];const ok=ans===w.word.toLowerCase();
  let fb="";
if(ok){
  STATE.correct++;
  STATE.streak++;
  const bonus=calcBonus();
  addCoins(bonus);
  fb=`<span style="color:#5bd68a">✔ 正確！</span> ${w.meaning}<br>💰 +${bonus} 幣`;
  
  // ✨ 檢查是否開啟煙火特效
  if(localStorage.getItem("effect_fireworks")==="true"){
    launchFireworks();
  }
}
function nextQuestion(){STATE.index++;showQuestion();}
function showResult(){const rate=Math.round((STATE.correct/STATE.total)*100);app.innerHTML=`<div class="card"><h2>✅ 完成</h2><p>答對 ${STATE.correct}/${STATE.total} 題 (${rate}%)</p><button class="btn" onclick="showMenu()">回主畫面</button></div>`;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function loadAllWords(){const all=[];for(const k in BANKS)(BANKS[k]||[]).forEach(it=>all.push(it));return all;}
function calcBonus(){if(STATE.streak>=10)return 3;if(STATE.streak>=5)return 2;return 1;}
function getCoins(){return parseInt(localStorage.getItem("allen_coins")||0);}
function addCoins(n){localStorage.setItem("allen_coins",getCoins()+n);updateCoinBar();}
function speak(t){const u=new SpeechSynthesisUtterance(t);u.lang="en-US";u.rate=0.9;speechSynthesis.cancel();speechSynthesis.speak(u);}
function startStars(){const c=document.getElementById("stars"),ctx=c.getContext("2d");let w,h;const s=[];function r(){w=c.width=innerWidth;h=c.height=innerHeight;}addEventListener("resize",r);r();for(let i=0;i<60;i++)s.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5,s:Math.random()*0.5+0.2});(function d(){ctx.clearRect(0,0,w,h);ctx.fillStyle="#fff";s.forEach(st=>{ctx.globalAlpha=Math.random()*0.5+0.3;ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,2*Math.PI);ctx.fill();st.y+=st.s;if(st.y>h)st.y=0;});requestAnimationFrame(d)})();}

// === 🎆 煙火特效 ===
function launchFireworks(){
  const canvas=document.createElement("canvas");
  canvas.className="fireworks";
  document.body.appendChild(canvas);
  const ctx=canvas.getContext("2d");
  let w=canvas.width=window.innerWidth;
  let h=canvas.height=window.innerHeight;
  const particles=[];
  for(let i=0;i<50;i++){
    particles.push({
      x:w/2,y:h/2,
      vx:(Math.random()-0.5)*6,
      vy:(Math.random()-1)*6,
      size:Math.random()*3+1,
      life:Math.random()*60+30,
      color:`hsl(${Math.random()*360},100%,60%)`
    });
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle=p.color;
      ctx.arc(p.x,p.y,p.size,0,2*Math.PI);
      ctx.fill();
      p.x+=p.vx;
      p.y+=p.vy;
      p.vy+=0.05;
      p.life--;
      p.size*=0.98;
    });
  }
  const timer=setInterval(()=>{
    draw();
    if(particles.every(p=>p.life<0)){
      clearInterval(timer);
      canvas.remove();
    }
  },16);
  // 淡出效果
  setTimeout(()=>canvas.classList.add("fadeout"),800);
}