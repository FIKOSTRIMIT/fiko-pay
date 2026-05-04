/* ═══ GAMESTORE BOT — app.js ═══ */

// ── STATE ──
let currentLang = 'uz';
let currentPage = 'home';
let selectedGame = null;
let selectedSection = null;
let selectedOptIdx = null;
let currentAmount = 0;
let countdownInterval = null;
let currentSessionId = null;

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

// Telegram profile — fully automatic, no prompts
function tryTelegramProfile() {
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const u = tg.initDataUnsafe.user;
      userProfile.name = (u.first_name || '') + (u.last_name ? ' ' + u.last_name : '');
      if (u.username) userProfile.username = '@' + u.username;
      // Use first letter as avatar initial
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
  const isInitial = av.length === 1 && /[A-ZА-ЯA-ZА-ЯЁЎҚҒҲ]/i.test(av);

  const topAv = document.getElementById('top-avatar');
  const profAv = document.getElementById('profile-avatar');

  if (isInitial) {
    [topAv, profAv].forEach(el => {
      el.textContent = av.toUpperCase();
      el.style.background = 'linear-gradient(135deg,var(--acc),var(--acc2))';
      el.style.color = '#fff';
    });
    topAv.style.fontSize = '18px';
    profAv.style.fontSize = '28px';
  } else {
    topAv.textContent = av;
    profAv.textContent = av;
    topAv.style.background = '';
    profAv.style.background = '';
  }

  document.getElementById('top-name').textContent = userProfile.name || 'GameStore';
  document.getElementById('top-tag').textContent = userProfile.username || '@user';
  document.getElementById('top-balance').textContent = fmt(userProfile.balance);
  document.getElementById('home-balance').textContent = fmt(userProfile.balance);
  document.getElementById('profile-name').textContent = userProfile.name || '—';
  document.getElementById('profile-uname').textContent = userProfile.username || '@—';
  document.getElementById('profile-id').textContent = userProfile.id;
  document.getElementById('profile-balance').textContent = fmt(userProfile.balance);
}

function fmt(n) { return Number(n).toLocaleString('ru-RU'); }

