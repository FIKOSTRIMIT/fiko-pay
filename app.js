/* ═══ GAMESTORE BOT — app.js (FULL VERSION) ═══ */

// ── CONFIG ──
const SERVER_URL = "http://82.165.56.146:9583"; // Твой сервер

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
  const topAv = document.getElementById('top-avatar');
  const profAv = document.getElementById('profile-avatar');

  if (isInitial) {
    [topAv, profAv].forEach(el => {
      if(!el) return;
      el.textContent = av.toUpperCase();
      el.style.background = 'linear-gradient(135deg,var(--acc),var(--acc2))';
      el.style.color = '#fff';
    });
  } else if (topAv && profAv) {
    topAv.textContent = av;
    profAv.textContent = av;
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

// ── GAMES DATA (ПОЛНЫЙ СПИСОК) ──
const games = [
  {
    id:'ff', name:'FREE FIRE', emoji:'🔥', badge:'SNG',
    idFields: ['Free Fire ID'],
    sections: [
      { title:'💎 ALMAZ', items:[
        {name:'100 Almaz', price:14000}, {name:'341 Almaz', price:35000},
        {name:'572 Almaz', price:60000}, {name:'1166 Almaz', price:115000},
        {name:'2398 Almaz', price:225000}, {name:'6160 Almaz', price:600000},
      ]},
      { title:'🎫 VAUCHER & BP', items:[
        {name:'Haftalik Lite', price:8000}, {name:'Vaucher Haftalik', price:25000}, {name:'Vaucher Oylik', price:85000},
      ]},
      { title:'🔮 Evo Access', items:[
        {name:'Evo Access 3D', price:10000}, {name:'Evo Access 7D', price:15000}, {name:'Evo Access 30D', price:35000},
      ]},
    ]
  },
  {
    id:'ml', name:'MOBILE LEGENDS', emoji:'⚔️', badge:'Global',
    idFields: ['ID oyinchi', 'Zona ID'],
    sections: [
      { title:'💎 ALMAZ', items:[
        {name:'86 Almaz', price:18000}, {name:'172 Almaz', price:35000}, {name:'257 Almaz', price:50000},
        {name:'706 Almaz', price:135000}, {name:'2195 Almaz', price:370000}, {name:'3688 Almaz', price:620000},
        {name:'5532 Almaz', price:925000}, {name:'9288 Almaz', price:1530000},
      ]},
      { title:'💎 ALMAZ 2X', items:[
        {name:'55 Almaz (2x)', price:12000}, {name:'165 Almaz (2x)', price:35000},
        {name:'275 Almaz (2x)', price:55000}, {name:'565 Almaz (2x)', price:110000},
      ]},
      { title:'🎫 PASS', items:[
        {name:'Haftalik Elite Toplam', price:13000}, {name:'Haftalik Voucher', price:22000},
        {name:'Oylik Epic Toplam', price:55000}, {name:'Sumerechniy Propusk', price:110000},
      ]},
    ]
  },
  {
    id:'pubg', name:'PUBG MOBILE', emoji:'🪖', badge:'Global',
    idFields: ['PUBG ID'],
    sections: [
      { title:'💰 UC', items:[
        {name:'30 UC', price:7000}, {name:'60 UC', price:13000}, {name:'120 UC', price:25000},
        {name:'180 UC', price:38000}, {name:'240 UC', price:49000}, {name:'325 UC', price:59000},
        {name:'660 UC', price:120000}, {name:'1800 UC', price:290000}, {name:'3850 UC', price:590000},
      ]},
      { title:'👑 Premium', items:[
        {name:'Premium 1 oy', price:14000}, {name:'Premium 3 oy', price:36000},
        {name:'Premium 6 oy', price:75000}, {name:'Premium 12 oy', price:145000},
      ]},
    ]
  },
  {
    id:'stars', name:'TG STARS', emoji:'⭐', badge:'AVTO',
    idFields: ['Telegram username yoki ID'],
    sections: [
      { title:'⭐ Stars', items:[
        {name:'50 Stars', price:12000}, {name:'100 Stars', price:24000}, {name:'250 Stars', price:65000},
        {name:'500 Stars', price:120000}, {name:'1000 Stars', price:230000},
      ]},
    ]
  },
  {
    id:'delta', name:'DELTA FORCE', emoji:'🎖️', badge:'Global',
    idFields: ['Delta Force ID'],
    sections: [
      { title:'🪙 Coins', items:[
        {name:'72 Coins', price:13000}, {name:'360 Coins', price:65000}, {name:'886 Coins', price:125000},
        {name:'1736 Coins', price:235000}, {name:'4606 Coins', price:590000},
      ]}
    ]
  },
  {
    id:'hok', name:'HONOR OF KINGS', emoji:'👑', badge:'Global',
    idFields: ['Honor of Kings ID'],
    sections: [
      { title:'🪙 Tokens', items:[
        {name:'80 Token', price:17000}, {name:'240 Token', price:38330}, {name:'400 Token', price:70000},
        {name:'560 Token', price:95000}, {name:'800 Token', price:140000},
      ]}
    ]
  },
  {
    id:'ab', name:'ARENA BREAKOUT', emoji:'🔫', badge:'Global',
    idFields: ['Arena Breakout ID'],
    sections: [
      { title:'💰 Coins', items:[
        {name:'100 Coins', price:13000}, {name:'500 Coins', price:65000},
        {name:'1000 Coins', price:130000}, {name:'2500 Coins', price:320000},
      ]}
    ]
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

// ── HISTORY ──
function stLabel(s) {
  if (s==='done') return `<span class="tx-st st-ok">Bajarildi</span>`;
  if (s==='pending') return `<span class="tx-st st-pend">Kutilmoqda</span>`;
  return `<span class="tx-st st-fail">Rad etildi</span>`;
}

async function renderOrders(filter='all') {
  const el = document.getElementById('orders-list');
  if(!el) return;
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`);
    const data = await res.json();
    const myOrders = data.filter(x => x.userId === userProfile.id && !x.item.includes("Баланс"));
    let d = myOrders.filter(x => filter === 'all' || x.status === filter);
    el.innerHTML = d.length ? d.map(x => `
      <div class="tx-card">
        <div class="tx-icon">🎮</div>
        <div class="tx-body"><div class="tx-title">${x.item}</div><div class="tx-meta">${x.time}</div></div>
        <div class="tx-right"><div class="tx-amt neg">-${x.price}</div>${stLabel(x.status)}</div>
      </div>`).join('') : `<div class="empty-tx">Buyurtmalar yo'q</div>`;
  } catch(e) { el.innerHTML = `<div class="empty-tx">Serverga ulanishda xatolik</div>`; }
}

async function renderFinance(filter='all') {
  const el = document.getElementById('finance-list');
  if(!el) return;
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`);
    const data = await res.json();
    const myFinance = data.filter(x => x.userId === userProfile.id && x.item.includes("Баланс"));
    let d = myFinance.filter(x => filter === 'all' || x.status === filter);
    el.innerHTML = d.length ? d.map(x => `
      <div class="tx-card">
        <div class="tx-icon">💳</div>
        <div class="tx-body"><div class="tx-title">Балансni to'ldirish</div><div class="tx-meta">${x.time}</div></div>
        <div class="tx-right"><div class="tx-amt">+${x.price}</div>${stLabel(x.status)}</div>
      </div>`).join('') : `<div class="empty-tx">To'lovlar yo'q</div>`;
  } catch(e) { el.innerHTML = `<div class="empty-tx">Xatolik...</div>`; }
}

// ── NAVIGATION & OVERLAYS ──
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
function openOverlay(id) { document.getElementById(id).classList.add('open'); }
function closeOverlay(e, id) { if (e.target.id===id) forceClose(id); }
function forceClose(id) { document.getElementById(id).classList.remove('open'); }

// ── PAYMENTS ──
function openAmount() { forceClose('modal-topup'); openOverlay('modal-amount'); }
function goToCard() {
  const val = parseInt(document.getElementById('amt-input').value, 10);
  if (!val || val < 1000) { showToast('Minimum 1 000 so\'m'); return; }
  currentAmount = val;
  forceClose('modal-amount');
  document.getElementById('card-amt').textContent = fmt(val) + ' so\'m';
  openOverlay('modal-card');
  startCountdown(300);
}
async function confirmPay() {
  if (countdownInterval) clearInterval(countdownInterval);
  const topupData = {
    userId: userProfile.id,
    user: userProfile.username || userProfile.name,
    item: "Балансni to'ldirish",
    data: "Karta orqali",
    price: currentAmount.toLocaleString() + " so'm",
    status: "pending",
    time: new Date().toLocaleString()
  };
  try {
    const res = await fetch(`${SERVER_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topupData)
    });
    if(res.ok) { forceClose('modal-card'); showToast('To\'lov yuborildi! Admin tasdiqlashini kuting.'); }
  } catch (e) { showToast('Server hatosi!'); }
}

