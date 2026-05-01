const tg = window.Telegram.WebApp;
tg.expand();

// 1. ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    // Логика подсветки активной кнопки навигации
}

// 2. СНЕГ (ЗИМНИЙ РЕЖИМ)
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let flakes = [];
function toggleSnow() {
    const isSnow = document.getElementById('toggle-snow').checked;
    if (isSnow) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        flakes = Array.from({length: 100}, () => ({x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*3+1, d: Math.random()*1}));
        requestAnimationFrame(drawSnow);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flakes = [];
    }
}
function drawSnow() {
    if (flakes.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.beginPath();
    flakes.forEach(f => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
        f.y += f.d + 1;
        if (f.y > canvas.height) f.y = -10;
    });
    ctx.fill();
    requestAnimationFrame(drawSnow);
}

// 3. МУЛЬТИЯЗЫЧНОСТЬ
const translations = {
    uz: {
        balance: "Balans", deposit: "Hisobni to'ldirish", bonus: "Bonus kodlar", 
        support: "Qo'llab-quvvatlash", home: "Asosiy", hist: "Tarix", prof: "Profil"
    },
    ru: {
        balance: "Баланс", deposit: "Пополнить", bonus: "Бонус коды", 
        support: "Поддержка", home: "Главная", hist: "История", prof: "Профиль"
    }
};

function setLanguage(lang) {
    const t = translations[lang];
    document.getElementById('lang-balance-label').innerText = t.balance;
    document.getElementById('lang-btn-deposit').innerText = t.deposit;
    document.getElementById('lang-btn-bonus').innerText = t.bonus;
    document.getElementById('lang-btn-support').innerText = t.support;
    document.getElementById('lang-nav-home').innerText = t.home;
    document.getElementById('lang-nav-hist').innerText = t.hist;
    document.getElementById('lang-nav-prof').innerText = t.prof;
    
    // Подсветка кнопок выбора языка
    document.getElementById('btn-uz').style.background = lang === 'uz' ? '#5e5ce6' : 'none';
    document.getElementById('btn-ru').style.background = lang === 'ru' ? '#5e5ce6' : 'none';
}

function openSupport() {
    tg.openTelegramLink('https://t.me/FikoYT');
}

// Инициализация
setLanguage('uz');