// ── GAMES DATA ──
const games = [
  {
    id:'ff', name:'FREE FIRE', emoji:'🔥', badge:'SNG',
    idFields: ['Free Fire ID'],
    sections: [
      { title:'💎 ALMAZ', items:[
        {name:'100 Almaz', price:14000},
        {name:'341 Almaz', price:35000},
        {name:'572 Almaz', price:60000},
        {name:'1166 Almaz', price:115000},
        {name:'2398 Almaz', price:225000},
        {name:'6160 Almaz', price:600000},
      ]},
      { title:'🎫 VAUCHER & BP', items:[
        {name:'Haftalik Lite', price:8000},
        {name:'Vaucher Haftalik', price:25000},
        {name:'Vaucher Oylik', price:85000},
      ]},
      { title:'🔮 Evo Access', items:[
        {name:'Evo Access 3D', price:10000},
        {name:'Evo Access 7D', price:15000},
        {name:'Evo Access 30D', price:35000},
      ]},
    ]
  },
  {
    id:'ml', name:'MOBILE LEGENDS', emoji:'⚔️', badge:'Global',
    idFields: ['ID oyinchi', 'Zona ID'],
    sections: [
      { title:'💎 ALMAZ', items:[
        {name:'86 Almaz', price:18000},
        {name:'172 Almaz', price:35000},
        {name:'257 Almaz', price:50000},
        {name:'706 Almaz', price:135000},
        {name:'2195 Almaz', price:370000},
        {name:'3688 Almaz', price:620000},
        {name:'5532 Almaz', price:925000},
        {name:'9288 Almaz', price:1530000},
      ]},
      { title:'💎 ALMAZ 2X', items:[
        {name:'55 Almaz (2x)', price:12000},
        {name:'165 Almaz (2x)', price:35000},
        {name:'275 Almaz (2x)', price:55000},
        {name:'565 Almaz (2x)', price:110000},
      ]},
      { title:'🎫 PASS', items:[
        {name:'Haftalik Elite Toplam', price:13000},
        {name:'Haftalik Voucher', price:22000},
        {name:'Oylik Epic Toplam', price:55000},
        {name:'Sumerechniy Propusk', price:110000},
      ]},
    ]
  },
  {
    id:'pubg', name:'PUBG MOBILE', emoji:'🪖', badge:'Global',
    idFields: ['PUBG ID'],
    sections: [
      { title:'💰 UC', items:[
        {name:'30 UC', price:7000},
        {name:'60 UC', price:13000},
        {name:'120 UC', price:25000},
        {name:'180 UC', price:38000},
        {name:'240 UC', price:49000},
        {name:'325 UC', price:59000},
        {name:'660 UC', price:120000},
        {name:'1800 UC', price:290000},
        {name:'3850 UC', price:590000},
      ]},
      { title:'🔑 Keys', items:[
        {name:'Nabor birinchi xaridlar', price:15000},
        {name:'Qurol yaxshilash to\'plami', price:38000},
        {name:'Mifik emblema to\'plami', price:60000},
      ]},
      { title:'👑 Premium', items:[
        {name:'Premium 1 oy', price:14000},
        {name:'Premium 3 oy', price:36000},
        {name:'Premium 6 oy', price:75000},
        {name:'Premium 12 oy', price:145000},
      ]},
      { title:'💎 Premium Plus', items:[
        {name:'Premium+ 1 oy', price:120000},
        {name:'Premium+ 3 oy', price:355000},
        {name:'Premium+ 6 oy', price:710000},
        {name:'Premium+ 12 oy', price:1400000},
      ]},
      { title:'🎁 Boshqa', items:[
        {name:'Weekly Mythic Emblem Value Pack', price:45000},
        {name:'Weekly Deal Pack 1', price:15000},
        {name:'Weekly Deal Pack 2', price:40000},
      ]},
    ]
  },
  {
    id:'stars', name:'TG STARS', emoji:'⭐', badge:'AVTO',
    idFields: ['Telegram username yoki ID'],
    sections: [
      { title:'⭐ Stars', items:[
        {name:'50 Stars', price:12000},
        {name:'100 Stars', price:24000},
        {name:'150 Stars', price:35000},
        {name:'200 Stars', price:45000},
        {name:'250 Stars', price:65000},
        {name:'300 Stars', price:70000},
        {name:'350 Stars', price:80000},
        {name:'500 Stars', price:120000},
        {name:'750 Stars', price:170000},
        {name:'1000 Stars', price:230000},
      ]},
    ]
  },
  {
    id:'delta', name:'DELTA FORCE', emoji:'🎖️', badge:'Global',
    idFields: ['Delta Force ID'],
    sections: [
      { title:'🪙 Coins', items:[
        {name:'22 Coins', price:5000},
        {name:'37 Coins', price:8000},
        {name:'72 Coins', price:13000},
        {name:'360 Coins', price:65000},
        {name:'544 Coins', price:80000},
        {name:'886 Coins', price:125000},
        {name:'1736 Coins', price:235000},
        {name:'2316 Coins', price:300000},
        {name:'4606 Coins', price:590000},
        {name:'9396 Coins', price:1130000},
        {name:'18792 Coins', price:2300000},
        {name:'28188 Coins', price:3440000},
      ]},
      { title:'🎫 Pass', items:[
        {name:'Sezoniy propusk «Operatsiyalar»', price:65000},
        {name:'Sezoniy propusk «Janglar»', price:65000},
        {name:'Propusk Delta Force «Delux»', price:95000},
        {name:'Запасы «Эхо»', price:10000},
        {name:'Запасы «Эхо» — продвинутые', price:25000},
      ]},
    ]
  },
  {
    id:'hok', name:'HONOR OF KINGS', emoji:'👑', badge:'Global',
    idFields: ['Honor of Kings ID'],
    sections: [
      { title:'🪙 Tokens', items:[
        {name:'8 Token', price:3000},
        {name:'16 Token', price:5000},
        {name:'23 Token', price:6000},
        {name:'80 Token', price:17000},
        {name:'240 Token', price:38330},
        {name:'400 Token', price:70000},
        {name:'560 Token', price:95000},
        {name:'800 Token', price:140000},
      ]},
      { title:'🎫 Pass', items:[
        {name:'Weekly Card Plus', price:45000},
        {name:'Haftalik karta', price:20000},
      ]},
    ]
  },
  {
    id:'ab', name:'ARENA BREAKOUT', emoji:'🔫', badge:'Global',
    idFields: ['Arena Breakout ID'],
    sections: [
      { title:'💰 Coins', items:[
        {name:'100 Coins', price:13000},
        {name:'500 Coins', price:65000},
        {name:'1000 Coins', price:130000},
        {name:'2500 Coins', price:320000},
      ]},
      { title:'🎫 Pass', items:[
        {name:'Kengaytirilgan BP faollashtirish kartasi', price:70000},
        {name:'Premium BP faollashtirish kartasi', price:190000},
      ]},
    ]
  },
];

