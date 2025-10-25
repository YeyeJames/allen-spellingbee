// meow-teacher.js — Q版喵老師（藍白氣泡）常駐右下角 + 中文TTS
(function () {
  // --- DOM ---
  const el = document.createElement('div');
  el.id = 'meow-teacher';
  el.innerHTML = `
    <div class="meow-avatar" aria-hidden="true">😺</div>
    <div class="meow-bubble" id="meow-bubble">嗨～我是喵老師，要一起拼單字嗎？</div>
  `;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(el);
    // 開場 2.2 秒後問候（避開你的 Intro 動畫）
    setTimeout(()=>say('start'), 2200);
  });

  // --- 語料 ---
  const lines = {
    start: [
      "嗨～我是喵老師，要一起拼單字嗎？",
      "今天想挑戰幾題呢？我在右下角陪你！",
      "準備好了嗎？我們出發吧～"
    ],
    correct: [
      "喵～好棒喔！😺", "你真的太厲害啦！", "完美！繼續保持～",
      "太強了！這題難不倒你！", "我就知道你行！"
    ],
    wrong: [
      "沒關係，再試一次！", "別氣餒～下一題一定行！",
      "我們一起記住它，下次就不會錯囉！", "再試一遍，我會幫你加油！"
    ],
    complete: [
      "任務完成！喵老師替你開心跳個舞～🎉",
      "太棒了～今天收穫滿滿！", "你今天真的很努力，讚！"
    ],
    buy: [
      "恭喜～買到新東西囉！", "好眼光！好想立刻試試看～"
    ]
  };

  // --- 中文 TTS（zh-TW） ---
  let zhVoice = null;
  function pickZhVoice() {
    const voices = speechSynthesis.getVoices();
    zhVoice = voices.find(v => /zh\-TW/i.test(v.lang)) || voices.find(v => /Chinese|Taiwan/i.test(v.name)) || null;
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = pickZhVoice;
    pickZhVoice();
  }
  function speakZh(text){
    try{
      if(!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-TW';
      if(zhVoice) u.voice = zhVoice;
      u.rate = 1.02; u.pitch = 1.0; u.volume = 1.0;
      speechSynthesis.cancel(); // 先清空排程，避免重疊
      speechSynthesis.speak(u);
    }catch{}
  }

  // --- 展示泡泡 + 微動畫 ---
  const bubble = () => document.getElementById('meow-bubble');
  let lastType = '';
  function show(text){
    const b = bubble(); if(!b) return;
    b.textContent = text;
    b.classList.remove('show'); // 重新觸發動畫
    void b.offsetWidth;
    b.classList.add('show');
    // avatar 小跳
    const av = document.querySelector('#meow-teacher .meow-avatar');
    if(av){
      av.classList.remove('pop');
      void av.offsetWidth;
      av.classList.add('pop');
      setTimeout(()=>av.classList.remove('pop'), 600);
    }
  }

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)] }

  function say(type){
    lastType = type;
    const text = rand(lines[type] || ["加油！"]);
    show(text);
    // 語音是否開啟（可被商店開關覆蓋；預設開啟）
    const settings = JSON.parse(localStorage.getItem('allen_store_settings') || '{"meowVoice":true}');
    if(settings.meowVoice!==false) speakZh(text);
  }

  // --- 對外 API ---
  window.Meow = { say };

  // --- 事件橋接（script-core 發出 CustomEvent） ---
  window.addEventListener('allen:start',  ()=> say('start'));
  window.addEventListener('allen:correct',()=> say('correct'));
  window.addEventListener('allen:wrong',  ()=> say('wrong'));
  window.addEventListener('allen:complete',()=> say('complete'));
  window.addEventListener('allen:buy',    ()=> say('buy'));
})();
