/* ═══ GAMESTORE BOT — app.js (FINAL REPAIR) ═══ */

// ── CONFIG ──
const SERVER_URL = "http://82.165.56.146:9583"; 

// ── STATE ──
let currentLang = 'uz';
let currentPage = 'home';
let selectedGame = null;
let selectedSection = null;
let selectedOptIdx = null;
let currentAmount = 0;
let countdownInterval = null;

// ── PROFILE ──
let userProfile = { name:'', username:'', avatar:'🎮', id:'', balance:0 };

function genUID() {
  return String(Date.now()).slice(-7) + String(Math.floor(Math.random()*1000)).padStart(3,'0');
}

function loadProfile() {
  const s = localStorage.getItem('gs_profile');
  if (s) { try { userProfile = JSON.parse(s); } catch(e){} }
  if (!userProfile.id) { userProfile.id = genUID(); }
}
function saveProfile() { localStorage.setItem('gs_profile', JSON.stringify(userProfile)); }

function tryTelegramProfile() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const u = tg.initDataUnsafe.user;
      userProfile.name = (u.first_name || '') + (u.last_name ? ' ' + u.last_name : '');
      if (u.username) userProfile.username = '@' + u.username;
      if (u.first_name) userProfile.avatar = u.first_name[0].toUpperCase();
      if (u.id) userProfile.id = String(u.id);
      saveProfile();
      return true;
    }
  } catch(e) {}
  return false;
}

function applyProfileUI() {
  const av = userProfile.avatar || '🎮';
  const isInitial = av.length === 1 && /[A-ZА-ЯЁЎҚҒҲ]/i.test(av);
  
  const els = {
    topAv: document.getElementById('top-avatar'),
    profAv: document.getElementById('profile-avatar'),
    topName: document.getElementById('top-name'),
    topTag: document.getElementById('top-tag'),
    topBal: document.getElementById('top-balance'),
    homeBal: document.getElementById('home-balance'),
    profName: document.getElementById('profile-name'),
    profUname: document.getElementById('profile-uname'),
    profId: document.getElementById('profile-id'),
    profBal: document.getElementById('profile-balance')
  };

  if (isInitial && els.topAv && els.profAv) {
    [els.topAv, els.profAv].forEach(el => {
      el.textContent = av.toUpperCase();
      el.style.background = 'linear-gradient(135deg,var(--acc),var(--acc2))';
      el.style.color = '#fff';
    });
  } else if (els.topAv && els.profAv) {
    els.topAv.textContent = av; els.profAv.textContent = av;
    els.topAv.style.background = ''; els.profAv.style.background = '';
  }

  if(els.topName) els.topName.textContent = userProfile.name || 'Gamer';
  if(els.topTag) els.topTag.textContent = userProfile.username || '@user';
  if(els.topBal) els.topBal.textContent = fmt(userProfile.balance);
  if(els.homeBal) els.homeBal.textContent = fmt(userProfile.balance);
  if(els.profName) els.profName.textContent = userProfile.name || '—';
  if(els.profUname) els.profUname.textContent = userProfile.username || '@—';
  if(els.profId) els.profId.textContent = userProfile.id;
  if(els.profBal) els.profBal.textContent = fmt(userProfile.balance);
}

function fmt(n) { return Number(n).toLocaleString('ru-RU'); }