function renderGames() {
  const g = document.getElementById('games-grid');
  g.innerHTML = games.map(gm => {
    const bc = {Global:'bg-g',SNG:'bg-s',AVTO:'bg-a'}[gm.badge]||'bg-g';
    return `<div class="game-card" onclick="openGame('${gm.id}')">
      <div class="game-thumb">${gm.emoji}<div class="gbadge ${bc}">${gm.badge}</div></div>
      <div class="game-name">${gm.name}</div>
    </div>`;
  }).join('');
}

// ── HISTORY ──
const ordersData = [];
const financeData = [];

function stLabel(s) {
  if (s==='done') return `<span class="tx-st st-ok">Bajarildi</span>`;
  if (s==='pending') return `<span class="tx-st st-pend">Kutilmoqda</span>`;
  return `<span class="tx-st st-fail">Muvaffaqiyatsiz</span>`;
}
function renderOrders(filter='all') {
  const el = document.getElementById('orders-list');
  let d = ordersData.filter(x=>filter==='all'||x.status===filter);
  el.innerHTML = d.length ? d.map(x=>`
    <div class="tx-card">
      <div class="tx-icon">${x.icon}</div>
      <div class="tx-body"><div class="tx-title">${x.title}</div><div class="tx-meta">${x.desc} · ${x.date}</div></div>
      <div class="tx-right"><div class="tx-amt neg">-${fmt(x.amount)} so'm</div>${stLabel(x.status)}</div>
    </div>`).join('') : `<div class="empty-tx">Tranzaksiyalar yo'q</div>`;
}
function renderFinance(filter='all') {
  const el = document.getElementById('finance-list');
  let d = financeData.filter(x=>filter==='all'||x.status===filter);
  el.innerHTML = d.length ? d.map(x=>`
    <div class="tx-card">
      <div class="tx-icon">💳</div>
      <div class="tx-body"><div class="tx-title">Karta orqali to'ldirish</div><div class="tx-meta">${x.date}</div></div>
      <div class="tx-right"><div class="tx-amt">+${fmt(x.amount)} so'm</div>${stLabel(x.status)}</div>
    </div>`).join('') : `<div class="empty-tx">Tranzaksiyalar yo'q</div>`;
}

// ── NAVIGATION ──
function navigate(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  const nb = document.getElementById(`nav-${page}`);
  if (nb) nb.classList.add('active');
  currentPage = page;
  if (page==='history') { renderOrders(); renderFinance(); }
  if (page==='profile') applyProfileUI();
}

function switchHistoryTab(tab) {
  document.getElementById('htab-orders').classList.toggle('active', tab==='orders');
  document.getElementById('htab-finance').classList.toggle('active', tab==='finance');
  document.getElementById('history-orders').classList.toggle('hidden', tab!=='orders');
  document.getElementById('history-finance').classList.toggle('hidden', tab!=='finance');
}
function filterH(type, filter, btn) {
  const sec = type==='orders'?'history-orders':'history-finance';
  document.querySelectorAll(`#${sec} .filter-btn`).forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  type==='orders' ? renderOrders(filter) : renderFinance(filter);
}

// ── OVERLAYS ──
function openOverlay(id) { document.getElementById(id).classList.add('open'); }
function closeOverlay(e, id) { if (e.target.id===id) forceClose(id); }
function forceClose(id) { document.getElementById(id).classList.remove('open'); }

// ── TOPUP ──
function openTopup() { openOverlay('modal-topup'); }
function openBonus() { openOverlay('modal-bonus'); }
function openSupport() { window.open('https://t.me/FikoYT','_blank'); }

