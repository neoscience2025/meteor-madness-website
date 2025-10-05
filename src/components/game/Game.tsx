"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------
// 1) Tipos locales
// ----------------------------------------------------------------------
interface AsteroidImage extends HTMLImageElement { ready: boolean }

// ----------------------------------------------------------------------
// 2) Estilos UI (encapsulados)
// ----------------------------------------------------------------------
const UISTYLES = `
  :root{--bg:#071423;--fg:#eaf2ff;--ok:#22c55e;--warn:#f59e0b;--bad:#ef4444;--ui:#94a3b8}
  .gameRoot *{box-sizing:border-box;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif}

  .gameRoot{
    width:100%;
    background-image:url('/fondojuego.png');
    background-size:cover;
    background-repeat:no-repeat;
    background-position:center;
    color:var(--fg);
    position:relative;
    overflow:hidden;
  }

  .banner {
    position:absolute; 
    left:50%; top:12%; 
    transform:translateX(-50%); 
    background: linear-gradient(135deg, #1b3376ff, #220653ff);
    border:1px solid #d5c3f5ff; 
    border-radius:12px; 
    padding:10px 16px; 
    font-size:20px;
    z-index:2; 
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.6);
    display:none;
  }
  .gameRoot canvas{
    display:block;
    width:100%;
    height:clamp(520px, 82vh, 100svh);
  }

  .gameHeader{
    position:absolute; left:12px; top:12px;
    background:#0008; border:1px solid #ffffff22; border-radius:14px;
    padding:8px 12px; font-size:18px; backdrop-filter:blur(4px); z-index:2;
  }
  .gameHeader b{ color:#a5b4fc }

  .gamePanel{ position:absolute; right:12px; top:12px; display:flex; gap:8px; z-index:2 }
  .btn-exit{ background:#ef44441a; border:1px solid #ef444455 }

  .btn {
    background: #111827;
    border: 3px solid #a5b4fc;
    color: #a5b4fc;
    padding: 8px 14px;
    border-radius: 6px;
    font-family: 'Press Start 2P', monospace;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn:hover {
    background: #a5b4fc;
    color: #111827;
    box-shadow: 0 0 12px #a5b4fc;
  }

  .gameTouch{ position:absolute; inset:auto 0 10px 0; display:flex; justify-content:center; gap:10px; z-index:2 }
  .pad{ background:#ffffff12; border:1px solid #ffffff22; color:var(--fg); width:70px; height:70px; border-radius:16px; font-size:12px; display:grid; place-items:center; user-select:none }
  .shoot{ width:120px }

  .intro-backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:5 }
  .intro-card{ width:min(860px,92vw); max-height:86vh; overflow:auto; background:#0b1630; border:1px solid #3b425a; border-radius:16px; padding:18px; box-shadow:0 10px 30px rgba(0,0,0,.35) }
  .intro-card h1{ margin:0 0 8px; font-size:18px; color:#a5b4fc }
  .intro-grid{ display:grid; grid-template-columns:1.1fr .9fr; gap:14px }
  .intro-section{ background:#0d1e3e; border:1px solid #2a3656; border-radius:12px; padding:12px }
  .intro-section h2{ margin:0 0 6px; font-size:16px; color:#9bd1ff }
  .intro-list{ margin:8px 0 0; padding-left:18px; line-height:1.5; font-size:14px }
  .kbd{ display:inline-block; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:2px 6px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace }
  .intro-actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:12px; flex-wrap:wrap }
  .btn-cta{ background:#22c55e; border:0; color:#0b1020; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:600 }
  .intro-footer{ display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:12px; color:#cbd5e1 }
  .intro-footer label{ display:flex; gap:8px; align-items:center; cursor:pointer }

  @media (max-width:840px){ .intro-grid{ grid-template-columns:1fr } }
  .hidden{ display:none !important }
`;

// ----------------------------------------------------------------------
// 3) Lógica del juego
// ----------------------------------------------------------------------
type EarthBlast = { x:number; y:number; t:number; dur:number; maxR:number };
type SmokePlume = {
  t:number; dur:number;
  puffs:{ x:number; y:number; r:number; vx:number; vy:number; a:number }[];
};

