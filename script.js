let tg = window.Telegram.WebApp;
tg.expand();

let currentData = null;

const games = [
    { id: 'ff', name: "Free Fire", img: "img/ff.png" },
    { id: 'mlbb', name: "Mobile Legends", img: "img/mlbb.png" },
    { id: 'genshin', name: "Genshin Impact", img: "img/genshin.png" },
    { id: 'arena', name: "Arena Breakout", img: "img/arena.png" },
    { id: 'stars', name: "TG Stars", img: "img/stars.png" },
    { id: 'tg_prem', name: "TG Premium", img: "img/tg_prem.png" }
];

const priceData = {
    'ff': {
        categories: [
            { id: 'al', name: '💎 Алмазы', items: [{amount:"100",price:"14 000"},{amount:"310",price:"35 000"},{amount:"520",price:"55 000"}]},
            { id: 'va', name: '🎫 Ваучеры', items: [{amount:"Haftalik",price:"20 000"},{amount:"Oylik",price:"130 000"}]}
        ]
    },
    'mlbb': {
        categories: [
            { id: 'al', name: '💎 Алмазы', items: [{amount:"56",price:"12 000"},{amount:"279",price:"50 000"}]},
            { id: 'ps', name: '🎟 Pass', items: [{amount:"Twilight",price:"100 000"}]}
        ]
    },
    'stars': {
        categories: [{ id: 'st', name: '⭐ Stars', items: [{amount:"50",price:"12 000"},{amount:"100",price:"24 000"}]}]
    },
    'tg_prem': {
        categories: [{ id: 'pr', name: '⭐ Premium', items: [{amount:"3 oylik",price:"170 000"}]}]
    }
};

function renderGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = games.map(game => `
        <div class="game-item" onclick="openGame('${game.id}')">
            <div class="game-img-container"><img src="${game.img}"></div>
            <span class="game-label">${game.name}</span>
        </div>`).join('');
}

function openGame(gameId) {
    const game = games.find(g => g.id === gameId);
    currentData = priceData[gameId] || { categories: [{name:'Товары', items:[]}] };
    
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('item-page').style.display = 'block';
    document.getElementById('product-title').innerText = game.name;
    document.getElementById('product-img').src = game.img;

    const idSection = document.getElementById('id-section');
    if(gameId === 'mlbb') {
        idSection.innerHTML = `<div style="display:grid;grid-template-columns:2fr 1fr;gap:10px;">
            <div><span class="input-label">GAME ID</span><div class="input-inner"><input type="number" id="player-id"></div></div>
            <div><span class="input-label">ZONE</span><div class="input-inner"><input type="number" id="zone-id"></div></div>
        </div>`;
    } else if(gameId === 'tg_prem' || gameId === 'stars') {
        idSection.innerHTML = `<span class="input-label">TG USERNAME</span>
            <div class="input-inner"><input type="text" id="player-id" placeholder="@username"></div>
            <button class="self-buy-btn" onclick="fillSelf()">O'zim uchun</button>`;
    } else {
        idSection.innerHTML = `<span class="input-label">PLAYER ID</span><div class="input-inner"><input type="number" id="player-id"></div>`;
    }

    renderCats(currentData.categories);
    renderPrices(currentData.categories[0].items);
}

function renderCats(cats) {
    document.getElementById('category-tabs').innerHTML = cats.map((c, i) => 
        `<div class="cat-tab ${i===0?'active':''}" onclick="changeCat(this, '${c.id}')">${c.name}</div>`).join('');
}

function changeCat(el, catId) {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const category = currentData.categories.find(c => c.id === catId);
    if(category) renderPrices(category.items);
}

function renderPrices(items) {
    document.getElementById('prices-container').innerHTML = items.map(item => `
        <div class="price-item" onclick="selectItem(this)">
            <span>${item.amount}</span><br><small>${item.price} сум</small>
        </div>`).join('');
}

function fillSelf() {
    let user = tg.initDataUnsafe?.user;
    if(user?.username) document.getElementById('player-id').value = "@" + user.username;
}

function showMainPage() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('item-page').style.display = 'none';
}

function selectItem(el) {
    document.querySelectorAll('.price-item').forEach(i => i.style.borderColor = 'rgba(255,255,255,0.05)');
    el.style.borderColor = 'var(--accent)';
}

renderGames();