function openAmount() {
  forceClose('modal-topup');
  document.getElementById('amt-input').value = '';
  openOverlay('modal-amount');
}
function openBankomat() {
  forceClose('modal-topup');
  const msg = encodeURIComponent('Здравствуйте, я хочу пополниться с банкомата');
  window.open(`https://t.me/FikoYT?text=${msg}`, '_blank');
}
function goToCard() {
  const val = parseInt(document.getElementById('amt-input').value, 10);
  if (!val || val < 1000) { showToast('Minimum 1 000 so\'m kiriting'); return; }
  currentAmount = val;
  forceClose('modal-amount');
  currentSessionId = 'S' + Date.now().toString().slice(-8);
  document.getElementById('card-amt').textContent = fmt(val) + ' so\'m';
  document.getElementById('sess-id').textContent = currentSessionId;
  const btn = document.getElementById('paid-btn');
  btn.disabled = false;
  document.getElementById('timer-exp').classList.add('hidden');
  openOverlay('modal-card');
  startCountdown(300);
}
function startCountdown(sec) {
  if (countdownInterval) clearInterval(countdownInterval);
  let rem = sec;
  const el = document.getElementById('countdown');
  const tick = () => {
    const m = String(Math.floor(rem/60)).padStart(2,'0');
    const s = String(rem%60).padStart(2,'0');
    el.textContent = `${m}:${s}`;
    el.classList.toggle('danger', rem<=60);
    if (rem<=0) {
      clearInterval(countdownInterval);
      el.textContent = '00:00';
      document.getElementById('paid-btn').disabled = true;
      document.getElementById('timer-exp').classList.remove('hidden');
    }
    rem--;
  };
  tick();
  countdownInterval = setInterval(tick, 1000);
}
function confirmPay() {
  if (countdownInterval) clearInterval(countdownInterval);
  forceClose('modal-card');
  const now = new Date();
  const ds = now.toLocaleDateString('ru-RU')+' '+now.toTimeString().slice(0,5);
  financeData.unshift({amount:currentAmount, status:'pending', date:ds});
  showToast('To\'lov yuborildi! Kutilmoqda... ⏳');
  applyProfileUI();
}

// ── BONUS ──
function applyBonus() {
  const code = document.getElementById('bonus-inp').value.trim().toUpperCase();
  const el = document.getElementById('bonus-res');
  const valid = ['GAME2026','NEWBIE50','FIKO2026','GAMESTORE'];
  if (valid.includes(code)) {
    el.style.cssText = 'color:var(--green);background:rgba(34,197,94,.1)';
    el.textContent = '🎉 Bonus qo\'llandi! +500 so\'m';
    userProfile.balance += 500;
    saveProfile(); applyProfileUI();
  } else {
    el.style.cssText = 'color:var(--red);background:rgba(239,68,68,.09)';
    el.textContent = '✗ Noto\'g\'ri kod';
  }
}

// ── GAME MODAL ──
function openGame(id) {
  const gm = games.find(g=>g.id===id);
  if (!gm) return;
  selectedGame = gm;
  selectedSection = null;
  selectedOptIdx = null;

  const bc = {Global:'bg-g',SNG:'bg-s',AVTO:'bg-a'}[gm.badge]||'bg-g';
  const sectionsHTML = gm.sections.map((sec, si) => `
    <div class="section-divider">${sec.title}</div>
    <div class="opt-list">
      ${sec.items.map((item, ii) => `
        <div class="opt-item" id="opt-${si}-${ii}" onclick="selectOpt(${si},${ii})">
          <span class="opt-name">${item.name}</span>
          <span class="opt-price">${fmt(item.price)} so'm</span>
        </div>`).join('')}
    </div>`).join('');

  document.getElementById('game-content').innerHTML = `
    <div class="gm-head">
      <div class="gm-emoji">${gm.emoji}</div>
      <div>
        <div class="gm-name">${gm.name}</div>
        <span class="gm-bdg ${bc}">${gm.badge}</span>
      </div>
    </div>
    <button class="gm-idcheck-btn" onclick="openIDCheck('${gm.id}')">🔍 ID tekshirish — Nikni ko'rish</button>
    ${sectionsHTML}
    <button class="buy-btn" onclick="buyItem()">🛒 Sotib olish</button>`;
  openOverlay('modal-game');
}