// ── GAMES DATA ──
const games = [
  {
    id:'ff', name:'FREE FIRE', emoji:'🔥', badge:'SNG',
    sections: [
      { title:'💎 ALMAZ', items:[
        {name:'100 Almaz', price:14000}, {name:'341 Almaz', price:35000}, {name:'572 Almaz', price:60000},
        {name:'1166 Almaz', price:115000}, {name:'2398 Almaz', price:225000}, {name:'6160 Almaz', price:600000},
      ]},
      { title:'🎫 PASS', items:[ {name:'Haftalik Lite', price:8000}, {name:'Vaucher Haftalik', price:25000}, {name:'Vaucher Oylik', price:85000} ]}
    ]
  },
  {
    id:'ml', name:'MOBILE LEGENDS', emoji:'⚔️', badge:'Global',
    sections: [
      { title:'💎 ALMAZ', items:[
        {name:'86 Almaz', price:18000}, {name:'172 Almaz', price:35000}, {name:'257 Almaz', price:50000},
        {name:'706 Almaz', price:135000}, {name:'2195 Almaz', price:370000}, {name:'5532 Almaz', price:925000}
      ]}
    ]
  },
  {
    id:'pubg', name:'PUBG MOBILE', emoji:'🪖', badge:'Global',
    sections: [
      { title:'💰 UC', items:[
        {name:'30 UC', price:7000}, {name:'60 UC', price:13000}, {name:'325 UC', price:59000},
        {name:'660 UC', price:120000}, {name:'1800 UC', price:290000}, {name:'3850 UC', price:590000}
      ]}
    ]
  },
  {
    id:'stars', name:'TG STARS', emoji:'⭐', badge:'AVTO',
    sections: [ { title:'⭐ Stars', items:[ {name:'50 Stars', price:12000}, {name:'100 Stars', price:24000}, {name:'250 Stars', price:65000}, {name:'500 Stars', price:120000}, {name:'1000 Stars', price:230000} ]} ]
  },
  {
    id:'delta', name:'DELTA FORCE', emoji:'🎖️', badge:'Global',
    sections: [ { title:'🪙 Coins', items:[ {name:'72 Coins', price:13000}, {name:'360 Coins', price:65000}, {name:'886 Coins', price:125000}, {name:'1736 Coins', price:235000}, {name:'4606 Coins', price:590000} ]} ]
  },
  {
    id:'hok', name:'HONOR OF KINGS', emoji:'👑', badge:'Global',
    sections: [ { title:'🪙 Tokens', items:[ {name:'80 Token', price:17000}, {name:'240 Token', price:38330}, {name:'400 Token', price:70000}, {name:'800 Token', price:140000} ]} ]
  },
  {
    id:'ab', name:'ARENA BREAKOUT', emoji:'🔫', badge:'Global',
    sections: [ { title:'💰 Coins', items:[ {name:'100 Coins', price:13000}, {name:'500 Coins', price:65000}, {name:'1000 Coins', price:130000}, {name:'2500 Coins', price:320000} ]} ]
  }
];

function renderGames() {
  const g = document.getElementById('games-grid');
  if(!g) return;
  g.innerHTML = games.map(gm => {
    const bc = {Global:'bg-g',SNG:'bg-s',AVTO:'bg-a'}[gm.badge]||'bg-g';
    return `<div class="game-card" onclick="openGame('${gm.id}')">
      <div class="game-thumb">${gm.emoji}<div class="gbadge ${bc}">${gm.badge}</div></div>
      <div class="game-name">${gm.name}</div>
    </div>`;
  }).join('');
}

// ── NAVIGATION ──
function navigate(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const targetPage = document.getElementById(`page-${page}`);
  if(targetPage) targetPage.classList.add('active');
  const nb = document.getElementById(`nav-${page}`);
  if (nb) nb.classList.add('active');
  currentPage = page;
  if (page==='history') { renderOrders(); renderFinance(); }
  if (page==='profile') applyProfileUI();
}

function switchHistoryTab(tab) {
  const oTab = document.getElementById('htab-orders');
  const fTab = document.getElementById('htab-finance');
  const oSec = document.getElementById('history-orders');
  const fSec = document.getElementById('history-finance');
  if(oTab) oTab.classList.toggle('active', tab==='orders');
  if(fTab) fTab.classList.toggle('active', tab==='finance');
  if(oSec) oSec.classList.toggle('hidden', tab!=='orders');
  if(fSec) fSec.classList.toggle('hidden', tab!=='finance');
}

// ── OVERLAYS ──
function openOverlay(id) { 
  const el = document.getElementById(id);
  if(el) el.classList.add('open'); 
}
function closeOverlay(e, id) { if (e.target.id===id) forceClose(id); }
function forceClose(id) { 
  const el = document.getElementById(id);
  if(el) el.classList.remove('open'); 
}

// ── TOPUP ──
function openTopup() { openOverlay('modal-topup'); }
function openAmount() { forceClose('modal-topup'); openOverlay('modal-amount'); }
function openSupport() { window.open('https://t.me/FikoYT','_blank'); }
function openBankomat() { window.open('https://t.me/FikoYT?text=Bankomat_orqali_to\'ldirmoqchiman','_blank'); }

function goToCard() {
  const val = parseInt(document.getElementById('amt-input').value, 10);
  if (!val || val < 1000) { showToast('Min. 1 000 so\'m'); return; }
  currentAmount = val;
  forceClose('modal-amount');
  const cardAmtEl = document.getElementById('card-amt');
  if(cardAmtEl) cardAmtEl.textContent = fmt(val) + ' so\'m';
  openOverlay('modal-card');
  startCountdown(300);
}

