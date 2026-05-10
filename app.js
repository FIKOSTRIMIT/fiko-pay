/* ═══════════════════════════════════════
   GAMESTORE — app.js
   Без сервера: заказы/пополнения напрямую в Telegram бот
═══════════════════════════════════════ */

// ── CONFIG ──────────────────────────────
// Замени на токен бота уведомлений после /revoke в @BotFather
const TG_BOT_TOKEN = 'PASTE_NEW_TOKEN_HERE';
const ADMIN_CHAT_ID = '6324502848';

// ── STATE ────────────────────────────────
let currentLang    = 'uz';
let currentPage    = 'home';
let selectedGame   = null;
let selectedSec    = null;
let selectedIdx    = null;
let currentAmount  = 0;
let countdownInt   = null;
let currentSessId  = null;

// ── PROFILE ──────────────────────────────
let userProfile = { name:'', username:'', avatar:'🎮', id:'', balance:0 };

function genUID() {
  return String(Date.now()).slice(-7) + String(Math.floor(Math.random()*1000)).padStart(3,'0');
}
function loadProfile() {
  try {
    const s = localStorage.getItem('gs_v3');
    if (s) userProfile = JSON.parse(s);
  } catch(e){}
  if (!userProfile.id) userProfile.id = genUID();
}
function saveProfile() {
  try { localStorage.setItem('gs_v3', JSON.stringify(userProfile)); } catch(e){}
}
function tryTelegramProfile() {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user;
      userProfile.name     = [u.first_name, u.last_name].filter(Boolean).join(' ');
      userProfile.username = u.username ? '@' + u.username : '@user';
      userProfile.avatar   = u.first_name?.[0]?.toUpperCase() || '🎮';
      if (u.id) userProfile.id = String(u.id);
      saveProfile();
    }
  } catch(e){}
}
function applyProfileUI() {
  const av = userProfile.avatar || '🎮';
  const isLetter = av.length === 1 && /\w/i.test(av);
  const style = isLetter ? 'background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;font-weight:800;' : '';
  const fsSm  = isLetter ? 'font-size:18px' : 'font-size:20px';
  const fsLg  = isLetter ? 'font-size:28px' : 'font-size:34px';

  const topAv  = document.getElementById('top-avatar');
  const profAv = document.getElementById('profile-avatar');
  topAv.textContent  = av; topAv.style.cssText  = style + fsSm;
  profAv.textContent = av; profAv.style.cssText = style + fsLg;

  document.getElementById('top-name').textContent      = userProfile.name     || 'GameStore';
  document.getElementById('top-tag').textContent       = userProfile.username || '@user';
  document.getElementById('top-balance').textContent   = fmt(userProfile.balance);
  document.getElementById('home-balance').textContent  = fmt(userProfile.balance);
  document.getElementById('profile-name').textContent  = userProfile.name     || '—';
  document.getElementById('profile-uname').textContent = userProfile.username || '@—';
  document.getElementById('profile-id').textContent    = userProfile.id;
  document.getElementById('profile-balance').textContent = fmt(userProfile.balance);
}