function startCountdown(sec) {
  if (countdownInterval) clearInterval(countdownInterval);
  let rem = sec;
  const el = document.getElementById('countdown');
  const tick = () => {
    const m = String(Math.floor(rem/60)).padStart(2,'0');
    const s = String(rem%60).padStart(2,'0');
    if(el) el.textContent = `${m}:${s}`;
    if (rem<=0) { clearInterval(countdownInterval); }
    rem--;
  };
  tick();
  countdownInterval = setInterval(tick, 1000);
}

// ── SHOP LOGIC ──
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
      <div><div class="gm-name">${gm.name}</div><span class="gm-bdg ${bc}">${gm.badge}</span></div>
    </div>
    <div style="padding:10px">
        <input type="text" id="game-id-input" class="idc-input" placeholder="ID yoki Login kiriting...">
    </div>
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

async function buyItem() {
  if (selectedSection===null || selectedOptIdx===null) { showToast('Tanlang!'); return; }
  const gameIdVal = document.getElementById('game-id-input').value.trim();
  if (!gameIdVal) { showToast('ID kiriting!'); return; }

  const item = selectedGame.sections[selectedSection].items[selectedOptIdx];
  if (userProfile.balance < item.price) { showToast('Mablag\' yetarli emas!'); return; }

  const newOrder = {
    userId: userProfile.id,
    user: userProfile.username || userProfile.name,
    item: selectedGame.name + " (" + item.name + ")",
    data: gameIdVal,
    price: item.price.toLocaleString() + " so'm",
    status: "pending",
    time: new Date().toLocaleString()
  };

  try {
    const res = await fetch(`${SERVER_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    if (res.ok) {
      userProfile.balance -= item.price;
      saveProfile();
      forceClose('modal-game');
      applyProfileUI();
      showToast(`✓ Buyurtma yuborildi!`);
    }
  } catch (error) { showToast('Server xatosi!'); }
}

function showToast(msg) {
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 2400);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  tryTelegramProfile();
  if (!userProfile.name) {
    userProfile.name = 'Gamer';
    userProfile.username = '@user' + userProfile.id.slice(-4);
    saveProfile();
  }
  applyProfileUI();
  renderGames();
  if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
  }
});