async function confirmPay() {
  if (countdownInterval) clearInterval(countdownInterval);
  const data = {
    userId: userProfile.id, user: userProfile.username || userProfile.name,
    item: "Балансni to'ldirish", data: "Karta orqali",
    price: fmt(currentAmount) + " so'm", status: "pending", time: new Date().toLocaleString()
  };
  try {
    await fetch(`${SERVER_URL}/api/orders`, { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify(data)
    });
    forceClose('modal-card'); 
    showToast('Yuborildi! Admin tasdiqlashini kuting.');
  } catch(e) { showToast('Xatolik yuz berdi'); }
}

function startCountdown(sec) {
  if (countdownInterval) clearInterval(countdownInterval);
  let rem = sec;
  const el = document.getElementById('countdown');
  const tick = () => {
    const m = String(Math.floor(rem/60)).padStart(2,'0'), s = String(rem%60).padStart(2,'0');
    if(el) el.textContent = `${m}:${s}`;
    if (rem<=0) clearInterval(countdownInterval);
    rem--;
  };
  tick(); countdownInterval = setInterval(tick, 1000);
}

// ── SHOP ──
function openGame(id) {
  const gm = games.find(g=>g.id===id); if(!gm) return;
  selectedGame = gm; selectedSection = null; selectedOptIdx = null;
  const bc = {Global:'bg-g',SNG:'bg-s',AVTO:'bg-a'}[gm.badge]||'bg-g';
  const html = gm.sections.map((sec, si) => `
    <div class="section-divider">${sec.title}</div>
    <div class="opt-list">
      ${sec.items.map((it, ii) => `<div class="opt-item" id="opt-${si}-${ii}" onclick="selectOpt(${si},${ii})">
        <span class="opt-name">${it.name}</span><span class="opt-price">${fmt(it.price)} so'm</span>
      </div>`).join('')}
    </div>`).join('');
  
  const content = document.getElementById('game-content');
  if(content) {
    content.innerHTML = `
      <div class="gm-head"><div class="gm-emoji">${gm.emoji}</div><div><div class="gm-name">${gm.name}</div><span class="gm-bdg ${bc}">${gm.badge}</span></div></div>
      <div style="padding:10px"><input type="text" id="game-id-input" class="idc-input" placeholder="ID yoki Login..."></div>
      ${html}<button class="buy-btn" onclick="buyItem()">🛒 Sotib olish</button>`;
    openOverlay('modal-game');
  }
}

function selectOpt(si, ii) {
  document.querySelectorAll('.opt-item').forEach(el=>el.classList.remove('sel'));
  const el = document.getElementById(`opt-${si}-${ii}`);
  if(el) el.classList.add('sel');
  selectedSection = si; selectedOptIdx = ii;
}

async function buyItem() {
  if (selectedSection===null || selectedOptIdx===null) { showToast('Mahsulotni tanlang!'); return; }
  const idInput = document.getElementById('game-id-input');
  const idVal = idInput ? idInput.value.trim() : '';
  if(!idVal) { showToast('ID kiriting!'); return; }
  
  const item = selectedGame.sections[selectedSection].items[selectedOptIdx];
  if(userProfile.balance < item.price) { showToast('Mablag\' yetarli emas!'); return; }

  const data = {
    userId: userProfile.id, user: userProfile.username || userProfile.name,
    item: selectedGame.name + " (" + item.name + ")", data: idVal,
    price: fmt(item.price) + " so'm", status: "pending", time: new Date().toLocaleString()
  };
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`, { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify(data)
    });
    if(res.ok) {
      userProfile.balance -= item.price; saveProfile(); applyProfileUI();
      forceClose('modal-game'); showToast('Buyurtma yuborildi!');
    }
  } catch(e) { showToast('Server bilan bog\'lanishda xatolik'); }
}

// ── HISTORY LOAD ──
async function renderOrders() {
  const el = document.getElementById('orders-list'); if(!el) return;
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`);
    const data = await res.json();
    const my = data.filter(x => x.userId === userProfile.id && !x.item.includes("Баланс"));
    el.innerHTML = my.length ? my.map(x => `<div class="tx-card"><div class="tx-icon">🎮</div><div class="tx-body"><div class="tx-title">${x.item}</div><div class="tx-meta">${x.time}</div></div><div class="tx-right"><div class="tx-amt neg">-${x.price}</div><span class="tx-st st-${x.status==='done'?'ok':x.status==='pending'?'pend':'fail'}">${x.status}</span></div></div>`).join('') : '<div class="empty-tx">Tranzaksiyalar yo\'q</div>';
  } catch(e) { el.innerHTML = '<div class="empty-tx">Yuklashda xatolik</div>'; }
}
async function renderFinance() {
  const el = document.getElementById('finance-list'); if(!el) return;
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`);
    const data = await res.json();
    const my = data.filter(x => x.userId === userProfile.id && x.item.includes("Баланс"));
    el.innerHTML = my.length ? my.map(x => `<div class="tx-card"><div class="tx-icon">💳</div><div class="tx-body"><div class="tx-title">To'ldirish</div><div class="tx-meta">${x.time}</div></div><div class="tx-right"><div class="tx-amt">+${x.price}</div><span class="tx-st st-${x.status==='done'?'ok':x.status==='pending'?'pend':'fail'}">${x.status}</span></div></div>`).join('') : '<div class="empty-tx">To\'lovlar yo\'q</div>';
  } catch(e) { el.innerHTML = '<div class="empty-tx">Yuklashda xatolik</div>'; }
}

