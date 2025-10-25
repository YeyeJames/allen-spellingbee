// ===============================
// meow-teacher.js — v6.0 任務挑戰版 (溫柔姐姐音)
// ===============================
(function(){
  const el = document.createElement("div");
  el.id="meow-teacher";
  el.innerHTML = `
    <div class="meow-avatar" aria-hidden="true">😺</div>
    <div class="meow-bubble" id="meow-bubble">嗨～我是喵老師，要一起拼單字嗎？</div>
  `;
  document.addEventListener("DOMContentLoaded",()=>{
    document.body.appendChild(el);
    setTimeout(()=>say("start"),2500);
    autoIdle();
  });

  // === 台詞 ===
  const lines={
    start:["嗨～我是喵老師，要一起拼單字嗎？","準備好挑戰任務了嗎？"],
    correct:["太棒了～你真的很用心喔。","哇～連續答對耶！妳超厲害～","好棒喔，繼續加油！"],
    wrong:["沒關係，我陪妳一起再試一次，好嗎？","別難過，下題一定行。","這題很難耶～妳做得很好了。"],
    complete:["任務全數達成～妳真的是拼字小高手！","今天表現超好，喵老師要放煙火囉～"],
    buy:["恭喜～買到新東西囉！","好眼光，快來試試看～"],
    sleep:["喵老師要先休息一下，等妳回來再一起學～"]
  };

  const bubble=()=>$("#meow-bubble");
  const avatar=()=>$("#meow-teacher .meow-avatar");

  // === 中文TTS（溫柔姐姐音） ===
  let zhVoice=null;
  function pickZhVoice(){
    const v=speechSynthesis.getVoices();
    zhVoice=v.find(v=>/TW|Chinese \(Traditional\)/i.test(v.lang||v.name))||null;
  }
  if("speechSynthesis"in window){
    speechSynthesis.onvoiceschanged=pickZhVoice;
    pickZhVoice();
  }
  function speakZh(t){
    if(!("speechSynthesis"in window))return;
    const u=new SpeechSynthesisUtterance(t);
    u.lang="zh-TW";u.pitch=1;u.rate=0.95;u.volume=1;
    if(zhVoice)u.voice=zhVoice;
    speechSynthesis.cancel();speechSynthesis.speak(u);
  }

  // === 顯示 ===
  function show(txt,emoji="😺"){
    const b=bubble();const a=avatar();
    b.textContent=txt;b.classList.remove("show");void b.offsetWidth;b.classList.add("show");
    a.textContent=emoji;
  }

  function rand(a){return a[Math.floor(Math.random()*a.length)];}

  function say(type){
    const txt=rand(lines[type]||["加油！"]);
    const emo=emotionFor(type);
    show(txt,emo);
    const s=JSON.parse(localStorage.getItem("allen_store_settings")||"{}");
    if(s.meowVoice!==false)speakZh(txt);
  }

  function emotionFor(type){
    switch(type){
      case"correct":return"😺";
      case"wrong":return"😾";
      case"complete":return"😻";
      case"sleep":return"💤";
      default:return"😼";
    }
  }

  // === 自動閒置偵測 ===
  let idleTimer=null;
  function autoIdle(){
    document.onmousemove=document.onkeydown=document.ontouchstart=()=>{
      clearTimeout(idleTimer);
      idleTimer=setTimeout(()=>say("sleep"),120000); // 2 分鐘未操作
    };
  }

  // === 對外 ===
  window.Meow={say};
  window.addEventListener("allen:start",()=>say("start"));
  window.addEventListener("allen:correct",()=>say("correct"));
  window.addEventListener("allen:wrong",()=>say("wrong"));
  window.addEventListener("allen:complete",()=>say("complete"));
  window.addEventListener("allen:buy",()=>say("buy"));
})();