function selectOpt(si, ii) {
  document.querySelectorAll('.opt-item').forEach(el=>el.classList.remove('sel'));
  document.getElementById(`opt-${si}-${ii}`).classList.add('sel');
  selectedSection = si;
  selectedOptIdx = ii;
}

function buyItem() {
  if (selectedSection===null || selectedOptIdx===null) {
    showToast('Mahsulotni tanlang!'); return;
  }
  const item = selectedGame.sections[selectedSection].items[selectedOptIdx];
  if (userProfile.balance < item.price) {
    showToast('Balans yetarli emas! To\'ldiring.'); return;
  }
  userProfile.balance -= item.price;
  saveProfile();
  forceClose('modal-game');
  const now = new Date();
  const ds = now.toLocaleDateString('ru-RU')+' '+now.toTimeString().slice(0,5);
  ordersData.unshift({icon:selectedGame.emoji,title:selectedGame.name,desc:item.name,amount:item.price,status:'pending',date:ds});
  applyProfileUI();
  showToast(`✓ ${selectedGame.name} — ${item.name}`);
}

// ── ID CHECK — with nickname lookup ──
// Simulated nickname DB per game (demo)
const nicknameDB = {
  ff:    { '123456789':'FireGamer UZ', '987654321':'ProPlayer FF' },
  ml:    { '123456789':'MLBBHero', '456789123':'NightKiller' },
  pubg:  { '5368794521':'SnipeKing', '1234567890':'PubgLegend' },
  stars: {},
  delta: { '9876543':'DeltaCommander' },
  hok:   { '11223344':'KingsHero' },
  ab:    { '99887766':'BreakoutSniper' },
};

function openIDCheck(gameId) {
  const gm = games.find(g=>g.id===gameId);
  if (!gm) return;
  document.getElementById('idcheck-title').textContent = `🔍 ${gm.name} — ID tekshirish`;
  const fields = gm.idFields || ['ID'];
  document.getElementById('idcheck-fields').innerHTML = fields.map((f,i)=>`
    <div class="idc-field">
      <div class="idc-label">${f}</div>
      <input type="text" id="idc-${i}" class="idc-input" placeholder="${f}..." inputmode="numeric" oninput="onIDInput('${gameId}')"/>
    </div>`).join('');
  document.getElementById('idcheck-result').textContent = '';
  document.getElementById('idcheck-result').style.cssText = '';
  // store current game for lookup
  document.getElementById('modal-idcheck').dataset.gameId = gameId;
  openOverlay('modal-idcheck');
}

// Auto-lookup as user types (debounced)
let idInputTimer = null;
function onIDInput(gameId) {
  clearTimeout(idInputTimer);
  const inp = document.getElementById('idc-0');
  if (!inp || inp.value.trim().length < 4) {
    document.getElementById('idcheck-result').textContent = '';
    return;
  }
  idInputTimer = setTimeout(() => doNicknameLookup(gameId), 600);
}

function verifyID() {
  const gameId = document.getElementById('modal-idcheck').dataset.gameId || '';
  const inputs = document.querySelectorAll('.idc-input');
  let allFilled = true;
  inputs.forEach(inp=>{ if (!inp.value.trim()) allFilled = false; });
  if (!allFilled) { showToast('Barcha maydonlarni to\'ldiring!'); return; }
  doNicknameLookup(gameId);
}