function startGame(
  canvas: HTMLCanvasElement,
  exitTo: (route?: string) => void,
  t: (key: string, opts?: any) => string
) {
  const storage: Storage | { getItem:(k:string)=>string|null; setItem:(k:string,v:string)=>void; removeItem:(k:string)=>void } = (() => {
    try { const x="__test__"; localStorage.setItem(x,"1"); localStorage.removeItem(x); return localStorage; }
    catch { const m=new Map<string,string>(); return { getItem:k=>m.get(k)??null, setItem:(k,v)=>{m.set(k,String(v))}, removeItem:k=>{m.delete(k)} }; }
  })();

  const exitToApp = (route = "/") => exitTo(route);

  const DPR = Math.max(1, (globalThis as any).devicePixelRatio || 1);
  const ctx = canvas.getContext("2d"); if (!ctx) return () => {};
  let CW = 0, CH = 0;

  const EARTH = { cx:0, cy:0, R:0 };
  function computeEarthGeom(){ EARTH.cx=CW/2; EARTH.cy=CH + 120*DPR; EARTH.R=CH*0.6; }
  const resize = () => {
    const w = (globalThis as any).innerWidth || canvas.clientWidth || 1024;
    const h = (globalThis as any).innerHeight || canvas.clientHeight || 768;
    canvas.width = CW = w * DPR; canvas.height = CH = h * DPR;
    canvas.style.width = w+"px"; canvas.style.height = h+"px";
    computeEarthGeom();
  };
  resize(); globalThis.addEventListener?.("resize", resize);

  const OFF_M = 220 * DPR;
  function shouldCull(r:any){ return r.entered && (r.x < -OFF_M || r.x > CW+OFF_M || r.y > CH+OFF_M || r.y < -OFF_M*1.5); }

  const ASTEROID_STYLE:"sprite"|"vector"="sprite";
  const SHIP_STYLE:"sprite"|"vector"="sprite";
  function loadAst(src:string){ const img = new Image() as AsteroidImage; img.src=src; img.ready=false; img.onload=()=>{img.ready=true}; return img; }
  const asteroidImgs:Record<string,AsteroidImage> = {
    metal: loadAst("/asteroideMetalico.png"),
    ice: loadAst("/asteroideHielo.png"),
    volcano: loadAst("/asteroideVolcan.png"),
  };
  const AST_WEIGHTS = { metal:0.4, ice:0.3, volcano:0.3 };
  function pickAsteroidType(){ const r=Math.random(), a=AST_WEIGHTS.metal, b=a+AST_WEIGHTS.ice; return r<a?"metal": r<b?"ice":"volcano"; }

  // UI
  const hud = document.getElementById("hud");
  const banner = document.getElementById("banner");
  const btnRestart = document.getElementById("btnRestart");
  const btnHelp = document.getElementById("btnHelp");
  const btnExit = document.getElementById("btnExit");
  const btnExitIntro = document.getElementById("btnExitIntro");
  const touchCtrls = document.getElementById("touchCtrls");
  const shootBtn = document.getElementById("shootBtn");
  const introEl = document.getElementById("intro");
  const btnPlay = document.getElementById("btnPlay");
  const chkSkipIntro = document.getElementById("chkSkipIntro") as HTMLInputElement | null;

  if (((globalThis as any).innerWidth < 900 || "ontouchstart" in globalThis) && touchCtrls) {
    (touchCtrls as HTMLElement).style.display = "flex";
  }

  function showBanner(text:string, ms=1800){
    if (!banner) return;
    banner.textContent = text;
    (banner as HTMLElement).style.display = "block";
    clearTimeout((showBanner as any)._t);
    (showBanner as any)._t = setTimeout(() => { if (banner) (banner as HTMLElement).style.display = "none"; }, ms);
  }

  // Tierra
  const earthTex = new Image(); let earthReady=false; earthTex.crossOrigin="anonymous";
  earthTex.src="/earth_texture.png"; earthTex.onload=()=>{earthReady=true};
  function earthTopYAt(x:number){ const dx=x-EARTH.cx; if (Math.abs(dx)>EARTH.R) return Infinity; return EARTH.cy - Math.sqrt(EARTH.R*EARTH.R - dx*dx); }

  // Estado
  const state:any = {
    ship:{ x:0, y:0, w:44*DPR, h:44*DPR, speed:7*DPR, cooldown:0 },
    bullets:[], rocks:[], particles:[],
    score:0, lives:5, level:1, over:false, shake:0, earthAngle:0,
    difficultyLevel:2, _thrust:false,
    earthBlasts:[] as EarthBlast[],
    smokePlumes:[] as SmokePlume[],
  };
  let paused=false; let animFrameId=0;

  const BEST_KEY = "dartgame_best";
  let best = Number((storage as any).getItem?.(BEST_KEY)) || 0;

  function updateHUD(){
    const total=5;
    const hearts = "❤️".repeat(state.lives) + "🤍".repeat(Math.max(0, total - state.lives));
    if (hud) {
      hud.textContent =
        `${t('hudGame.points')}: ${state.score} · ` +
        `${t('hudGame.best')}: ${best} · ` +
        `${t('hudGame.lives')}: ${hearts} · ` +
        `${t('hudGame.level')}: ${state.level}`;
    }
  }

  function spawnWave(){ const n=6+state.level; for (let i=0;i<n;i++) state.rocks.push(newRock()); }
  function newRock(){
    const size = Math.random()*18*DPR + 22*DPR;
    const range = EARTH.R*0.9;
    let x = EARTH.cx + (Math.random()*2-1)*range;
    x = Math.max(-OFF_M*0.5, Math.min(CW+OFF_M*0.5, x));
    const y = -50*DPR - Math.random()*300*DPR;
    const speed = (1.0 + state.level*0.25)*DPR;
    const biasTowardCenter = ((EARTH.cx - x)/EARTH.R)*0.35*DPR;
    const randomDrift = (Math.random()*0.30 - 0.15)*DPR;
    const drift = biasTowardCenter + randomDrift;
    const rot = Math.random()*Math.PI*2; const rotSpeed = (Math.random()*0.8 - 0.4)*0.01;
    const shape = makeRockShape(size, Math.floor(8 + Math.random()*6));
    const hue = Math.max(200 - state.level*8, 160); const color = `hsl(${hue} 24% 35%)`;
    const type = pickAsteroidType();
    const hp = size < 28*DPR ? 2 : size > 36*DPR ? 4 : 3;
    return { x, y, r:size, vy:speed, vx:drift, hit:false, rot, rotSpeed, shape, color, type, hp, prevX:x, prevY:y, trail:[], flash:0, entered:false, age:0 };
  }
  function makeRockShape(radius:number, sides:number){
    const pts=[] as {x:number;y:number}[]; 
    for (let i=0;i<sides;i++){ const a=(i/sides)*Math.PI*2; const wobble=0.72+Math.random()*0.5; pts.push({x:Math.cos(a)*radius*wobble, y:Math.sin(a)*radius*wobble}); }
    return pts;
  }

  // Entrada
  const keys = new Set<string>();
  const onKeydown = (e:KeyboardEvent)=>{
    if (e.key===" " || (e as any).code==="Space"){ shoot(); e.preventDefault(); }
    if (e.key.toLowerCase()==="p") paused=!paused;
    if (e.key.toLowerCase()==="r") reset();
    if (e.key.toLowerCase()==="h") showIntro();
    if (e.key==="Escape") exitToApp("/");
    keys.add(e.key);
  };
  const onKeyup = (e:KeyboardEvent)=> keys.delete(e.key);
  globalThis.addEventListener?.("keydown", onKeydown);
  globalThis.addEventListener?.("keyup", onKeyup);

  let touchDir=0, pressShoot=false;
  const onTouchStart = (e:Event)=>{
    const tEl = e.target as HTMLElement;
    if (tEl?.classList?.contains("pad") && tEl.dataset.dir) touchDir = parseInt(tEl.dataset.dir,10);
    if (tEl === shootBtn){ pressShoot=true; shoot(); }
  };
  const onTouchEnd = ()=>{ touchDir=0; pressShoot=false; };
  touchCtrls?.addEventListener("touchstart", onTouchStart as any, {passive:true} as any);
  touchCtrls?.addEventListener("touchend", onTouchEnd as any, {passive:true} as any);

  function shoot(){
    if (state.over || paused) return;
    if (state.ship.cooldown>0) return;
    const b = { x:state.ship.x, y:state.ship.y - state.ship.h*0.6, vy:-12*DPR };
    state.bullets.push(b);
    state.ship.cooldown = 10;
    for (let i=0;i<6;i++) state.particles.push(particle(b.x,b.y,1));
  }
  function particle(x:number,y:number,mode=0){
    const a=Math.random()*Math.PI*2, s=(mode?3:2)*DPR + Math.random()*1*DPR;
    return { x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:20, color: mode ? "#cbd5e1" : "#f59e0b" };
  }

  function update(){
    let dir=0;
    if (keys.has("ArrowLeft") || keys.has("a")) dir -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) dir += 1;
    if (touchDir!==0) dir = touchDir;
    state.ship.x += dir * state.ship.speed * (state.over?0:1);
    state.ship.x = Math.max(40*DPR, Math.min(CW-40*DPR, state.ship.x));
    if (state.ship.cooldown>0) state.ship.cooldown--;

    state.earthAngle += 0.003;

    for (let i=state.bullets.length-1;i>=0;i--){
      const b=state.bullets[i];
      b.y += b.vy;
      if (b.y < -40*DPR) state.bullets.splice(i,1);
    }

    if (!state.over){
      for (const r of state.rocks){
        r.prevX=r.x; r.prevY=r.y;
        r.y+=r.vy; r.x+=r.vx; r.rot+=r.rotSpeed;
        if (!r.entered){
          const enteredVert = r.y > -10*DPR;
          const enteredHorz = r.x > -10*DPR && r.x < CW + 10*DPR;
          if (enteredVert || enteredHorz) r.entered=true;
        }
        r.vx*=0.996; r.vy*=0.998; if (r.flash>0) r.flash--;
        if (Math.random()<0.25){ r.trail.push({x:r.x,y:r.y,a:0.7}); if (r.trail.length>16) r.trail.shift(); }
        r.age++;
      }
      for (let i=state.rocks.length-1;i>=0;i--){
        const r=state.rocks[i]; const tooOld=r.entered && r.age>20*60;
        if (shouldCull(r) || tooOld){ state.rocks.splice(i,1); state.score+=5; updateHUD(); }
      }
    }

    // bala-roca
    for (let i=state.rocks.length-1;i>=0;i--){
      const r=state.rocks[i];
      for (let j=state.bullets.length-1;j>=0;j--){
        const b=state.bullets[j], dx=r.x-b.x, dy=r.y-b.y;
        if (dx*dx + dy*dy < (r.r*0.8)*(r.r*0.8)){
          deflectRock(r,b);
          state.bullets.splice(j,1);
          if (r.hp<=0){ explodeRock(r); state.rocks.splice(i,1); state.score+=10; updateHUD(); }
          break;
        }
      }
    }

    // roca-tierra
    for (let i=state.rocks.length-1;i>=0;i--){
      const r=state.rocks[i];
      const yArc = earthTopYAt(r.x);
      if (r.y + r.r > yArc){
        state.rocks.splice(i,1);
        damageEarth(r, yArc);
      }
    }

    if (!state.over && state.rocks.length===0){
      state.level++;
      spawnWave();
      showBanner(t('banner.levelUp', { level: state.level }));
      updateHUD();
    }
    if (state.shake>0) state.shake--;

    // humo persistente
    for (let i=state.smokePlumes.length-1;i>=0;i--){
      const plume = state.smokePlumes[i];
      plume.t++;
      for (const p of plume.puffs){
        p.x += p.vx; p.y += p.vy; p.r *= 1.004; p.vy -= 0.006*DPR; p.a *= 0.9985;
      }
      if (plume.t >= plume.dur) state.smokePlumes.splice(i,1);
    }
  }

  function deflectRock(r:any,b:any){
    const ix=r.x-b.x, iy=r.y-b.y, len=Math.hypot(ix,iy)||1;
    const nx=ix/len, ny=iy/len; const Kt=2.0*DPR, Kn=1.2*DPR;
    r.vx += nx*Kt; r.vy += ny*Kn; r.rotSpeed += (Math.random()*0.6-0.3)*0.02; r.flash=10; r.hp-=1;
    for (let k=0;k<10;k++){ const p=particle(r.x,r.y,1); p.vx*=1.7; p.vy*=1.7; p.life=18; state.particles.push(p); }
    r.trail.push({x:r.x,y:r.y,a:0.9}); if (r.trail.length>16) r.trail.shift();
  }
  function explodeRock(r:any){ for (let k=0;k<16;k++){ const p=particle(r.x,r.y,1); p.vx*=1.5; p.vy*=1.5; p.life=26; state.particles.push(p);} }

  function damageEarth(rock?:any, yArc?:number){
    state.lives--; state.shake=18; updateHUD();

    if (rock && Number.isFinite(yArc)){
      const blast:EarthBlast = { x:rock.x, y:yArc!, t:0, dur:46, maxR:Math.max(120, rock.r*6) };
      state.earthBlasts.push(blast);

      const puffCount = 16 + (((rock.r/(20*DPR))*10) | 0);
      const puffs:SmokePlume["puffs"] = [];
      for (let i=0;i<puffCount;i++){
        const angle = Math.PI*(0.75 + Math.random()*0.5);
        const speed = 0.4*DPR + Math.random()*1.1*DPR;
        puffs.push({ x:rock.x, y:yArc!, r:(8+Math.random()*18)*DPR, vx:Math.cos(angle)*speed*0.6, vy:Math.sin(angle)*speed, a:0.22+Math.random()*0.18 });
      }
      state.smokePlumes.push({ t:0, dur:60*25, puffs });

      for (let k=0;k<40;k++){
        const a=Math.random()*Math.PI + Math.PI;
        const s=(2+Math.random()*5)*DPR;
        const p={ x:rock.x, y:yArc!, vx:Math.cos(a)*s, vy:Math.sin(a)*s*0.6, life:24 + (Math.random()*18|0), color: k%3 ? 'rgba(255,196,64,1)' : '#cbd5e1' };
        state.particles.push(p);
      }
    }

    if (state.lives<=0){
      state.over=true;
      if (state.score>best){
        best = state.score;
        (storage as any).setItem?.('dartkids_best', String(best));
        showBanner(t('banner.newRecord', { best }));
      } else {
        showBanner(t('banner.gameOver', { score: state.score, level: state.level }));
      }
    } else {
      showBanner(t('banner.impact'));
    }
  }

  function draw(){
    const ox = state.shake ? (Math.random()-0.5)*6*DPR : 0;
    const oy = state.shake ? (Math.random()-0.5)*6*DPR : 0;
    ctx.setTransform(1,0,0,1,ox,oy);
    ctx.clearRect(-ox,-oy,CW,CH);
    ctx.fillStyle="#ffffff18";
    for (let i=0;i<60;i++){ const x=((i*73)%CW), y=((i*131)%CH); ctx.fillRect(x,y,2,2); }
    drawEarth();
    drawSmokePlumes();
    drawShip(); drawBullets(); drawRocks(); drawParticles();
  }

  function drawEarth(){
    const {cx,cy,R}=EARTH;
    ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
    if (earthReady){
      ctx.translate(cx,cy); ctx.rotate(state.earthAngle);
      const S=R*2.2; ctx.drawImage(earthTex, -S/2, -S/2, S, S);
      ctx.setTransform(1,0,0,1,0,0);
    } else {
      const g = ctx.createRadialGradient(cx-R/4,cy-R/4,R*0.5,cx,cy,R);
      g.addColorStop(0,"#1d4ed8"); g.addColorStop(1,"#0c4a6e");
      ctx.fillStyle=g; ctx.fillRect(cx-R,cy-R,R*2,R*2);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx,cy,R*1.02,0,Math.PI*2);
    ctx.fillStyle="rgba(96,165,250,0.04)"; ctx.fill();
  }

  function drawSmokePlumes(){
    if (!state.smokePlumes.length) return;
    for (const plume of state.smokePlumes){
      const life = 1 - Math.min(1, plume.t / plume.dur);
      for (const p of plume.puffs){
        ctx.save(); ctx.beginPath(); ctx.arc(EARTH.cx, EARTH.cy, EARTH.R, 0, Math.PI*2); ctx.clip();
        (ctx as any).globalAlpha = Math.max(0, p.a * (0.6 + 0.4*life));
        const grad = ctx.createRadialGradient(p.x,p.y,p.r*0.2,p.x,p.y,p.r);
        grad.addColorStop(0,'rgba(148,163,184,0.45)');
        grad.addColorStop(1,'rgba(15,23,42,0)');
        ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }
  }

  function drawRocks(){
    for (const r of state.rocks){
      if (r.trail && r.trail.length>1){
        ctx.save(); ctx.beginPath();
        for (let tI=0;tI<r.trail.length;tI++){ const p=r.trail[tI]; if (tI===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); }
        (ctx as any).strokeStyle='rgba(147,197,253,0.35)'; (ctx as any).lineWidth=2*DPR; ctx.stroke(); ctx.restore();
      }
      if (ASTEROID_STYLE==="sprite"){
        const tex = asteroidImgs[r.type];
        if (tex && tex.ready){ ctx.save(); ctx.translate(r.x,r.y); ctx.rotate(r.rot); const s=r.r*2; ctx.drawImage(tex,-s/2,-s/2,s,s); ctx.restore(); }
        else { ctx.save(); ctx.translate(r.x,r.y); ctx.rotate(r.rot); ctx.beginPath(); for (let i=0;i<r.shape.length;i++){ const p=r.shape[i]; i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y); } ctx.closePath(); ctx.fillStyle=r.color; ctx.fill(); (ctx as any).lineWidth=2*DPR; (ctx as any).strokeStyle='#93c5fd66'; ctx.stroke(); ctx.restore(); }
      } else {
        ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); (ctx as any).fillStyle='#334155'; ctx.fill(); (ctx as any).strokeStyle='#93c5fd88'; (ctx as any).lineWidth=2*DPR; ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(r.x, r.y - r.r - 10*DPR); ctx.lineTo(r.x, r.y - r.r - 26*DPR); (ctx as any).strokeStyle='#f59e0b88'; (ctx as any).lineWidth=2*DPR; ctx.stroke();
    }
  }

  function loadShip(src:string){ const img = new Image() as HTMLImageElement & {ready?:boolean}; img.src=src; img.ready=false; img.onload=()=>img.ready=true; return img; }
  const shipSprites = { idle:loadShip("/ship_idle.png"), thrust:loadShip("/ship_thrust.png") };

  function drawShip(){
    const s=state.ship;
    if (SHIP_STYLE==="sprite"){
      const tex = state._thrust && shipSprites.thrust.ready ? shipSprites.thrust : shipSprites.idle;
      if (tex && tex.ready){
        ctx.save(); ctx.translate(s.x,s.y);
        const W=s.w*1.9, H=s.h*1.9; ctx.drawImage(tex, -W/2, -H*0.6, W, H);
        ctx.restore(); return;
      }
    }
    // fallback vectorial
    ctx.save(); ctx.translate(s.x,s.y);
    ctx.beginPath(); ctx.moveTo(0,-s.h*0.6); ctx.lineTo(s.w*0.35,s.h*0.4); ctx.lineTo(-s.w*0.35,s.h*0.4); ctx.closePath();
    ctx.fillStyle="#e5e7eb"; ctx.fill();
    if (!state.over && !paused){
      ctx.beginPath(); ctx.moveTo(0,s.h*0.42); ctx.lineTo(6*DPR,s.h*0.65); ctx.lineTo(-6*DPR,s.h*0.65); ctx.closePath();
      ctx.fillStyle="#f59e0b"; ctx.fill();
    }
    ctx.restore();
  }

  function drawBullets(){
    for (const b of state.bullets){
      const grad = ctx.createLinearGradient(b.x,b.y,b.x,b.y-20*DPR);
      grad.addColorStop(0,'#ffea00'); grad.addColorStop(1,'#ff0077');
      ctx.strokeStyle=grad; ctx.lineWidth=4*DPR;
      ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(b.x,b.y-20*DPR); ctx.stroke();
    }
  }

  function drawParticles(){
    for (let i=state.particles.length-1;i>=0;i--){
      const p=state.particles[i]; p.x+=p.vx; p.y+=p.vy; p.life--;
      if (p.life<=0){ state.particles.splice(i,1); continue; }
      (ctx as any).globalAlpha = Math.max(0, p.life/26);
      (ctx as any).fillStyle = p.color;
      ctx.fillRect(p.x,p.y,3*DPR,3*DPR);
      (ctx as any).globalAlpha = 1;
    }
  }

  function showIntro(){ paused=true; if (chkSkipIntro) chkSkipIntro.checked = (storage as any).getItem?.('dartgame_skip_intro')==='1'; introEl?.classList.remove('hidden'); }
  function hideIntro(){ introEl?.classList.add('hidden'); paused=false; }
  const onPlayClick = () => { if (chkSkipIntro && chkSkipIntro.checked) (storage as any).setItem?.('dartgame_skip_intro','1'); else (storage as any).removeItem?.('dartgame_skip_intro'); hideIntro(); };
  const onIntroBackdrop = (e:Event) => { if (e.target===introEl) hideIntro(); };
  const onExit = () => exitToApp('/');

  (btnPlay as HTMLButtonElement|null)?.addEventListener('click', onPlayClick);
  (introEl as HTMLDivElement|null)?.addEventListener('click', onIntroBackdrop as any);
  (btnRestart as HTMLButtonElement|null)?.addEventListener('click', reset);
  (btnHelp as HTMLButtonElement|null)?.addEventListener('click', showIntro);
  (btnExit as HTMLButtonElement|null)?.addEventListener('click', onExit);
  (btnExitIntro as HTMLButtonElement|null)?.addEventListener('click', onExit);

  let last = performance.now();
  function loop(now:number){
    const dt = Math.min(0.033, (now-last)/1000); last=now;
    if (!state.over && !paused) update();
    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  function reset(){
    state.ship.x = (globalThis as any).innerWidth * DPR / 2 || CW / 2;
    state.ship.y = CH - 140*DPR;
    state.bullets=[]; state.rocks=[]; state.particles=[];
    state.score=0; state.lives=5; state.level=2; state.difficultyLevel=2;
    state.over=false; state.shake=0; state.earthAngle=0;
    spawnWave(); updateHUD();
    showBanner(t('banner.start'));
  }

  reset();
  if ((storage as any).getItem?.('dartgame_skip_intro')!=='1') showIntro();
  animFrameId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animFrameId);
    globalThis.removeEventListener?.('resize', resize as any);
    globalThis.removeEventListener?.('keydown', onKeydown as any);
    globalThis.removeEventListener?.('keyup', onKeyup as any);
    introEl?.removeEventListener('click', onIntroBackdrop as any);
    (btnPlay as HTMLButtonElement|null)?.removeEventListener('click', onPlayClick);
    (btnRestart as HTMLButtonElement|null)?.removeEventListener('click', reset as any);
    (btnHelp as HTMLButtonElement|null)?.removeEventListener('click', showIntro as any);
    (btnExit as HTMLButtonElement|null)?.removeEventListener('click', onExit as any);
    (btnExitIntro as HTMLButtonElement|null)?.removeEventListener('click', onExit as any);
    touchCtrls?.removeEventListener('touchstart', onTouchStart as any);
    touchCtrls?.removeEventListener('touchend', onTouchEnd as any);
  };
}

