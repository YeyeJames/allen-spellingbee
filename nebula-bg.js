// ==========================
// Nebula Background Animation (普通畫質版)
// ==========================
(function(){
  const cvs = document.getElementById("nebula-bg");
  if (!cvs) return;
  const ctx = cvs.getContext("2d");
  let W = cvs.width = window.innerWidth;
  let H = cvs.height = window.innerHeight;

  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.6 + Math.random() * 1.2,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    c: `hsl(${Math.random() * 360}, 80%, 70%)`
  }));

  function draw() {
    ctx.fillStyle = "rgba(10,15,25,0.2)";
    ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.beginPath();
      ctx.fillStyle = s.c;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener("resize", ()=>{
    W = cvs.width = window.innerWidth;
    H = cvs.height = window.innerHeight;
  });
})();