function doNicknameLookup(gameId) {
  const inputs = document.querySelectorAll('.idc-input');
  const res = document.getElementById('idcheck-result');
  const mainId = inputs[0] ? inputs[0].value.trim() : '';

  res.textContent = '⏳ Tekshirilmoqda...';
  res.style.cssText = 'color:var(--gold);background:rgba(245,166,35,.1)';

  setTimeout(() => {
    const db = nicknameDB[gameId] || {};
    const nickname = db[mainId];

    if (nickname) {
      res.style.cssText = 'color:var(--green);background:rgba(34,197,94,.1)';
      res.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap">
          <span style="font-size:18px">✅</span>
          <div>
            <div style="font-size:14px;font-weight:800">${nickname}</div>
            <div style="font-size:10px;color:var(--text2);margin-top:2px">ID: ${mainId}</div>
          </div>
        </div>`;
    } else {
      // If ID not in demo DB, show "found" with a generated mock nickname for demo
      const mockNames = ['ProGamer','NightWolf','ShadowKing','FireBoss','UzPlayer','TopFragger'];
      const mock = mockNames[parseInt(mainId.slice(-1)||'0') % mockNames.length] + '_' + mainId.slice(-3);
      res.style.cssText = 'color:var(--green);background:rgba(34,197,94,.1)';
      res.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap">
          <span style="font-size:18px">✅</span>
          <div>
            <div style="font-size:14px;font-weight:800">${mock}</div>
            <div style="font-size:10px;color:var(--text2);margin-top:2px">ID: ${mainId}</div>
          </div>
        </div>`;
    }
  }, 900);
}

// ── LANGUAGE ──
function setLang(lang) {
  currentLang = lang;
  document.getElementById('lang-uz').classList.toggle('active', lang==='uz');
  document.getElementById('lang-ru').classList.toggle('active', lang==='ru');
}

// ── SETTINGS ──
function applyAnim(el) { document.body.classList.toggle('reduce-anim', el.checked); }
function applyTheme(el) { document.documentElement.setAttribute('data-theme', el.checked?'light':'dark'); }
function applySmooth(el) { document.body.classList.toggle('smooth-anim', el.checked); }
function applySnow(el) { document.body.classList.toggle('snow-on', el.checked); el.checked?startSnow():stopSnow(); }

// ── SNOW ──
let snowRAF=null, flakes=[];
function startSnow() {
  const c = document.getElementById('snow-canvas');
  const ctx = c.getContext('2d');
  c.width=window.innerWidth; c.height=window.innerHeight;
  flakes = Array.from({length:130},()=>({
    x:Math.random()*c.width,y:Math.random()*c.height,
    r:Math.random()*3+1,d:Math.random()*2.5+.8,
    o:Math.random()*.6+.2,dr:(Math.random()-.5)*.7
  }));
  const draw=()=>{
    ctx.clearRect(0,0,c.width,c.height);
    flakes.forEach(s=>{
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,230,255,${s.o})`;ctx.fill();
      s.y+=s.d;s.x+=s.dr;
      if(s.y>c.height){s.y=-5;s.x=Math.random()*c.width}
      if(s.x>c.width)s.x=0;if(s.x<0)s.x=c.width;
    });
    snowRAF=requestAnimationFrame(draw);
  };
  draw();
}
function stopSnow() {
  if(snowRAF)cancelAnimationFrame(snowRAF);
  const c=document.getElementById('snow-canvas');
  c.getContext('2d').clearRect(0,0,c.width,c.height);
}

// ── UTILS ──
function copyText(t) {
  navigator.clipboard.writeText(t).catch(()=>{});
  showToast('Nusxalandi! ✓');
}
let toastTmr=null;
function showToast(msg) {
  const el=document.getElementById('toast');
  el.textContent=msg;el.classList.add('show');
  if(toastTmr)clearTimeout(toastTmr);
  toastTmr=setTimeout(()=>el.classList.remove('show'),2400);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  tryTelegramProfile(); // auto — no prompts, no dialogs

  // Fallback if no TG data and no saved name
  if (!userProfile.name) {
    userProfile.name = 'Gamer';
    userProfile.username = '@user' + userProfile.id.slice(-4);
    userProfile.avatar = '🎮';
    saveProfile();
  }

  applyProfileUI();
  renderGames();
  renderOrders();
  renderFinance();

  document.getElementById('tog-smooth').checked = true;
  document.body.classList.add('smooth-anim');

  // Swipe down to close sheets
  document.querySelectorAll('.sheet').forEach(sh => {
    let sy=0;
    sh.addEventListener('touchstart', e=>{sy=e.touches[0].clientY;},{passive:true});
    sh.addEventListener('touchend', e=>{
      if(e.changedTouches[0].clientY - sy > 80) {
        const ov=sh.closest('.overlay');
        if(ov)ov.classList.remove('open');
      }
    },{passive:true});
    sh.addEventListener('click', e=>e.stopPropagation());
  });

  // TG WebApp expand
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }
  } catch(e){}
});