// ── I18N ──────────────────────────────────
const LANGS = {
  uz: {
    balance:'Balans', som:"so'm", topup:"To'ldirish", bonus:'Bonus kod',
    support:"Qo'llab-quvvatlash", gamesLabel:"🎮 O'YINLAR",
    history:'Tarix', orders:'Buyurtmalar', finance:'Moliya',
    all:'Barchasi', done:'Bajarildi', pending:'Kutilmoqda', cancel:'Bekor',
    profile:'Profil', home:'Bosh sahifa', idLabel:'ID:',
    langLabel:'TIL', settingsLabel:'SOZLAMALAR',
    animLabel:'Animatsiyalar', animDesc:"Silliq effektlarni yoqish/o'chirish",
    nightMode:'Tungi rejim', nightModeDesc:"Yorug' rejimga o'tish",
    snowMode:'Qish rejimi', snowDesc:"GTA qish kabi qor yog'dirish",
    topupTitle:"Hisobni to'ldirish", selectMethod:"To'lov usulini tanlang",
    bankomat:'BANKOMAT', enterAmount:'Summa kiriting',
    minAmount:"Minimum: 1 000 so'm", continue:'Davom etish →',
    payTime:"⏱ To'lov vaqti:", copy:'Nusxalash',
    howToPay:"Qanday to'lash kerak:",
    inst1:'✔ Aynan shu summani yuborish!',
    inst2:'✔ 5 daqiqa ichida to\'lov qilish!',
    inst3:'✖ Boshqa summa yuborish',
    inst4:'✖ Bankomatdan tashlash',
    paidBtn:"To'lov qildim ✓",
    timerExp:"⏰ Vaqt tugadi. Qaytadan urining.",
    bonusTitle:'Bonus kodlar', bonusPlaceholder:'Kodni kiriting...',
    apply:"Qo'llash", buyBtn:'Sotib olish',
    stDone:'Bajarildi', stPend:'Kutilmoqda', stFail:"Muvaffaqiyatsiz",
    noTx:"Tranzaksiyalar yo'q",
    bonusOk:"🎉 Bonus qo'llandi!", bonusFail:"✗ Noto'g'ri kod yoki limit tugagan",
    minErr:"Minimum 1 000 so'm kiriting",
    selItem:"Mahsulotni tanlang!", noBalance:"Balans yetarli emas! To'ldiring.",
    orderSent:"✓ Buyurtma adminga yuborildi! Tez orada bajariladi.",
    topupSent:"✓ To'lov yuborildi! Admin tekshirmoqda...",
    bankomatMsg:'Здравствуйте, я хочу пополниться с банкомата',
  },
  ru: {
    balance:'Баланс', som:'сум', topup:'Пополнить', bonus:'Бонус код',
    support:'Поддержка', gamesLabel:'🎮 ИГРЫ',
    history:'История', orders:'Заказы', finance:'Финансы',
    all:'Все', done:'Выполнено', pending:'Ожидание', cancel:'Отмена',
    profile:'Профиль', home:'Главная', idLabel:'ID:',
    langLabel:'ЯЗЫК', settingsLabel:'НАСТРОЙКИ',
    animLabel:'Анимации', animDesc:'Включить/отключить эффекты',
    nightMode:'Ночной режим', nightModeDesc:'Переключить на светлый',
    snowMode:'Зимний режим', snowDesc:'Снег как в GTA',
    topupTitle:'Пополнение счёта', selectMethod:'Выберите способ оплаты',
    bankomat:'БАНКОМАТ', enterAmount:'Введите сумму',
    minAmount:'Минимум: 1 000 сум', continue:'Продолжить →',
    payTime:'⏱ Время оплаты:', copy:'Копировать',
    howToPay:'Как оплатить:',
    inst1:'✔ Отправить именно эту сумму!',
    inst2:'✔ Оплатить в течение 5 минут!',
    inst3:'✖ Отправить другую сумму',
    inst4:'✖ Через банкомат',
    paidBtn:'Я оплатил ✓',
    timerExp:'⏰ Время вышло. Попробуйте снова.',
    bonusTitle:'Бонус коды', bonusPlaceholder:'Введите код...',
    apply:'Применить', buyBtn:'Купить',
    stDone:'Выполнено', stPend:'Ожидание', stFail:'Неуспешно',
    noTx:'Нет транзакций',
    bonusOk:'🎉 Бонус применён!', bonusFail:'✗ Неверный код или лимит исчерпан',
    minErr:'Минимум 1 000 сум',
    selItem:'Выберите товар!', noBalance:'Недостаточно средств! Пополните баланс.',
    orderSent:'✓ Заказ отправлен! Скоро выполним.',
    topupSent:'✓ Оплата отправлена! Ждите подтверждения...',
    bankomatMsg:'Здравствуйте, я хочу пополниться с банкомата',
  }
};