// ── SETTINGS ──
function applyAnim(el) { document.body.classList.toggle('reduce-anim', el.checked); }
function applyTheme(el) { document.documentElement.setAttribute('data-theme', el.checked?'light':'dark'); }
function applySmooth(el) { document.body.classList.toggle('smooth-anim', el.checked); }
function applySnow(el) { el.checked ? startSnow() : stopSnow(); }

let snowRAF=null, flakes=[];
function startSnow() {
  const c = document.getElementById('snow-canvas'); if(!c) return;
  const ctx = c.getContext('2d');
  c.width=window.innerWidth; c.height=window.innerHeight;
  flakes = Array.from({length:100},()=>({x:Math.random()*c.width, y:Math.random()*c.height, r:Math.random()*3+1, d:Math.random()*1+0.5, o:Math.random()*0.5}));
  const draw=()=>{
    ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle='rgba(255,255,255,0.8)';
    flakes.forEach(f=>{
      ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fill();
      f.y+=f.d; if(f.y>c.height) f.y=-5;
    });
    snowRAF=requestAnimationFrame(draw);
  }; draw();
}
function stopSnow() { if(snowRAF) cancelAnimationFrame(snowRAF); const c=document.getElementById('snow-canvas'); if(c) c.getContext('2d').clearRect(0,0,c.width,c.height); }

// ── BONUS ──
function openBonus() { openOverlay('modal-bonus'); }
function applyBonus() {
  const codeInp = document.getElementById('bonus-inp');
  const code = codeInp ? codeInp.value.trim().toUpperCase() : '';
  const res = document.getElementById('bonus-res');
  if(!res) return;
  if(['GAME2026','NEWBIE','GAMESTORE'].includes(code)) {
    userProfile.balance += 500; saveProfile(); applyProfileUI();
    res.textContent = "🎉 +500 so'm qo'shildi!"; res.style.color = "var(--green)";
    if(codeInp) codeInp.value = '';
  } else { res.textContent = "❌ Kod xato yoki ishlatilgan"; res.style.color = "var(--red)"; }
}

function showToast(msg) {
  const el=document.getElementById('toast'); if(!el) return;
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2400);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadProfile(); 
  tryTelegramProfile();
  if(!userProfile.name) {
    userProfile.name = 'Gamer';
    userProfile.username = '@user' + userProfile.id.slice(-4);
  }
  applyProfileUI(); 
  renderGames();
  
  const smoothTog = document.getElementById('tog-smooth');
  if(smoothTog) smoothTog.checked = true;
  document.body.classList.add('smooth-anim');

  // Swipe logic for sheets
  document.querySelectorAll('.sheet').forEach(sh => {
    let sy=0;
    sh.addEventListener('touchstart', e=>{sy=e.touches[0].clientY;},{passive:true});
    sh.addEventListener('touchend', e=>{
      if(e.changedTouches[0].clientY - sy > 80) {
        const ov=sh.closest('.overlay');
        if(ov) ov.classList.remove('open');
      }
    },{passive:true});
  });

  if (window.Telegram && window.Telegram.WebApp) { 
    window.Telegram.WebApp.expand(); 
    window.Telegram.WebApp.ready(); 
  }
});
