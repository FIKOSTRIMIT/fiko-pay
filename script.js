let tg = window.Telegram.WebApp;
tg.expand();

// 1. O'YINLAR RO'YXATI
const games = [
    { id: 'pubg', name: "PUBG MOBILE", img: "img/pubg.png", badge: "Global", type: "global", sub: "UC" },
    { id: 'ff', name: "FREE FIRE", img: "img/ff.png", badge: "SNG", type: "global", sub: "Diamonds" },
    { id: 'mlbb', name: "MOBILE LEGENDS", img: "img/mlbb.png", badge: "Global", type: "global", sub: "Diamonds" },
    { id: 'genshin', name: "GENSHIN IMPACT", img: "img/genshin.png", badge: "Global", type: "global", sub: "Genesis" },
    { id: 'arena', name: "ARENA BREAKOUT", img: "img/arena.png", badge: "AVTO", type: "avto", sub: "Bonds" },
    { id: 'stars', name: "STARS", img: "img/stars.png", badge: "AVTO", type: "avto", sub: "Telegram" }
];

// 2. NARXLAR VA KATEGORIYALAR
const priceData = {
    'ff': {
        categories: [
            { id: 'almaz', name: '💎 Almaz', items: [
                { amount: "25", price: "5 000" }, { amount: "100", price: "14 000" }, { amount: "310", price: "35 000" },
                { amount: "520", price: "55 000" }, { amount: "1,060", price: "110 000" }, { amount: "5,600", price: "510 000" }
            ]},
            { id: 'vaucher', name: '🎫 Vaucher', items: [
                { amount: "BP Card", price: "52 000" }, { amount: "Oylik Vaucher", price: "130 000" }
            ]}
        ]
    },
    'mlbb': {
        categories: [
            { id: 'almaz', name: '💎 Almaz', items: [
                { amount: "56", price: "12 000" }, { amount: "112", price: "24 000" }, { amount: "336", price: "64 000" }, { amount: "6042", price: "990 000" }
            ]},
            { id: 'pass', name: '🎟 Pass', items: [
                { amount: "Twilight Pass", price: "100 000" }, { amount: "Haftalik vaucher", price: "22 000" }
            ]}
        ]
    },
    'arena': {
        categories: [
            { id: 'bonds', name: '💰 Bonds', items: [
                { amount: "66 Bonds", price: "13 000" }, { amount: "1690 Bonds", price: "230 000" }, { amount: "6820 Bonds", price: "995 000" }
            ]}
        ]
    }
    // PUBG va boshqalarni ham shu formatda qo'shish mumkin
};

let selectedItem = null;

function renderGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = games.map(game => `
        <div class="game-item" onclick="openGame('${game.id}')">
            <div class="game-img-container">
                <span class="badge ${game.type}">${game.badge}</span>
                <img src="${game.img}" alt="${game.name}">
            </div>
            <span class="game-label">${game.name}</span>
        </div>
    `).join('');
}

function openGame(gameId) {
    const game = games.find(g => g.id === gameId);
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('item-page').style.display = 'block';
    
    document.getElementById('product-title').innerText = game.name;
    document.getElementById('product-img').src = game.img;
    document.getElementById('product-subtitle').innerText = game.sub;

    const data = priceData[gameId];
    if(data) {
        renderCategories(data.categories);
        renderPrices(data.categories[0].items);
    }
}

function renderCategories(categories) {
    const container = document.getElementById('category-tabs');
    container.innerHTML = categories.map((c, i) => `
        <div class="cat-tab ${i===0?'active':''}" onclick="changeCategory(this, '${c.id}')">${c.name}</div>
    `).join('');
}

function renderPrices(items) {
    const container = document.getElementById('prices-container');
    container.innerHTML = items.map(item => `
        <div class="price-item" onclick="selectPrice(this, '${item.amount}')">
            <div class="price-info">
                <span>${item.amount}</span>
                <small>${item.price} so'm</small>
            </div>
        </div>
    `).join('');
}

function showMainPage() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('item-page').style.display = 'none';
}

function selectPrice(el, amount) {
    document.querySelectorAll('.price-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedItem = amount;
}

function confirmPurchase() {
    const id = document.getElementById('player-id').value;
    if(!id || !selectedItem) {
        tg.showAlert("Iltimos, ID kiriting va mahsulotni tanlang!");
        return;
    }
    tg.showConfirm(`Siz ${selectedItem} sotib olmoqchimisiz?`, (ok) => {
        if(ok) tg.sendData(JSON.stringify({ action: "buy", game: document.getElementById('product-title').innerText, id: id, item: selectedItem }));
    });
}

if (tg.initDataUnsafe.user) {
    document.getElementById('user-name').innerText = '@' + tg.initDataUnsafe.user.username;
}

renderGames();