function t(key) { return LANGS[currentLang]?.[key] || LANGS.uz[key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
}

function setLang(lang) {
  currentLang = lang;
  // Update lang buttons
  document.getElementById('lang-uz').classList.toggle('active', lang === 'uz');
  document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
  // Apply all translations
  applyTranslations();
  // Re-render dynamic content that uses t()
  renderGames();
  renderOrders(currentOrdFilter);
  renderFinance(currentFinFilter);
  applyProfileUI();
  // Update history tab labels
  document.getElementById('htab-orders').textContent = t('orders');
  document.getElementById('htab-finance').textContent = t('finance');
}

// ── GAMES ─────────────────────────────────
// Icons: tries icons/GAMEID.svg first, falls back to emoji
const GAMES = [
  { id:'ff', name:'FREE FIRE', emoji:'🔥', badge:'SNG',
    idFields:['Free Fire ID'],
    sections:[
      { title:'💎 ALMAZ', items:[
        {name:'100 Almaz',price:14000},{name:'341 Almaz',price:35000},
        {name:'572 Almaz',price:60000},{name:'1166 Almaz',price:115000},
        {name:'2398 Almaz',price:225000},{name:'6160 Almaz',price:600000}]},
      { title:'🎫 VAUCHER & BP', items:[
        {name:'Haftalik Lite',price:8000},{name:'Vaucher Haftalik',price:25000},
        {name:'Vaucher Oylik',price:85000}]},
      { title:'🔮 Evo Access', items:[
        {name:'Evo Access 3D',price:10000},{name:'Evo Access 7D',price:15000},
        {name:'Evo Access 30D',price:35000}]}
    ]},
  { id:'ml', name:'MOBILE LEGENDS', emoji:'⚔️', badge:'Global',
    idFields:['ID oyinchi','Zona ID'],
    sections:[
      { title:'💎 ALMAZ', items:[
        {name:'86',price:18000},{name:'172',price:35000},{name:'257',price:50000},
        {name:'706',price:135000},{name:'2195',price:370000},{name:'3688',price:620000},
        {name:'5532',price:925000},{name:'9288',price:1530000}]},
      { title:'💎 ALMAZ 2X', items:[
        {name:'55 (2x)',price:12000},{name:'165 (2x)',price:35000},
        {name:'275 (2x)',price:55000},{name:'565 (2x)',price:110000}]},
      { title:'🎫 PASS', items:[
        {name:'Haftalik Elite',price:13000},{name:'Haftalik Voucher',price:22000},
        {name:'Oylik Epic',price:55000},{name:'Sumerechniy Propusk',price:110000}]}
    ]},
  { id:'pubg', name:'PUBG MOBILE', emoji:'🪖', badge:'Global',
    idFields:['PUBG ID'],
    sections:[
      { title:'💰 UC', items:[
        {name:'30 UC',price:7000},{name:'60 UC',price:13000},{name:'120 UC',price:25000},
        {name:'180 UC',price:38000},{name:'240 UC',price:49000},{name:'325 UC',price:59000},
        {name:'660 UC',price:120000},{name:'1800 UC',price:290000},{name:'3850 UC',price:590000}]},
      { title:'🔑 Keys', items:[
        {name:"Birinchi xarid to'plami",price:15000},
        {name:"Qurol yaxshilash to'plami",price:38000},
        {name:"Mifik emblema to'plami",price:60000}]},
      { title:'👑 Premium', items:[
        {name:'Premium 1 oy',price:14000},{name:'Premium 3 oy',price:36000},
        {name:'Premium 6 oy',price:75000},{name:'Premium 12 oy',price:145000}]},
      { title:'💎 Premium Plus', items:[
        {name:'Premium+ 1 oy',price:120000},{name:'Premium+ 3 oy',price:355000},
        {name:'Premium+ 6 oy',price:710000},{name:'Premium+ 12 oy',price:1400000}]},
      { title:'🎁 Boshqa', items:[
        {name:'Weekly Mythic Emblem Pack',price:45000},
        {name:'Weekly Deal Pack 1',price:15000},
        {name:'Weekly Deal Pack 2',price:40000}]}
    ]},
  { id:'stars', name:'TG STARS', emoji:'⭐', badge:'AVTO',
    idFields:['Telegram @username'],
    sections:[
      { title:'⭐ Stars', items:[
        {name:'50 Stars',price:12000},{name:'100 Stars',price:24000},
        {name:'150 Stars',price:35000},{name:'200 Stars',price:45000},
        {name:'250 Stars',price:65000},{name:'300 Stars',price:70000},
        {name:'350 Stars',price:80000},{name:'500 Stars',price:120000},
        {name:'750 Stars',price:170000},{name:'1000 Stars',price:230000}]}
    ]},
  { id:'delta', name:'DELTA FORCE', emoji:'🎖️', badge:'Global',
    idFields:['Delta Force ID'],
    sections:[
      { title:'🪙 Coins', items:[
        {name:'22',price:5000},{name:'37',price:8000},{name:'72',price:13000},
        {name:'360',price:65000},{name:'544',price:80000},{name:'886',price:125000},
        {name:'1736',price:235000},{name:'2316',price:300000},{name:'4606',price:590000},
        {name:'9396',price:1130000},{name:'18792',price:2300000},{name:'28188',price:3440000}]},
      { title:'🎫 Pass', items:[
        {name:'Propusk «Operatsiyalar»',price:65000},
        {name:'Propusk «Janglar»',price:65000},
        {name:'Delta Force Delux',price:95000},
        {name:"Запасы «Эхо»",price:10000},
        {name:"Запасы «Эхо» продвинутые",price:25000}]}
    ]},
  { id:'hok', name:'HONOR OF KINGS', emoji:'👑', badge:'Global',
    idFields:['Honor of Kings ID'],
    sections:[
      { title:'🪙 Tokens', items:[
        {name:'8 Token',price:3000},{name:'16 Token',price:5000},
        {name:'23 Token',price:6000},{name:'80 Token',price:17000},
        {name:'240 Token',price:38330},{name:'400 Token',price:70000},
        {name:'560 Token',price:95000},{name:'800 Token',price:140000}]},
      { title:'🎫 Pass', items:[
        {name:'Weekly Card Plus',price:45000},{name:'Haftalik karta',price:20000}]}
    ]},
  { id:'ab', name:'ARENA BREAKOUT', emoji:'🔫', badge:'Global',
    idFields:['Arena Breakout ID'],
    sections:[
      { title:'💰 Coins', items:[
        {name:'100 Coins',price:13000},{name:'500 Coins',price:65000},
        {name:'1000 Coins',price:130000},{name:'2500 Coins',price:320000}]},
      { title:'🎫 Pass', items:[
        {name:"Kengaytirilgan BP kartasi",price:70000},
        {name:"Premium BP kartasi",price:190000}]}
    ]},
];

function gameThumbHtml(gm) {
  const bc = {Global:'bg-g',SNG:'bg-s',AVTO:'bg-a'}[gm.badge]||'bg-g';
  // Try SVG icon first
  return `<div class="game-thumb">
    <img src="icons/${gm.id}.svg" alt="${gm.name}"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         style="width:100%;height:100%;object-fit:cover;display:block;border-radius:0"/>
    <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:36px;position:absolute;inset:0">
      ${gm.emoji}
    </div>
    <div class="gbadge ${bc}">${gm.badge}</div>
  </div>`;
}

function renderGames() {
  document.getElementById('games-grid').innerHTML = GAMES.map(gm =>
    `<div class="game-card" onclick="openGame('${gm.id}')">
      ${gameThumbHtml(gm)}
      <div class="game-name">${gm.name}</div>
    </div>`
  ).join('');
}

// ── HISTORY ───────────────────────────────
let ordersData = [], financeData = [];
let currentOrdFilter = 'all', currentFinFilter = 'all';

function stLabel(s) {
  const map = {done:'st-ok',pending:'st-pend',cancel:'st-fail'};
  const lbl = {done:t('stDone'),pending:t('stPend'),cancel:t('stFail')};
  return `<span class="tx-st ${map[s]||'st-pend'}">${lbl[s]||s}</span>`;
}

function renderOrders(filter) {
  filter = filter || 'all'; currentOrdFilter = filter;
  const el = document.getElementById('orders-list');
  const d  = filter === 'all' ? ordersData : ordersData.filter(x => x.status === filter);
  el.innerHTML = d.length ? d.map(x =>
    `<div class="tx-card">
      <div class="tx-icon">
        <img src="icons/${x.gameId||''}.svg" onerror="this.style.display='none';this.parentElement.textContent='${x.icon}'" style="width:100%;height:100%;object-fit:cover;border-radius:9px"/>
      </div>
      <div class="tx-body">
        <div class="tx-title">${x.title}</div>
        <div class="tx-meta">${x.desc} · ${x.date}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amt neg">-${fmt(x.price)} so'm</div>
        ${stLabel(x.status)}
      </div>
    </div>`
  ).join('') : `<div class="empty-tx">${t('noTx')}</div>`;
}

function renderFinance(filter) {
  filter = filter || 'all'; currentFinFilter = filter;
  const el = document.getElementById('finance-list');
  const d  = filter === 'all' ? financeData : financeData.filter(x => x.status === filter);
  el.innerHTML = d.length ? d.map(x =>
    `<div class="tx-card">
      <div class="tx-icon">💳</div>
      <div class="tx-body">
        <div class="tx-title">Karta orqali to'ldirish</div>
        <div class="tx-meta">${x.date}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amt">+${fmt(x.amount)} so'm</div>
        ${stLabel(x.status)}
      </div>
    </div>`
  ).join('') : `<div class="empty-tx">${t('noTx')}</div>`;
}

// ── NAVIGATION ────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('nav-'+page).classList.add('active');
  currentPage = page;
  if (page === 'history') { renderOrders(currentOrdFilter); renderFinance(currentFinFilter); }
  if (page === 'profile') applyProfileUI();
}