// ----------------------------------------------------------------------
// 4) Componente React (Next.js Client Component)
// ----------------------------------------------------------------------
export default function Game() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { t } = useTranslation("game");

  useMemo(() => {
    if (typeof document !== 'undefined') {
      const styleTag = document.createElement('style');
      styleTag.setAttribute('data-dargame', '1');
      styleTag.innerHTML = UISTYLES;
      document.head.appendChild(styleTag);
      return () => { if (document.head.contains(styleTag)) document.head.removeChild(styleTag); };
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const cleanup = startGame(canvasRef.current, (route = "/") => router.push(route), t);
    return cleanup;
  }, [router, t]);

  return (
    <section className="gameRoot">
      <div className="gameHeader">
        <div>
          <b>{t('appGame.title')}</b> 🚀 {t('appGame.tagline')}
        </div>
        <div id="hud" style={{ fontSize: "18px" }}>
          {/* Se llena por JS (updateHUD) */}
        </div>
      </div>

      <div className="gamePanel">
        <button className="btn" id="btnRestart">{t('ui.restart')}</button>
        <button className="btn" id="btnHelp">{t('ui.howToPlay')}</button>
        <button className="btn btn-exit" id="btnExit" title="ESC">{t('ui.exit')}</button>
      </div>

      <div className="gameTouch" id="touchCtrls" style={{ display: 'none' }}>
        <div className="pad" data-dir="-1">⟵</div>
        <div className="pad shoot" id="shootBtn">{t('ui.shoot')}</div>
        <div className="pad" data-dir="1">⟶</div>
      </div>

      <div className="banner" id="banner"></div>

      <div id="intro" className="intro-backdrop hidden">
        <div className="intro-card">
          <h1>{t('introGame.title')}</h1>
          <div className="intro-grid">
            <section className="intro-section">
              <h2 style={{ textAlign: 'justify' }}>{t('introGame.summaryTitle')}</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: 1.55 ,textAlign: 'justify' }}>
                {t('introGame.summary')}
              </p>
              <ul className="intro-list">
                <li><span className="kbd">←</span>/<span className="kbd">→</span> {t('introGame.move')}</li>
                <li><span className="kbd">Espacio</span> {t('introGame.shoot')}</li>
                <li>
                  <span className="kbd">R</span> {t('introGame.restart')} ·
                  <span className="kbd"> H</span> ayuda ·
                  <span className="kbd"> P</span> {t('introGame.pause')} ·
                  <span className="kbd"> ESC</span> {t('introGame.exit')}
                </li>
              </ul>
            </section>
            <section className="intro-section" style={{ textAlign: 'justify' }}>
              <h2>{t('introGame.tipsTitle')}</h2>
              <ul className="intro-list">
                <li><b>{t('tips.anticipate.title')}</b> {t('tips.anticipate.body')}</li>
                <li><b>{t('tips.position.title')}</b> {t('tips.position.body')}</li>
                <li><b>{t('tips.rate.title')}</b> {t('tips.rate.body')}</li>
                <li><b>{t('tips.priority.title')}</b> {t('tips.priority.body')}</li>
                <li><b>{t('tips.relax.title')}</b> {t('tips.relax.body')}</li>
              </ul>
            </section>
          </div>
          <div className="intro-actions">
            <button className="btn-cta" id="btnPlay">{t('ui.play')}</button>
            <button className="btn" id="btnExitIntro">{t('ui.exit')}</button>
          </div>
          <div className="intro-footer">
            <label><input type="checkbox" id="chkSkipIntro" /> {t('introGame.skip')}</label>
            <small>{t('introGame.tip')}</small>
          </div>
        </div>
      </div>

      <canvas id="game" ref={canvasRef} />
    </section>
  );
}