function switchHistoryTab(tab) {
  document.getElementById('htab-orders').classList.toggle('active', tab==='orders');
  document.getElementById('htab-finance').classList.toggle('active', tab==='finance');
  document.getElementById('history-orders').classList.toggle('hidden', tab!=='orders');
  document.getElementById('history-finance').classList.toggle('hidden', tab!=='finance');
}

function filterH(type, filter, btn) {
  const sec = type==='orders' ? 'history-orders' : 'history-finance';
  document.querySelectorAll('#'+sec+' .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  type==='orders' ? renderOrders(filter) : renderFinance(filter);
}

// ── OVERLAYS ──────────────────────────────
function openOverlay(id)              { document.getElementById(id).classList.add('open'); }
function closeOverlay(e, id)          { if (e.target.id===id) forceClose(id); }
function forceClose(id)               { document.getElementById(id).classList.remove('open'); }

// ── TOPUP ─────────────────────────────────
function openTopup()  { openOverlay('modal-topup'); }
function openBonus()  { openOverlay('modal-bonus'); }
function openSupport(){ window.open('https://t.me/FikoYT','_blank'); }

function openAmount() {
  forceClose('modal-topup');
  document.getElementById('amt-input').value = '';
  openOverlay('modal-amount');
}
function openBankomat() {
  forceClose('modal-topup');
  const msg = encodeURIComponent(t('bankomatMsg'));
  window.open('https://t.me/FikoYT?text='+msg, '_blank');
}
function goToCard() {
  const val = parseInt(document.getElementById('amt-input').value, 10);
  if (!val || val < 1000) { showToast(t('minErr')); return; }
  currentAmount = val;
  currentSessId = 'S' + Date.now().toString().slice(-8);
  document.getElementById('sess-id').textContent  = currentSessId;
  document.getElementById('card-amt').textContent = fmt(val) + " so'm";
  document.getElementById('paid-btn').disabled    = false;
  document.getElementById('timer-exp').classList.add('hidden');
  forceClose('modal-amount');
  openOverlay('modal-card');
  startCountdown(300);
}

function startCountdown(sec) {
  if (countdownInt) clearInterval(countdownInt);
  let rem = sec;
  const el = document.getElementById('countdown');
  const tick = () => {
    el.textContent = String(Math.floor(rem/60)).padStart(2,'0')+':'+String(rem%60).padStart(2,'0');
    el.classList.toggle('danger', rem<=60);
    if (rem<=0) {
      clearInterval(countdownInt);
      el.textContent = '00:00';
      document.getElementById('paid-btn').disabled = true;
      document.getElementById('timer-exp').classList.remove('hidden');
    }
    rem--;
  };
  tick();
  countdownInt = setInterval(tick, 1000);
}

async function confirmPay() {
  if (countdownInt) clearInterval(countdownInt);
  forceClose('modal-card');

  const now = new Date();
  const ds  = now.toLocaleDateString('ru-RU')+' '+now.toTimeString().slice(0,5);
  financeData.unshift({ amount:currentAmount, status:'pending', date:ds });
  renderFinance(currentFinFilter);
  showToast(t('topupSent'));

  // Send to Telegram bot directly (no server needed)
  const msg =
    `💳 *Yangi poplenie so'rovi!*\n\n` +
    `👤 Mijoz: *${userProfile.name}* ${userProfile.username}\n` +
    `🆔 TG ID: \`${userProfile.id}\`\n` +
    `💰 Summa: *${fmt(currentAmount)} so'm*\n` +
    `🔑 Session: \`${currentSessId}\`\n` +
    `📅 Vaqt: ${ds}`;

  await sendToBot(msg);
}

// ── BONUS ─────────────────────────────────
async function applyBonus() {
  const code = document.getElementById('bonus-inp').value.trim().toUpperCase();
  const el   = document.getElementById('bonus-res');
  if (!code) return;

  // Проверка: храним использованные коды в localStorage
  const usedKey  = 'gs_used_promos';
  const usedCodes = JSON.parse(localStorage.getItem(usedKey)||'[]');

  // Локальные промокоды (можно добавлять новые через бот, но здесь базовые)
  // Структура: { code, value, limit }
  const PROMOS = JSON.parse(localStorage.getItem('gs_promos')||'[]');

  const promo = PROMOS.find(p => p.code === code);

  if (!promo) {
    el.style.cssText = 'color:var(--red);background:rgba(239,68,68,.08)';
    el.textContent = t('bonusFail');
    return;
  }
  if (usedCodes.includes(code)) {
    el.style.cssText = 'color:var(--red);background:rgba(239,68,68,.08)';
    el.textContent = '✗ Siz bu kodni allaqachon ishlatgansiz';
    return;
  }
  if (promo.used >= promo.limit) {
    el.style.cssText = 'color:var(--red);background:rgba(239,68,68,.08)';
    el.textContent = `✗ Limit tugadi (${promo.limit}/${promo.limit})`;
    return;
  }

  // Activate
  promo.used = (promo.used||0) + 1;
  usedCodes.push(code);
  localStorage.setItem(usedKey, JSON.stringify(usedCodes));
  localStorage.setItem('gs_promos', JSON.stringify(PROMOS));

  userProfile.balance += promo.value;
  saveProfile();
  applyProfileUI();

  el.style.cssText = 'color:var(--green);background:rgba(34,197,94,.1)';
  el.textContent = `🎉 +${fmt(promo.value)} so'm! ${t('bonusOk')}`;

  // Notify bot about promo activation
  await sendToBot(
    `🎫 Promo faollashtirildi!\n👤 ${userProfile.name} ${userProfile.username}\n🆔 \`${userProfile.id}\`\nKod: \`${code}\` | +${fmt(promo.value)} so'm`
  );
}

// ── GAME MODAL ────────────────────────────
function openGame(id) {
  const gm = GAMES.find(g => g.id===id);
  if (!gm) return;
  selectedGame = gm; selectedSec = null; selectedIdx = null;

  const bc = {Global:'bg-g',SNG:'bg-s',AVTO:'bg-a'}[gm.badge]||'bg-g';
  const secHtml = gm.sections.map((sec, si) =>
    `<div class="sec-div">${sec.title}</div>
     <div class="opt-list">
       ${sec.items.map((item, ii) =>
         `<div class="opt-item" id="oi${si}_${ii}" onclick="selOpt(${si},${ii})">
            <span class="opt-name">${item.name}</span>
            <span class="opt-price">${fmt(item.price)} so'm</span>
          </div>`
       ).join('')}
     </div>`
  ).join('');

  // Icon html
  const iconHtml = `
    <img class="gm-img" src="icons/${gm.id}.svg" alt="${gm.name}"
         onerror="this.style.display='none';document.getElementById('gm-em-${gm.id}').style.display='flex'"/>
    <div class="gm-emoji-icon" id="gm-em-${gm.id}" style="display:none">${gm.emoji}</div>`;

  document.getElementById('game-content').innerHTML =
    `<div class="gm-head">
       ${iconHtml}
       <div>
         <div class="gm-name">${gm.name}</div>
         <span class="gm-bdg ${bc}">${gm.badge}</span>
       </div>
     </div>
     ${secHtml}
     <button class="buy-main-btn" onclick="openBuyConfirm()">
       🛒 ${t('buyBtn')}
     </button>`;

  openOverlay('modal-game');
}

function selOpt(si, ii) {
  document.querySelectorAll('.opt-item').forEach(el => el.classList.remove('sel'));
  document.getElementById(`oi${si}_${ii}`).classList.add('sel');
  selectedSec = si; selectedIdx = ii;
}

// ── BUY CONFIRM ───────────────────────────
function openBuyConfirm() {
  if (selectedSec===null || selectedIdx===null) { showToast(t('selItem')); return; }
  const item = selectedGame.sections[selectedSec].items[selectedIdx];

  if (userProfile.balance < item.price) {
    showToast(t('noBalance'));
    return;
  }

  // Show buy confirm modal with ID fields
  document.getElementById('buy-title').textContent = `🛒 ${selectedGame.name} — ${item.name}`;
  document.getElementById('buy-summary').innerHTML =
    `<div>${selectedGame.name}</div>
     <strong>${fmt(item.price)} so'm</strong>
     <div style="font-size:10px;color:var(--text2);margin-top:4px">
       Sizning balansingiz: ${fmt(userProfile.balance)} so'm
     </div>`;

  // ID fields for this game
  document.getElementById('buy-id-fields').innerHTML = selectedGame.idFields.map((f, i) =>
    `<div class="idf-wrap">
       <label class="idf-label">${f}</label>
       <input type="text" class="idf-input" id="idf-${i}" placeholder="${f}..."/>
     </div>`
  ).join('');

  document.getElementById('buy-result').textContent = '';
  document.getElementById('buy-result').style.cssText = '';
  document.getElementById('buy-confirm-btn').disabled = false;

  forceClose('modal-game');
  openOverlay('modal-buy');
}

async function confirmBuy() {
  if (selectedSec===null || selectedIdx===null) return;
  const item = selectedGame.sections[selectedSec].items[selectedIdx];

  // Collect ID fields
  const inputs = document.querySelectorAll('.idf-input');
  let allFilled = true;
  const playerData = {};
  selectedGame.idFields.forEach((f, i) => {
    const v = document.getElementById('idf-'+i)?.value?.trim() || '';
    if (!v) allFilled = false;
    playerData[f] = v;
  });
  if (!allFilled) { showToast(t('selItem')); return; }

  // Deduct balance locally
  userProfile.balance -= item.price;
  saveProfile();
  applyProfileUI();

  // Save to local history
  const now = new Date();
  const ds  = now.toLocaleDateString('ru-RU')+' '+now.toTimeString().slice(0,5);
  ordersData.unshift({
    icon: selectedGame.emoji,
    gameId: selectedGame.id,
    title: selectedGame.name,
    desc: item.name,
    price: item.price,
    status: 'pending',
    date: ds
  });
  renderOrders(currentOrdFilter);

  // Show result
  const resultEl = document.getElementById('buy-result');
  resultEl.style.cssText = 'color:var(--green);background:rgba(34,197,94,.1)';
  resultEl.textContent = t('orderSent');
  document.getElementById('buy-confirm-btn').disabled = true;

  // Build Telegram message
  const idInfo = Object.entries(playerData).map(([k,v]) => `  ${k}: \`${v}\``).join('\n');
  const msg =
    `🎮 *Yangi buyurtma!*\n\n` +
    `👤 Mijoz: *${userProfile.name}* ${userProfile.username}\n` +
    `🆔 TG ID: \`${userProfile.id}\`\n` +
    `🎯 O'yin: *${selectedGame.name}*\n` +
    `📦 Mahsulot: ${item.name}\n` +
    `💰 Summa: *${fmt(item.price)} so'm*\n` +
    `🔑 Oyinchi ma'lumotlari:\n${idInfo}\n` +
    `📅 Vaqt: ${ds}`;

  await sendToBot(msg);

  setTimeout(() => forceClose('modal-buy'), 1800);
}

// ── TELEGRAM BOT (no server) ──────────────
// Sends message directly to the bot via Telegram API
async function sendToBot(text) {
  try {
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch(e) {
    console.warn('TG send failed:', e.message);
    // Fail silently — order is still saved locally
  }
}

// ── SETTINGS ──────────────────────────────
function applyAnimToggle(el) {
  // One toggle: checked = animations ON, unchecked = OFF
  document.body.classList.toggle('no-anim', !el.checked);
}
function applyTheme(el) {
  document.documentElement.setAttribute('data-theme', el.checked ? 'light' : 'dark');
}
function applySnow(el) {
  document.body.classList.toggle('snow-on', el.checked);
  el.checked ? startSnow() : stopSnow();
}

// ── SNOW ──────────────────────────────────
let snowRAF = null, flakes = [];
function startSnow() {
  const c = document.getElementById('snow-canvas');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  flakes = Array.from({length:130}, () => ({
    x:Math.random()*c.width, y:Math.random()*c.height,
    r:Math.random()*3+1, d:Math.random()*2.5+.8,
    o:Math.random()*.6+.2, dr:(Math.random()-.5)*.7
  }));
  const draw = () => {
    ctx.clearRect(0,0,c.width,c.height);
    flakes.forEach(s => {
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(200,230,255,${s.o})`; ctx.fill();
      s.y+=s.d; s.x+=s.dr;
      if (s.y>c.height){s.y=-5;s.x=Math.random()*c.width}
      if (s.x>c.width)s.x=0; if(s.x<0)s.x=c.width;
    });
    snowRAF = requestAnimationFrame(draw);
  };
  draw();
}
function stopSnow() {
  if (snowRAF) cancelAnimationFrame(snowRAF);
  const c = document.getElementById('snow-canvas');
  c.getContext('2d').clearRect(0,0,c.width,c.height);
}

// ── UTILS ─────────────────────────────────
function fmt(n) { return Number(n).toLocaleString('ru-RU'); }

function copyText(t) {
  navigator.clipboard.writeText(t).catch(()=>{});
  showToast('Nusxalandi! ✓');
}

let toastTmr = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  if (toastTmr) clearTimeout(toastTmr);
  toastTmr = setTimeout(() => el.classList.remove('show'), 2400);
}

// ── INIT ──────────────────────────────────
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
  renderOrders();
  renderFinance();
  applyTranslations();

  // Swipe down to close sheets
  document.querySelectorAll('.sheet').forEach(sh => {
    let sy = 0;
    sh.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, {passive:true});
    sh.addEventListener('touchend',   e => {
      if (e.changedTouches[0].clientY - sy > 80) {
        sh.closest('.overlay')?.classList.remove('open');
      }
    }, {passive:true});
    sh.addEventListener('click', e => e.stopPropagation());
  });

  // TG WebApp init
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }
  } catch(e){}
});
